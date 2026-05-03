import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GrowthState {
  /** ms epoch of the last completed growth cycle, or 0 if never run. */
  lastGrowthAt: number;
  /** IDs from GROWTH_POOL that have been released into the active library. */
  releasedIds: string[];
  /**
   * Recently-released term IDs along with the timestamp they were added.
   * Trimmed to the last ~30 entries.
   */
  recentlyAdded: { id: string; addedAt: number }[];

  markGrowthCycle: (newIds: string[]) => void;
}

const HISTORY_LIMIT = 30;

export const useGrowthStore = create<GrowthState>()(
  persist(
    (set, get) => ({
      lastGrowthAt: 0,
      releasedIds: [],
      recentlyAdded: [],

      markGrowthCycle: (newIds: string[]) => {
        const now = Date.now();
        const { releasedIds, recentlyAdded } = get();
        const merged = [...recentlyAdded, ...newIds.map((id) => ({ id, addedAt: now }))].slice(
          -HISTORY_LIMIT
        );
        set({
          lastGrowthAt: now,
          releasedIds: [...releasedIds, ...newIds],
          recentlyAdded: merged,
        });
      },
    }),
    {
      name: 'growth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
