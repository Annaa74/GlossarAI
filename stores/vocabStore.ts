import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vocabulary, UserProgress, VocabCategory, CategoryProgress } from '../types';
import * as vocabService from '../services/vocabulary';
import { processReview, swipeToQuality } from '../services/srs';
import { composeSmartDeck } from '../services/deckComposer';

interface VocabState {
  vocabularies: Vocabulary[];
  currentCards: Vocabulary[];
  userProgress: Map<string, UserProgress>;
  categoryProgress: CategoryProgress[];
  favorites: Set<string>;
  isLoading: boolean;
  error: string | null;
  selectedCategory: VocabCategory | 'all';

  // Actions
  fetchVocabularies: () => Promise<void>;
  fetchCardsForReview: (userId: string) => Promise<void>;
  fetchUserProgress: (userId: string) => Promise<void>;
  reloadDeck: () => void;
  /**
   * R1 — replace currentCards with a smart blend of due-for-review,
   * weakest-category, and interleaved cards. See services/deckComposer.ts.
   */
  loadSmartDeck: (size?: number) => void;
  processSwipe: (
    userId: string,
    vocabId: string,
    direction: 'left' | 'right' | 'up'
  ) => Promise<void>;
  toggleFavorite: (vocabId: string) => void;
  setSelectedCategory: (category: VocabCategory | 'all') => void;
  getCategoryProgress: (userId: string) => Promise<void>;
  getVocabById: (id: string) => Vocabulary | undefined;
  clearError: () => void;
}

export const useVocabStore = create<VocabState>()(
  persist(
    (set, get) => ({
      vocabularies: [],
      currentCards: [],
      userProgress: new Map(),
      categoryProgress: [],
      favorites: new Set(),
      isLoading: false,
      error: null,
      selectedCategory: 'all',

      fetchVocabularies: async () => {
        // Don't wipe an already-populated local library by hitting an
        // unconfigured Firestore — keep what we have and let the seed/growth
        // engine populate it offline.
        const existing = get().vocabularies;
        if (existing.length > 0) return;

        set({ isLoading: true, error: null });
        try {
          const vocabularies = await vocabService.getAllVocabularies();
          set({ vocabularies, isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch vocabularies',
            isLoading: false,
          });
        }
      },

      fetchCardsForReview: async (userId: string) => {
        // Guest mode = no Firestore. Hydrate currentCards from the persisted
        // vocabularies, since persist drops currentCards across reloads.
        if (userId.startsWith('guest-')) {
          const { vocabularies, currentCards } = get();
          if (currentCards.length === 0 && vocabularies.length > 0) {
            set({ currentCards: vocabularies });
          }
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const cards = await vocabService.getCardsForReview(userId);
          set({ currentCards: cards, isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch cards for review',
            isLoading: false,
          });
        }
      },

      reloadDeck: () => {
        // Always restore the full vocab list as the active queue. Callers can
        // filter by category at render time — scoping currentCards itself
        // would hide other categories until the next manual reload.
        const { vocabularies } = get();
        set({ currentCards: vocabularies });
      },

      loadSmartDeck: (size?: number) => {
        const { vocabularies, userProgress, categoryProgress } = get();
        const deck = composeSmartDeck({
          vocabularies,
          progress: userProgress,
          categoryProgress,
          count: size,
        });
        set({ currentCards: deck });
      },

      fetchUserProgress: async (userId: string) => {
        if (userId.startsWith('guest-')) return; // local-only, nothing to fetch
        try {
          const progressList = await vocabService.getAllUserProgress(userId);
          const progressMap = new Map<string, UserProgress>();
          progressList.forEach((p) => progressMap.set(p.vocabId, p));
          set({ userProgress: progressMap });
        } catch (error: any) {
          console.error('Failed to fetch user progress:', error);
        }
      },

      processSwipe: async (userId: string, vocabId: string, direction: 'left' | 'right' | 'up') => {
        const { userProgress, favorites, currentCards } = get();

        // Handle favorite
        if (direction === 'up') {
          const newFavorites = new Set(favorites);
          newFavorites.add(vocabId);
          set({ favorites: newFavorites });
        }

        // Get current progress for this card
        const currentProgress = userProgress.get(vocabId) || null;

        // Calculate new progress using SRS
        const quality = swipeToQuality(direction);
        const reviewResult = processReview(currentProgress, quality);

        // Create updated progress
        const updatedProgress: UserProgress = {
          id: vocabId,
          vocabId,
          userId,
          status: reviewResult.status,
          easeFactor: reviewResult.easeFactor,
          interval: reviewResult.interval,
          nextReviewDate: reviewResult.nextReviewDate,
          reviewCount: reviewResult.reviewCount,
          lastReviewDate: new Date(),
        };

        // Update local state
        const newProgressMap = new Map(userProgress);
        newProgressMap.set(vocabId, updatedProgress);

        // Remove card from current cards
        const newCurrentCards = currentCards.filter((c) => c.id !== vocabId);

        set({
          userProgress: newProgressMap,
          currentCards: newCurrentCards,
        });

        // Persist to Firebase (skipped in guest mode — no project to write to).
        if (!userId.startsWith('guest-')) {
          try {
            await vocabService.updateUserProgress(userId, updatedProgress);
          } catch (error) {
            console.error('Failed to save progress:', error);
          }
        }
      },

      toggleFavorite: (vocabId: string) => {
        const { favorites } = get();
        const newFavorites = new Set(favorites);

        if (newFavorites.has(vocabId)) {
          newFavorites.delete(vocabId);
        } else {
          newFavorites.add(vocabId);
        }

        set({ favorites: newFavorites });
      },

      setSelectedCategory: (category: VocabCategory | 'all') => {
        set({ selectedCategory: category });
      },

      getCategoryProgress: async (userId: string) => {
        const categories: VocabCategory[] = [
          'AI/ML',
          'Agentic AI',
          'Backend',
          'Frontend',
          'DevOps',
          'Cloud',
          'Databases',
          'Security',
        ];

        // Guest mode (or no user): derive everything from the local store.
        if (userId.startsWith('guest-')) {
          const { vocabularies, userProgress } = get();
          const categoryProgress: CategoryProgress[] = categories.map((category) => {
            const inCat = vocabularies.filter((v) => v.category === category);
            let known = 0;
            let learning = 0;
            inCat.forEach((v) => {
              const p = userProgress.get(v.id);
              if (p?.status === 'known') known++;
              else if (p?.status === 'learning') learning++;
            });
            return {
              category,
              total: inCat.length,
              known,
              learning,
              new: inCat.length - known - learning,
              percentMastered: inCat.length > 0 ? Math.round((known / inCat.length) * 100) : 0,
            };
          });
          set({ categoryProgress });
          return;
        }

        try {
          const stats = await vocabService.getCategoryStats(userId);
          const categoryProgress: CategoryProgress[] = categories.map((category) => {
            const stat = stats[category];
            return {
              category,
              total: stat.total,
              known: stat.known,
              learning: stat.learning,
              new: stat.total - stat.known - stat.learning,
              percentMastered: stat.total > 0 ? Math.round((stat.known / stat.total) * 100) : 0,
            };
          });
          set({ categoryProgress });
        } catch (error) {
          console.error('Failed to get category progress:', error);
        }
      },

      getVocabById: (id: string) => {
        const { vocabularies } = get();
        return vocabularies.find((v) => v.id === id);
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'vocab-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        vocabularies: state.vocabularies,
        favorites: Array.from(state.favorites),
      }),
      merge: (persisted: any, current) => ({
        ...current,
        ...persisted,
        favorites: new Set(persisted?.favorites || []),
        userProgress: new Map(),
      }),
    }
  )
);
