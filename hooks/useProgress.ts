import { useEffect, useMemo } from 'react';
import { useVocabStore } from '../stores/vocabStore';
import { useUserStore } from '../stores/userStore';
import { CategoryProgress, VocabCategory } from '../types';

export const useProgress = () => {
  const { user } = useUserStore();
  const {
    vocabularies,
    userProgress,
    categoryProgress,
    getCategoryProgress,
  } = useVocabStore();

  // Fetch category progress on mount
  useEffect(() => {
    if (user?.id) {
      getCategoryProgress(user.id);
    }
  }, [user?.id]);

  // Calculate overall stats
  const overallStats = useMemo(() => {
    let totalCards = vocabularies.length;
    let knownCards = 0;
    let learningCards = 0;

    userProgress.forEach((progress) => {
      if (progress.status === 'known') knownCards++;
      else if (progress.status === 'learning') learningCards++;
    });

    const newCards = totalCards - knownCards - learningCards;
    const percentMastered = totalCards > 0 ? Math.round((knownCards / totalCards) * 100) : 0;

    return {
      totalCards,
      knownCards,
      learningCards,
      newCards,
      percentMastered,
    };
  }, [vocabularies, userProgress]);

  // Get progress for a specific category
  const getCategoryStats = (category: VocabCategory): CategoryProgress | null => {
    return categoryProgress.find((p) => p.category === category) || null;
  };

  // Get top categories by progress
  const topCategories = useMemo(() => {
    return [...categoryProgress]
      .sort((a, b) => b.percentMastered - a.percentMastered)
      .slice(0, 3);
  }, [categoryProgress]);

  // Get categories that need attention (low progress)
  const needsAttention = useMemo(() => {
    return categoryProgress
      .filter((p) => p.total > 0 && p.percentMastered < 30)
      .sort((a, b) => a.percentMastered - b.percentMastered);
  }, [categoryProgress]);

  // Daily goal tracking
  const dailyProgress = useMemo(() => {
    // This would need to track reviews done today
    // For now, return placeholder
    return {
      reviewed: 0,
      goal: 10,
      percentComplete: 0,
    };
  }, []);

  // Refresh progress data
  const refreshProgress = async () => {
    if (user?.id) {
      await getCategoryProgress(user.id);
    }
  };

  return {
    overallStats,
    categoryProgress,
    getCategoryStats,
    topCategories,
    needsAttention,
    dailyProgress,
    refreshProgress,
  };
};

export default useProgress;
