import { useCallback, useMemo } from 'react';
import { useVocabStore } from '../stores/vocabStore';
import { useUserStore } from '../stores/userStore';
import { UserProgress, SwipeDirection } from '../types';
import { getMasteryLevel, isDueForReview, getUrgencyLevel } from '../services/srs';

/**
 * Lightweight hook for the swipe hot path. Subscribes only to stable action
 * refs so the consuming component doesn't re-render every time userProgress
 * or currentCards change mid-swipe.
 */
export const useSwipeHandler = () => {
  const userId = useUserStore((s) => s.user?.id);
  const processSwipe = useVocabStore((s) => s.processSwipe);
  const updateStreak = useUserStore((s) => s.updateStreak);

  const handleSwipe = useCallback(
    (vocabId: string, direction: SwipeDirection) => {
      if (!userId) return;
      // Fire-and-forget: don't block the UI thread on Firestore. processSwipe
      // updates local state synchronously before its await, so the next card
      // is ready instantly.
      void processSwipe(userId, vocabId, direction);
      // updateStreak is a same-day no-op once we've updated today, so it's
      // cheap to call here. Still don't await it — keep the swipe path sync.
      void updateStreak();
    },
    [userId, processSwipe, updateStreak]
  );

  return { handleSwipe };
};

/**
 * Full SRS hook with derived stats. Use this on screens that surface progress
 * data (e.g. progress screen) — NOT on the home screen swipe path, where it
 * would re-run on every userProgress change.
 */
export const useSpacedRepetition = () => {
  const userProgress = useVocabStore((s) => s.userProgress);
  const currentCards = useVocabStore((s) => s.currentCards);
  const fetchUserProgress = useVocabStore((s) => s.fetchUserProgress);
  const userId = useUserStore((s) => s.user?.id);
  const { handleSwipe } = useSwipeHandler();

  const getCardProgress = useCallback(
    (vocabId: string): UserProgress | null => userProgress.get(vocabId) || null,
    [userProgress]
  );

  const getCardMasteryLevel = useCallback(
    (vocabId: string) => {
      const progress = userProgress.get(vocabId);
      if (!progress) return 'novice';
      return getMasteryLevel(progress);
    },
    [userProgress]
  );

  const dueCards = useMemo(() => {
    const due: { vocabId: string; urgency: number }[] = [];
    userProgress.forEach((progress, vocabId) => {
      if (isDueForReview(progress)) {
        due.push({ vocabId, urgency: getUrgencyLevel(progress) });
      }
    });
    return due.sort((a, b) => b.urgency - a.urgency);
  }, [userProgress]);

  const stats = useMemo(() => {
    let total = 0;
    let known = 0;
    let learning = 0;
    let dueCount = 0;

    userProgress.forEach((progress) => {
      total++;
      if (progress.status === 'known') known++;
      else if (progress.status === 'learning') learning++;
      if (isDueForReview(progress)) dueCount++;
    });

    return {
      total,
      known,
      learning,
      new: currentCards.length - total,
      dueCount,
      reviewedToday: 0,
    };
  }, [userProgress, currentCards]);

  const getNextReviewTime = useCallback(
    (vocabId: string): Date | null => userProgress.get(vocabId)?.nextReviewDate || null,
    [userProgress]
  );

  const refreshProgress = useCallback(async () => {
    if (userId) await fetchUserProgress(userId);
  }, [userId, fetchUserProgress]);

  return {
    handleSwipe,
    getCardProgress,
    getCardMasteryLevel,
    dueCards,
    stats,
    getNextReviewTime,
    refreshProgress,
  };
};

export default useSpacedRepetition;
