import { runGrowthCycle } from '../services/growthEngine';
import { useGrowthStore } from '../stores/growthStore';
import { useVocabStore } from '../stores/vocabStore';
import { GROWTH_POOL } from '../data/growthPool';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const resetStores = () => {
  useGrowthStore.setState({ lastGrowthAt: 0, releasedIds: [], recentlyAdded: [] });
  useVocabStore.setState({ vocabularies: [], currentCards: [] });
};

describe('runGrowthCycle', () => {
  beforeEach(() => {
    resetStores();
  });

  it('on first ever boot does NOT release a batch but stamps the clock', () => {
    const result = runGrowthCycle();
    expect(result.released).toBe(0);

    const { lastGrowthAt, releasedIds } = useGrowthStore.getState();
    expect(lastGrowthAt).toBeGreaterThan(0);
    expect(releasedIds).toEqual([]);
    expect(useVocabStore.getState().vocabularies).toEqual([]);
  });

  it('does nothing if less than a week has passed since last cycle', () => {
    useGrowthStore.setState({ lastGrowthAt: Date.now() - 1000 * 60 * 60 }); // 1 hour ago
    const before = useVocabStore.getState().vocabularies.length;
    const result = runGrowthCycle();
    expect(result.released).toBe(0);
    expect(useVocabStore.getState().vocabularies.length).toBe(before);
  });

  it('releases a batch and appends to vocabularies + currentCards after a week', () => {
    useGrowthStore.setState({
      lastGrowthAt: Date.now() - WEEK_MS - 1000,
      releasedIds: [],
      recentlyAdded: [],
    });

    const result = runGrowthCycle();
    expect(result.released).toBeGreaterThan(0);

    const { vocabularies, currentCards } = useVocabStore.getState();
    expect(vocabularies.length).toBe(result.released);
    expect(currentCards.length).toBe(result.released);

    // All released IDs should come from the growth pool.
    const poolIds = new Set(GROWTH_POOL.map((v) => v.id));
    vocabularies.forEach((v) => expect(poolIds.has(v.id)).toBe(true));
  });

  it('does not double-release the same term across consecutive cycles', () => {
    useGrowthStore.setState({
      lastGrowthAt: Date.now() - WEEK_MS - 1000,
      releasedIds: [],
      recentlyAdded: [],
    });
    runGrowthCycle();
    const firstReleased = [...useGrowthStore.getState().releasedIds];

    // Backdate again to trigger a second cycle.
    useGrowthStore.setState({ lastGrowthAt: Date.now() - WEEK_MS - 1000 });
    runGrowthCycle();
    const secondReleased = useGrowthStore.getState().releasedIds;

    // No overlap between the two batches.
    const firstSet = new Set(firstReleased);
    const overlap = secondReleased
      .filter((id, i) => i >= firstReleased.length)
      .filter((id) => firstSet.has(id));
    expect(overlap).toEqual([]);
  });

  it('handles an exhausted pool gracefully', () => {
    // Mark every pool term as already released.
    useGrowthStore.setState({
      lastGrowthAt: Date.now() - WEEK_MS - 1000,
      releasedIds: GROWTH_POOL.map((v) => v.id),
      recentlyAdded: [],
    });
    const result = runGrowthCycle();
    expect(result.released).toBe(0);
    // Clock should still be reset so we don't loop on this branch.
    const newLast = useGrowthStore.getState().lastGrowthAt;
    expect(newLast).toBeGreaterThan(Date.now() - 5000);
  });
});
