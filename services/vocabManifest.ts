import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vocabulary, VocabCategory } from '../types';
import { useVocabStore } from '../stores/vocabStore';

/**
 * Layer 1 vocabulary freshness pipeline.
 *
 * The app fetches a small JSON manifest on launch. When the remote `version`
 * is greater than what we last applied, we merge any new terms into the local
 * vocab store. This decouples vocab updates from app-store releases — push a
 * commit to the manifest, every user sees new terms on their next launch.
 *
 * Schema:
 *   {
 *     "version": 1,
 *     "updatedAt": "2026-05-03T00:00:00Z",
 *     "terms": [{ id, term, definition, example, category, difficulty,
 *                 relatedTerms, source, approved }]
 *   }
 *
 * Terms with `approved: false` are skipped — used by the Layer 3 AI pipeline
 * to publish candidates that we want to review before showing to users.
 */

const STATE_KEY = '@glosserai/vocab-manifest-state';
const FETCH_TIMEOUT_MS = 8000;

const VALID_CATEGORIES: VocabCategory[] = [
  'AI/ML',
  'Agentic AI',
  'Backend',
  'Frontend',
  'DevOps',
  'Cloud',
  'Databases',
  'Security',
];

interface ManifestTerm {
  id: string;
  term: string;
  definition: string;
  example: string;
  category: VocabCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  relatedTerms?: string[];
  source?: 'AI-generated' | 'manual' | 'community';
  approved?: boolean;
}

interface Manifest {
  version: number;
  updatedAt: string;
  terms: ManifestTerm[];
}

interface ManifestState {
  appliedVersion: number;
  lastCheckedAt: number;
}

const getManifestUrl = (): string | undefined => {
  const url = process.env.EXPO_PUBLIC_VOCAB_MANIFEST_URL;
  return url && url.trim().length > 0 ? url.trim() : undefined;
};

const loadState = async (): Promise<ManifestState> => {
  try {
    const raw = await AsyncStorage.getItem(STATE_KEY);
    if (!raw) return { appliedVersion: 0, lastCheckedAt: 0 };
    return JSON.parse(raw);
  } catch {
    return { appliedVersion: 0, lastCheckedAt: 0 };
  }
};

const saveState = async (state: ManifestState): Promise<void> => {
  await AsyncStorage.setItem(STATE_KEY, JSON.stringify(state));
};

const fetchWithTimeout = async (url: string, ms: number): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal, cache: 'no-store' });
  } finally {
    clearTimeout(timer);
  }
};

const isValidTerm = (t: any): t is ManifestTerm => {
  if (!t || typeof t !== 'object') return false;
  if (typeof t.id !== 'string' || t.id.length === 0) return false;
  if (typeof t.term !== 'string' || t.term.length === 0) return false;
  if (typeof t.definition !== 'string' || t.definition.length === 0) return false;
  if (typeof t.example !== 'string') return false;
  if (!VALID_CATEGORIES.includes(t.category)) return false;
  if (![1, 2, 3, 4, 5].includes(t.difficulty)) return false;
  return true;
};

const toVocabulary = (t: ManifestTerm): Vocabulary => ({
  id: t.id,
  term: t.term,
  definition: t.definition,
  example: t.example,
  category: t.category,
  difficulty: t.difficulty,
  relatedTerms: Array.isArray(t.relatedTerms) ? t.relatedTerms : [],
  createdAt: new Date(),
  source: t.source ?? 'manual',
  approved: t.approved ?? true,
});

/**
 * Fetch the manifest, validate it, and merge any new approved terms into the
 * vocab store. No-op when no URL is configured or when the remote version
 * isn't newer than what we last applied. Network/parse failures are logged
 * but never thrown — vocab updates must never break app launch.
 */
export const syncRemoteVocab = async (): Promise<{
  added: number;
  remoteVersion: number | null;
}> => {
  const url = getManifestUrl();
  if (!url) return { added: 0, remoteVersion: null };

  let manifest: Manifest;
  try {
    const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
    if (!res.ok) {
      console.warn(`[vocab-manifest] HTTP ${res.status} from ${url}`);
      return { added: 0, remoteVersion: null };
    }
    manifest = (await res.json()) as Manifest;
  } catch (e) {
    console.warn('[vocab-manifest] fetch failed:', e);
    return { added: 0, remoteVersion: null };
  }

  if (typeof manifest?.version !== 'number' || !Array.isArray(manifest.terms)) {
    console.warn('[vocab-manifest] invalid schema');
    return { added: 0, remoteVersion: null };
  }

  const state = await loadState();
  await saveState({ ...state, lastCheckedAt: Date.now() });

  if (manifest.version <= state.appliedVersion) {
    return { added: 0, remoteVersion: manifest.version };
  }

  const validApproved = manifest.terms.filter((t) => isValidTerm(t) && t.approved !== false);

  const vocab = useVocabStore.getState();
  const existingIds = new Set(vocab.vocabularies.map((v) => v.id));
  const fresh = validApproved.filter((t) => !existingIds.has(t.id)).map(toVocabulary);

  if (fresh.length > 0) {
    useVocabStore.setState({
      vocabularies: [...vocab.vocabularies, ...fresh],
      currentCards: [...vocab.currentCards, ...fresh],
    });
  }

  await saveState({ appliedVersion: manifest.version, lastCheckedAt: Date.now() });

  return { added: fresh.length, remoteVersion: manifest.version };
};
