import { UserProgress, CardStatus } from '../types';

/**
 * SM-2 Spaced Repetition Algorithm Implementation
 *
 * Based on the SuperMemo SM-2 algorithm with modifications for our use case:
 * - Swipe right (known) = quality 4-5
 * - Swipe left (learning) = quality 2-3
 * - Tap to review = quality 3
 */

// Quality ratings based on user actions
export const QUALITY = {
  BLACKOUT: 0, // Complete blackout, no recall
  INCORRECT: 1, // Incorrect response, but remembered upon seeing answer
  HARD: 2, // Correct response, but with serious difficulty
  MEDIUM: 3, // Correct response, with some hesitation
  EASY: 4, // Correct response, with slight hesitation
  PERFECT: 5, // Perfect response, instant recall
} as const;

// Default ease factor for new cards
const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

// Review intervals in days
const INTERVALS = {
  FIRST: 1,
  SECOND: 3,
  MIN: 1,
  MAX: 365,
};

export interface ReviewResult {
  status: CardStatus;
  easeFactor: number;
  interval: number;
  nextReviewDate: Date;
  reviewCount: number;
}

/**
 * Calculate the new ease factor based on quality of response
 * EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 */
const calculateEaseFactor = (currentEF: number, quality: number): number => {
  const newEF = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  return Math.max(MIN_EASE_FACTOR, newEF);
};

/**
 * Calculate the next review interval
 */
const calculateInterval = (
  reviewCount: number,
  previousInterval: number,
  easeFactor: number,
  quality: number
): number => {
  // If quality is less than 3, reset to beginning
  if (quality < 3) {
    return INTERVALS.FIRST;
  }

  let interval: number;

  if (reviewCount === 0) {
    interval = INTERVALS.FIRST;
  } else if (reviewCount === 1) {
    interval = INTERVALS.SECOND;
  } else {
    interval = Math.round(previousInterval * easeFactor);
  }

  // Clamp interval between min and max
  return Math.max(INTERVALS.MIN, Math.min(INTERVALS.MAX, interval));
};

/**
 * Process a card review and return the updated progress
 */
export const processReview = (
  currentProgress: UserProgress | null,
  quality: number
): ReviewResult => {
  const now = new Date();

  // Initialize default values for new cards
  const reviewCount = currentProgress?.reviewCount ?? 0;
  const currentInterval = currentProgress?.interval ?? 0;
  const currentEF = currentProgress?.easeFactor ?? DEFAULT_EASE_FACTOR;

  // Calculate new values
  const newEF = calculateEaseFactor(currentEF, quality);
  const newInterval = calculateInterval(reviewCount, currentInterval, newEF, quality);

  // Determine status based on quality and review count
  let status: CardStatus;
  if (quality >= 4 && reviewCount >= 2) {
    status = 'known';
  } else if (quality >= 3) {
    status = 'learning';
  } else {
    status = 'learning';
  }

  // Calculate next review date
  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    status,
    easeFactor: newEF,
    interval: newInterval,
    nextReviewDate,
    reviewCount: reviewCount + 1,
  };
};

/**
 * Convert swipe direction to quality rating
 */
export const swipeToQuality = (direction: 'left' | 'right' | 'up'): number => {
  switch (direction) {
    case 'right': // Known
      return QUALITY.EASY;
    case 'left': // Learning/Hard
      return QUALITY.HARD;
    case 'up': // Favorite (still counts as known)
      return QUALITY.PERFECT;
    default:
      return QUALITY.MEDIUM;
  }
};

/**
 * Get cards that are due for review
 */
export const isDueForReview = (progress: UserProgress): boolean => {
  const now = new Date();
  return progress.nextReviewDate <= now;
};

/**
 * Get urgency level (how overdue a card is)
 * Returns a value from 0 (not due) to 1 (very overdue)
 */
export const getUrgencyLevel = (progress: UserProgress): number => {
  const now = new Date();
  const dueDate = progress.nextReviewDate;

  if (dueDate > now) return 0;

  const overdueDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

  // Normalize to 0-1 range, capping at 7 days overdue
  return Math.min(1, overdueDays / 7);
};

/**
 * Calculate streak based on consecutive study days
 */
export const calculateStreak = (lastStudyDate: Date | null, currentStreak: number): number => {
  if (!lastStudyDate) return 1;

  const now = new Date();
  const lastStudy = new Date(lastStudyDate);

  // Reset time to start of day for comparison
  now.setHours(0, 0, 0, 0);
  lastStudy.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((now.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day, streak unchanged
    return currentStreak;
  } else if (diffDays === 1) {
    // Next day, increment streak
    return currentStreak + 1;
  } else {
    // More than 1 day gap, reset streak
    return 1;
  }
};

/**
 * Get mastery level based on review count and ease factor
 */
export const getMasteryLevel = (
  progress: UserProgress
): 'novice' | 'learning' | 'familiar' | 'proficient' | 'mastered' => {
  const { reviewCount, easeFactor, status, interval } = progress;

  if (status === 'new' || reviewCount === 0) {
    return 'novice';
  }

  if (interval >= 30 && easeFactor >= 2.5) {
    return 'mastered';
  }

  if (interval >= 14 && easeFactor >= 2.3) {
    return 'proficient';
  }

  if (interval >= 7 && easeFactor >= 2.0) {
    return 'familiar';
  }

  return 'learning';
};
