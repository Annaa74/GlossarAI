import { useCallback, useMemo } from 'react';
import { useVocabStore } from '../stores/vocabStore';
import { useUserStore } from '../stores/userStore';
import { UserProgress, SwipeDirection } from '../types';
import { getMasteryLevel, isDueForReview, getUrgencyLevel } from '../services/srs';

export const useSpacedRepetition = () => {
  const { userProgress, currentCards, processSwipe, fetchUserProgress } = useVocabStore();
  const { user, updateStreak } = useUserStore();

  // Handle card swipe
  const handleSwipe = useCallback(
    async (vocabId: string, direction: SwipeDirection) => {
      if (!user?.id) return;

      await processSwipe(user.id, vocabId, direction);

      // Update streak after reviewing a card
      await updateStreak();
    },
    [user?.id, processSwipe, updateStreak]
  );

  // Get progress for a specific card
  const getCardProgress = useCallback(
    (vocabId: string): UserProgress | null => {
      return userProgress.get(vocabId) || null;
    },
    [userProgress]
  );

  // Get mastery level for a card
  const getCardMasteryLevel = useCallback(
    (vocabId: string) => {
      const progress = userProgress.get(vocabId);
      if (!progress) return 'novice';
      return getMasteryLevel(progress);
    },
    [userProgress]
  );

  // Get cards due for review
  const dueCards = useMemo(() => {
    const due: { vocabId: string; urgency: number }[] = [];

    userProgress.forEach((progress, vocabId) => {
      if (isDueForReview(progress)) {
        due.push({
          vocabId,
          urgency: getUrgencyLevel(progress),
        });
      }
    });

    // Sort by urgency (most overdue first)
    return due.sort((a, b) => b.urgency - a.urgency);
  }, [userProgress]);

  // Get statistics
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
      reviewedToday: 0, // TODO: Track daily reviews
    };
  }, [userProgress, currentCards]);

  // Get next review time for a card
  const getNextReviewTime = useCallback(
    (vocabId: string): Date | null => {
      const progress = userProgress.get(vocabId);
      return progress?.nextReviewDate || null;
    },
    [userProgress]
  );

  // Refresh user progress
  const refreshProgress = useCallback(async () => {
    if (user?.id) {
      await fetchUserProgress(user.id);
    }
  }, [user?.id, fetchUserProgress]);

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
