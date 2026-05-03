import {
  processReview,
  swipeToQuality,
  isDueForReview,
  getUrgencyLevel,
  calculateStreak,
  getMasteryLevel,
  QUALITY,
} from '../services/srs';
import type { UserProgress } from '../types';

const makeProgress = (overrides: Partial<UserProgress> = {}): UserProgress => ({
  id: 'p1',
  vocabId: 'v1',
  userId: 'u1',
  status: 'learning',
  easeFactor: 2.5,
  interval: 1,
  nextReviewDate: new Date(),
  reviewCount: 1,
  lastReviewDate: null,
  ...overrides,
});

describe('swipeToQuality', () => {
  it('maps right to EASY', () => {
    expect(swipeToQuality('right')).toBe(QUALITY.EASY);
  });
  it('maps left to HARD', () => {
    expect(swipeToQuality('left')).toBe(QUALITY.HARD);
  });
  it('maps up to PERFECT', () => {
    expect(swipeToQuality('up')).toBe(QUALITY.PERFECT);
  });
});

describe('processReview', () => {
  it('initializes a new card with quality EASY', () => {
    const result = processReview(null, QUALITY.EASY);
    expect(result.reviewCount).toBe(1);
    expect(result.interval).toBeGreaterThanOrEqual(1);
    expect(result.easeFactor).toBeGreaterThan(0);
    expect(result.status).toBe('learning'); // new card not "known" yet
  });

  it('marks card as known after multiple high-quality reviews', () => {
    const after1 = processReview(null, QUALITY.PERFECT);
    const after2 = processReview(
      makeProgress({ reviewCount: 1, interval: after1.interval }),
      QUALITY.PERFECT
    );
    const after3 = processReview(
      makeProgress({ reviewCount: 2, interval: after2.interval }),
      QUALITY.PERFECT
    );
    expect(after3.status).toBe('known');
  });

  it('resets interval to 1 day on quality below 3', () => {
    const start = makeProgress({ reviewCount: 5, interval: 30, easeFactor: 2.6 });
    const result = processReview(start, QUALITY.INCORRECT);
    expect(result.interval).toBe(1);
    expect(result.status).toBe('learning');
  });

  it('never lets ease factor drop below the minimum (1.3)', () => {
    let progress: UserProgress | null = null;
    // Bombard with worst-quality answers.
    for (let i = 0; i < 10; i++) {
      const res = processReview(progress, QUALITY.BLACKOUT);
      progress = makeProgress({
        easeFactor: res.easeFactor,
        interval: res.interval,
        reviewCount: res.reviewCount,
      });
    }
    expect(progress!.easeFactor).toBeGreaterThanOrEqual(1.3);
  });
});

describe('isDueForReview', () => {
  it('returns true when next review date is in the past', () => {
    const past = new Date(Date.now() - 1000 * 60 * 60 * 24);
    expect(isDueForReview(makeProgress({ nextReviewDate: past }))).toBe(true);
  });
  it('returns false when next review date is in the future', () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24);
    expect(isDueForReview(makeProgress({ nextReviewDate: future }))).toBe(false);
  });
});

describe('getUrgencyLevel', () => {
  it('returns 0 for cards not yet due', () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24);
    expect(getUrgencyLevel(makeProgress({ nextReviewDate: future }))).toBe(0);
  });
  it('caps at 1 for cards more than 7 days overdue', () => {
    const stale = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
    expect(getUrgencyLevel(makeProgress({ nextReviewDate: stale }))).toBe(1);
  });
});

describe('calculateStreak', () => {
  it('returns 1 when there is no previous study date', () => {
    expect(calculateStreak(null, 0)).toBe(1);
  });
  it('keeps streak unchanged when called twice on the same day', () => {
    const today = new Date();
    expect(calculateStreak(today, 5)).toBe(5);
  });
  it('increments streak on consecutive day', () => {
    const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24);
    expect(calculateStreak(yesterday, 5)).toBe(6);
  });
  it('resets streak to 1 after a gap', () => {
    const threeDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 3);
    expect(calculateStreak(threeDaysAgo, 12)).toBe(1);
  });
});

describe('getMasteryLevel', () => {
  it('returns novice for new cards', () => {
    expect(getMasteryLevel(makeProgress({ status: 'new', reviewCount: 0 }))).toBe('novice');
  });
  it('returns mastered for long-interval high-EF cards', () => {
    expect(
      getMasteryLevel(
        makeProgress({ status: 'known', interval: 60, easeFactor: 2.8, reviewCount: 10 })
      )
    ).toBe('mastered');
  });
  it('returns learning for short intervals', () => {
    expect(
      getMasteryLevel(
        makeProgress({ status: 'learning', interval: 2, easeFactor: 2.0, reviewCount: 2 })
      )
    ).toBe('learning');
  });
});
