import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WidgetType =
  | 'word-of-the-day'
  | 'streak'
  | 'daily-goal'
  | 'due-cards'
  | 'category-spotlight'
  | 'quick-quiz';

export type WidgetSize = 'small' | 'medium' | 'large';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  enabled: boolean;
  category?: string;
}

export interface WidgetCatalogItem {
  type: WidgetType;
  title: string;
  description: string;
  icon: string;
  defaultSize: WidgetSize;
  supportedSizes: WidgetSize[];
  accent: [string, string];
}

export const WIDGET_CATALOG: WidgetCatalogItem[] = [
  {
    type: 'word-of-the-day',
    title: 'Word of the Day',
    description: 'A fresh term picked for you every day',
    icon: 'lightbulb-on',
    defaultSize: 'large',
    supportedSizes: ['medium', 'large'],
    accent: ['#6366F1', '#8B5CF6'],
  },
  {
    type: 'streak',
    title: 'Streak',
    description: 'Track your daily learning streak',
    icon: 'fire',
    defaultSize: 'small',
    supportedSizes: ['small', 'medium'],
    accent: ['#F97316', '#EF4444'],
  },
  {
    type: 'daily-goal',
    title: 'Daily Goal',
    description: 'Progress toward your review target',
    icon: 'target',
    defaultSize: 'medium',
    supportedSizes: ['small', 'medium'],
    accent: ['#10B981', '#059669'],
  },
  {
    type: 'due-cards',
    title: 'Due for Review',
    description: 'Cards waiting to be reviewed today',
    icon: 'clock-alert-outline',
    defaultSize: 'small',
    supportedSizes: ['small', 'medium'],
    accent: ['#EC4899', '#BE185D'],
  },
  {
    type: 'category-spotlight',
    title: 'Category Spotlight',
    description: 'A category to focus on next',
    icon: 'star-four-points',
    defaultSize: 'medium',
    supportedSizes: ['medium', 'large'],
    accent: ['#0EA5E9', '#6366F1'],
  },
  {
    type: 'quick-quiz',
    title: 'Quick Quiz',
    description: 'A pocket-sized quiz on tap',
    icon: 'head-question',
    defaultSize: 'small',
    supportedSizes: ['small', 'medium'],
    accent: ['#F59E0B', '#F97316'],
  },
];

const defaultWidgets: WidgetConfig[] = [
  { id: 'w-wotd', type: 'word-of-the-day', size: 'large', enabled: true },
  { id: 'w-streak', type: 'streak', size: 'small', enabled: true },
  { id: 'w-goal', type: 'daily-goal', size: 'small', enabled: true },
  { id: 'w-due', type: 'due-cards', size: 'small', enabled: false },
  { id: 'w-spot', type: 'category-spotlight', size: 'medium', enabled: false },
  { id: 'w-quiz', type: 'quick-quiz', size: 'small', enabled: false },
];

interface WidgetState {
  widgets: WidgetConfig[];
  toggleWidget: (id: string) => void;
  setWidgetSize: (id: string, size: WidgetSize) => void;
  reorderWidget: (id: string, direction: 'up' | 'down') => void;
  resetWidgets: () => void;
}

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set, get) => ({
      widgets: defaultWidgets,

      toggleWidget: (id: string) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, enabled: !w.enabled } : w
          ),
        }));
      },

      setWidgetSize: (id: string, size: WidgetSize) => {
        set((state) => ({
          widgets: state.widgets.map((w) => (w.id === id ? { ...w, size } : w)),
        }));
      },

      reorderWidget: (id: string, direction: 'up' | 'down') => {
        const { widgets } = get();
        const idx = widgets.findIndex((w) => w.id === id);
        if (idx < 0) return;

        const swapWith = direction === 'up' ? idx - 1 : idx + 1;
        if (swapWith < 0 || swapWith >= widgets.length) return;

        const next = [...widgets];
        [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
        set({ widgets: next });
      },

      resetWidgets: () => set({ widgets: defaultWidgets }),
    }),
    {
      name: 'widget-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
