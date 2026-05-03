import { Vocabulary, UserProgress, VocabCategory, CategoryProgress } from '../types';

/**
 * R1 — Smart deck composer.
 *
 * Builds the next study queue by mixing three buckets in a fixed ratio,
 * instead of dumping every card or random-shuffling. The split is intentional:
 *
 *   60% — cards due for SRS review (overdue first, then due-today)
 *   25% — fresh cards from the user's weakest category by mastery %
 *   15% — interleaved cards from other categories for variety
 *
 * Why this ratio: SRS is the single highest-yield learning signal, so it
 * dominates. Weakest-category bias surfaces material the user would otherwise
 * avoid. The interleave bucket keeps sessions from feeling repetitive.
 *
 * Brand-new users with no progress fall back to a plain shuffle. We don't
 * try to be smart with zero data.
 */

interface ComposeInput {
  vocabularies: Vocabulary[];
  progress: Map<string, UserProgress>;
  categoryProgress?: CategoryProgress[];
  count?: number;
}

const DEFAULT_DECK_SIZE = 30;

export const composeSmartDeck = ({
  vocabularies,
  progress,
  categoryProgress,
  count = DEFAULT_DECK_SIZE,
}: ComposeInput): Vocabulary[] => {
  if (vocabularies.length === 0) return [];

  if (progress.size === 0) {
    return shuffle(vocabularies).slice(0, count);
  }

  const dueQuota = Math.floor(count * 0.6);
  const weakQuota = Math.floor(count * 0.25);
  const interleaveQuota = Math.max(0, count - dueQuota - weakQuota);

  const now = Date.now();
  const dueCards = vocabularies
    .filter((v) => {
      const p = progress.get(v.id);
      if (!p) return false;
      return new Date(p.nextReviewDate).getTime() <= now;
    })
    .sort((a, b) => {
      const ap = progress.get(a.id)!;
      const bp = progress.get(b.id)!;
      return new Date(ap.nextReviewDate).getTime() - new Date(bp.nextReviewDate).getTime();
    })
    .slice(0, dueQuota);

  const seen = new Set(dueCards.map((c) => c.id));
  const weakest = pickWeakestCategory(categoryProgress);
  const weakCards = weakest
    ? vocabularies
        .filter((v) => v.category === weakest && !seen.has(v.id) && !progress.has(v.id))
        .slice(0, weakQuota)
    : [];

  weakCards.forEach((c) => seen.add(c.id));
  const interleaveCards = shuffle(vocabularies.filter((v) => !seen.has(v.id))).slice(
    0,
    interleaveQuota
  );

  return shuffle([...dueCards, ...weakCards, ...interleaveCards]);
};

const pickWeakestCategory = (categoryProgress?: CategoryProgress[]): VocabCategory | null => {
  if (!categoryProgress?.length) return null;
  const studied = categoryProgress.filter((c) => c.total > 0);
  if (studied.length === 0) return null;
  return studied.reduce((min, c) => (c.percentMastered < min.percentMastered ? c : min)).category;
};

const shuffle = <T>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
