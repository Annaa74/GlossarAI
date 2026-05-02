import { useMemo } from 'react';
import { useVocabStore } from '../stores/vocabStore';
import { Vocabulary, VocabCategory } from '../types';

/**
 * Pick a deterministic "word of the day" so it's stable for a given date
 * but changes daily. Falls back to a random pick if the vocab list is empty.
 */
const dailySeed = (): number => {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
};

export const useWordOfTheDay = (
  category?: VocabCategory | 'all'
): Vocabulary | null => {
  const { vocabularies } = useVocabStore();

  return useMemo(() => {
    const pool =
      !category || category === 'all'
        ? vocabularies
        : vocabularies.filter((v) => v.category === category);

    if (pool.length === 0) return null;

    const seed = dailySeed();
    const idx = seed % pool.length;
    return pool[idx];
  }, [vocabularies, category]);
};

export default useWordOfTheDay;
