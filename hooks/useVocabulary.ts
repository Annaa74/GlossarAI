import { useEffect, useCallback } from 'react';
import { useVocabStore } from '../stores/vocabStore';
import { useUserStore } from '../stores/userStore';
import { VocabCategory } from '../types';

export const useVocabulary = () => {
  const {
    vocabularies,
    currentCards,
    isLoading,
    error,
    selectedCategory,
    fetchVocabularies,
    fetchCardsForReview,
    setSelectedCategory,
    getVocabById,
    clearError,
  } = useVocabStore();

  const { user } = useUserStore();

  // Fetch vocabularies on mount
  useEffect(() => {
    if (vocabularies.length === 0) {
      fetchVocabularies();
    }
  }, []);

  // Fetch cards for review when user is available
  useEffect(() => {
    if (user?.id && currentCards.length === 0) {
      fetchCardsForReview(user.id);
    }
  }, [user?.id]);

  // Get cards filtered by category
  const getCardsByCategory = useCallback(
    (category: VocabCategory | 'all') => {
      if (category === 'all') {
        return currentCards;
      }
      return currentCards.filter((card) => card.category === category);
    },
    [currentCards]
  );

  // Get all vocabularies filtered by category
  const getVocabulariesByCategory = useCallback(
    (category: VocabCategory | 'all') => {
      if (category === 'all') {
        return vocabularies;
      }
      return vocabularies.filter((vocab) => vocab.category === category);
    },
    [vocabularies]
  );

  // Refresh cards
  const refreshCards = useCallback(async () => {
    if (user?.id) {
      await fetchCardsForReview(user.id);
    }
  }, [user?.id, fetchCardsForReview]);

  // Search vocabularies
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
