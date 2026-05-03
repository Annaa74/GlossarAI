import { GROWTH_POOL } from '../data/growthPool';
import { useGrowthStore } from '../stores/growthStore';
import { useVocabStore } from '../stores/vocabStore';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const BATCH_SIZE = 8;

/**
 * If at least a week has passed since the last cycle, release the next batch
 * of held-back vocabulary terms into the active library. No-op otherwise.
 *
 * On the very first run we skip seeding the recent list — the user should
 * see "growth" only after a real week of use, not on day one.
 */
export const runGrowthCycle = (): { released: number; nextRunAt: number } => {
  const { lastGrowthAt, releasedIds, markGrowthCycle } = useGrowthStore.getState();
  const now = Date.now();

  // First-ever boot: don't release anything, just stamp the clock so the
  // next cycle is scheduled exactly one week from now.
  if (lastGrowthAt === 0) {
    markGrowthCycle([]);
    return { released: 0, nextRunAt: now + WEEK_MS };
  }

  if (now - lastGrowthAt < WEEK_MS) {
    return { released: 0, nextRunAt: lastGrowthAt + WEEK_MS };
  }

  const releasedSet = new Set(releasedIds);
  const candidates = GROWTH_POOL.filter((v) => !releasedSet.has(v.id));
  if (candidates.length === 0) {
    // Pool exhausted — keep the timer fresh so we don't loop on this branch.
    markGrowthCycle([]);
    return { released: 0, nextRunAt: now + WEEK_MS };
  }

  const batch = candidates.slice(0, BATCH_SIZE);
  const batchIds = batch.map((v) => v.id);

  // Append into the active vocab + currentCards so they show up in the deck.
  const vocab = useVocabStore.getState();
  const existingIds = new Set(vocab.vocabularies.map((v) => v.id));
  const fresh = batch.filter((v) => !existingIds.has(v.id));

  if (fresh.length > 0) {
    useVocabStore.setState({
      vocabularies: [...vocab.vocabularies, ...fresh],
      currentCards: [...vocab.currentCards, ...fresh],
    });
  }

  markGrowthCycle(batchIds);
  return { released: fresh.length, nextRunAt: now + WEEK_MS };
};

/** IDs added in the last 7 days — drives the Discover widget's "new" badge. */
export const getRecentlyAddedIds = (): string[] => {
  const cutoff = Date.now() - WEEK_MS;
  return useGrowthStore
    .getState()
    .recentlyAdded.filter((r) => r.addedAt >= cutoff)
    .map((r) => r.id);
};
