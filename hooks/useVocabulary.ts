import { useEffect, useCallback } from 'react';
import { useVocabStore } from '../stores/vocabStore';
import { useUserStore } from '../stores/userStore';
import { VocabCategory } from '../types';

export const useVocabulary = () => {
  const vocabularies = useVocabStore((s) => s.vocabularies);
  const currentCards = useVocabStore((s) => s.currentCards);
  const isLoading = useVocabStore((s) => s.isLoading);
  const error = useVocabStore((s) => s.error);
  const selectedCategory = useVocabStore((s) => s.selectedCategory);
  const fetchVocabularies = useVocabStore((s) => s.fetchVocabularies);
  const fetchCardsForReview = useVocabStore((s) => s.fetchCardsForReview);
  const setSelectedCategory = useVocabStore((s) => s.setSelectedCategory);
  const getVocabById = useVocabStore((s) => s.getVocabById);
  const clearError = useVocabStore((s) => s.clearError);

  const userId = useUserStore((s) => s.user?.id);

  // Kick off vocabulary + review-card loads in parallel on mount / sign-in.
  // Previously these ran sequentially, so the home screen sat on the spinner
  // through both round-trips even though the deck only needs `vocabularies`.
  useEffect(() => {
    const tasks: Promise<unknown>[] = [];
    if (vocabularies.length === 0) tasks.push(fetchVocabularies());
    if (userId && currentCards.length === 0) tasks.push(fetchCardsForReview(userId));
    if (tasks.length > 0) Promise.all(tasks).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const getCardsByCategory = useCallback(
    (category: VocabCategory | 'all') => {
      if (category === 'all') return currentCards;
      return currentCards.filter((card) => card.category === category);
    },
    [currentCards]
  );

  const getVocabulariesByCategory = useCallback(
    (category: VocabCategory | 'all') => {
      if (category === 'all') return vocabularies;
      return vocabularies.filter((vocab) => vocab.category === category);
    },
    [vocabularies]
  );

  const refreshCards = useCallback(async () => {
    if (userId) await fetchCardsForReview(userId);
  }, [userId, fetchCardsForReview]);

  const searchVocabularies = useCallback(
    (query: string) => {
      const normalizedQuery = query.toLowerCase().trim();
      if (!normalizedQuery) return vocabularies;

      return vocabularies.filter(
        (vocab) =>
          vocab.term.toLowerCase().includes(normalizedQuery) ||
          vocab.definition.toLowerCase().includes(normalizedQuery) ||
          vocab.relatedTerms.some((term) => term.toLowerCase().includes(normalizedQuery))
      );
    },
    [vocabularies]
  );

  return {
    vocabularies,
    currentCards,
    isLoading,
    error,
    selectedCategory,
    setSelectedCategory,
    getCardsByCategory,
    getVocabulariesByCategory,
    refreshCards,
    searchVocabularies,
    getVocabById,
    clearError,
  };
};

export default useVocabulary;
