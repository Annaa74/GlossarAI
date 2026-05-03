#!/usr/bin/env node
/**
 * R4 — Weekly AI-curated trending vocabulary generator.
 *
 * Pulls signal from Hacker News and ArXiv, sends them to Claude with a strict
 * JSON-schema prompt, and appends candidate terms (approved=false) to
 * vocab.json. The CI workflow then opens a PR for human review — only when
 * a maintainer flips approved=true and bumps the manifest version do users
 * see the new terms.
 *
 * Run locally:  ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-trending-vocab.mjs
 * Run in CI:    triggered weekly by .github/workflows/vocab-trending.yml
 *
 * Exit codes:
 *   0  success (vocab.json may or may not have been modified)
 *   1  fatal error (API key missing, network down, schema invalid)
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VOCAB_PATH = join(__dirname, '..', 'vocab.json');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-7';
const MAX_NEW_TERMS = Number(process.env.MAX_NEW_TERMS || 8);

const VALID_CATEGORIES = [
  'AI/ML',
  'Agentic AI',
  'Backend',
  'Frontend',
  'DevOps',
  'Cloud',
  'Databases',
  'Security',
];

if (!ANTHROPIC_API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY env var.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Signal collection
// ---------------------------------------------------------------------------

const fetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
};

const fetchText = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
};

/** Top 30 stories from HN, return their titles. */
const getHackerNewsTitles = async () => {
  const ids = await fetchJson('https://hacker-news.firebaseio.com/v0/topstories.json');
  const top = ids.slice(0, 30);
  const stories = await Promise.all(
    top.map((id) =>
      fetchJson(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).catch(() => null)
    )
  );
  return stories.filter(Boolean).map((s) => s.title).filter(Boolean);
};

/** Recent ArXiv cs.AI submissions — quick-and-dirty title extraction. */
const getArxivTitles = async () => {
  try {
    const xml = await fetchText(
      'http://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=20'
    );
    const matches = xml.match(/<title>([^<]+)<\/title>/g) || [];
    // Drop the first match (it's the feed title, not a paper title).
    return matches.slice(1).map((m) => m.replace(/<\/?title>/g, '').trim());
  } catch (e) {
    console.warn('[arxiv] fetch failed, skipping ArXiv signal:', e.message);
    return [];
  }
};

// ---------------------------------------------------------------------------
// Claude call
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a curator for a technical vocabulary flashcard app called GlosserAI.

Your job: from the recent tech-discourse signals provided, identify NOVEL technical terms that would make good flashcards for software engineers learning modern AI/ML, backend, frontend, devops, cloud, databases, or security topics.

Rules for each term you propose:
1. Must be a specific, definable technical concept — not a company name, product name, or general buzzword.
2. Definition must be one or two sentences, accurate and self-contained.
3. Example must show real-world usage in 1–2 sentences.
4. Difficulty 1=intro, 5=expert.
5. Category must be EXACTLY one of: AI/ML, Agentic AI, Backend, Frontend, DevOps, Cloud, Databases, Security.
6. Skip terms that are obviously well-known (e.g. "REST", "Docker", "SQL") — focus on what's genuinely emerging.
7. Skip terms you cannot define confidently. Better to return fewer high-quality terms than fill a quota with guesses.

Output STRICTLY valid JSON matching this schema, with no surrounding prose:
{
  "candidates": [
    {
      "term": string,
      "definition": string,
      "example": string,
      "category": "AI/ML"|"Agentic AI"|"Backend"|"Frontend"|"DevOps"|"Cloud"|"Databases"|"Security",
      "difficulty": 1|2|3|4|5,
      "relatedTerms": string[]
    }
  ]
}`;

const callClaude = async ({ hnTitles, arxivTitles, existingTerms }) => {
  const userMessage = `Recent Hacker News headlines:
${hnTitles.map((t) => `- ${t}`).join('\n')}

Recent ArXiv cs.AI paper titles:
${arxivTitles.map((t) => `- ${t}`).join('\n')}

Terms ALREADY in our deck (do NOT propose duplicates or close synonyms):
${existingTerms.slice(0, 200).map((t) => `- ${t}`).join('\n')}

Propose up to ${MAX_NEW_TERMS} new candidate terms.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${body}`);
  }

  const data = await res.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('Empty response from Claude.');

  // Strip ```json fences if present.
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Claude returned non-JSON: ${cleaned.slice(0, 500)}`);
  }

  if (!Array.isArray(parsed.candidates)) {
    throw new Error('Schema violation: missing candidates[].');
  }
  return parsed.candidates;
};

// ---------------------------------------------------------------------------
// Validation + merge
// ---------------------------------------------------------------------------

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

const sanitize = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const term = String(raw.term || '').trim();
  const definition = String(raw.definition || '').trim();
  const example = String(raw.example || '').trim();
  const category = raw.category;
  const difficulty = Number(raw.difficulty);
  if (!term || !definition || !example) return null;
  if (!VALID_CATEGORIES.includes(category)) return null;
  if (![1, 2, 3, 4, 5].includes(difficulty)) return null;
  return {
    id: `ai-${new Date().toISOString().slice(0, 10)}-${slugify(term)}`,
    term,
    definition,
    example,
    category,
    difficulty,
    relatedTerms: Array.isArray(raw.relatedTerms)
      ? raw.relatedTerms.map((t) => String(t)).slice(0, 5)
      : [],
    source: 'AI-generated',
    approved: false,
  };
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const main = async () => {
  const manifestRaw = await readFile(VOCAB_PATH, 'utf8');
  const manifest = JSON.parse(manifestRaw);
  const existingIds = new Set(manifest.terms.map((t) => t.id));
  const existingTerms = manifest.terms.map((t) => t.term);

  console.log('Fetching signals…');
  const [hnTitles, arxivTitles] = await Promise.all([
    getHackerNewsTitles(),
    getArxivTitles(),
  ]);
  console.log(`HN: ${hnTitles.length} titles, ArXiv: ${arxivTitles.length} titles.`);

  console.log('Calling Claude…');
  const raw = await callClaude({ hnTitles, arxivTitles, existingTerms });
  console.log(`Claude proposed ${raw.length} candidates.`);

  const fresh = raw
    .map(sanitize)
    .filter(Boolean)
    .filter((t) => !existingIds.has(t.id));
  console.log(`${fresh.length} candidates after validation + dedupe.`);

  if (fresh.length === 0) {
    console.log('Nothing to add. Exiting.');
    return;
  }

  manifest.terms.push(...fresh);
  manifest.updatedAt = new Date().toISOString();
  // Note: we intentionally do NOT bump `version` here — that requires a human
  // reviewer to flip approved=true and acknowledge the new terms.
  await writeFile(VOCAB_PATH, JSON.stringify(manifest, null, 2) + '\n');

  console.log(`Wrote ${fresh.length} new candidates to vocab.json:`);
  fresh.forEach((t) => console.log(`  - [${t.category}] ${t.term}`));
};

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
