import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, NotificationSettings } from '../types';
import * as notificationService from '../services/notifications';

interface SettingsState {
  settings: AppSettings;
  notificationSettings: NotificationSettings;
  isFirstLaunch: boolean;

  // Actions
  updateTheme: (theme: AppSettings['theme']) => void;
  updateDailyGoal: (goal: number) => void;
  toggleSound: () => void;
  toggleHaptic: () => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  setFirstLaunchComplete: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'light',
  dailyGoal: 10,
  soundEnabled: true,
  hapticEnabled: true,
};

const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  reminderTime: '09:00',
  frequency: 'daily',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      notificationSettings: defaultNotificationSettings,
      isFirstLaunch: true,

      updateTheme: (theme: AppSettings['theme']) => {
        set((state) => ({
          settings: { ...state.settings, theme },
        }));
      },

      updateDailyGoal: (goal: number) => {
        set((state) => ({
          settings: { ...state.settings, dailyGoal: Math.max(1, Math.min(100, goal)) },
        }));
      },

      toggleSound: () => {
        set((state) => ({
          settings: { ...state.settings, soundEnabled: !state.settings.soundEnabled },
        }));
      },

      toggleHaptic: () => {
        set((state) => ({
          settings: { ...state.settings, hapticEnabled: !state.settings.hapticEnabled },
        }));
      },

      updateNotificationSettings: async (updates: Partial<NotificationSettings>) => {
        const { notificationSettings } = get();
        const newSettings = { ...notificationSettings, ...updates };

        set({ notificationSettings: newSettings });

        // Update scheduled notifications
        try {
          await notificationService.updateNotificationSettings(newSettings);
        } catch (error) {
          console.error('Failed to update notification settings:', error);
        }
      },

      setFirstLaunchComplete: () => {
        set({ isFirstLaunch: false });
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
