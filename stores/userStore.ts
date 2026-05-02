import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import * as authService from '../services/auth';
import { calculateStreak } from '../services/srs';

interface UserState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateStreak: () => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.signIn(email, password);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to sign in',
            isLoading: false,
          });
          throw error;
        }
      },

      signUp: async (email: string, password: string, displayName: string) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.signUp(email, password, displayName);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to sign up',
            isLoading: false,
          });
          throw error;
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          await authService.signOut();
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to sign out',
            isLoading: false,
          });
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      updateStreak: async () => {
        const { user } = get();
        if (!user) return;

        const newStreak = calculateStreak(user.lastStudyDate, user.streak);
        const updatedUser = {
          ...user,
          streak: newStreak,
          lastStudyDate: new Date(),
        };

        set({ user: updatedUser });

        try {
          await authService.updateStreak(user.id, newStreak);
        } catch (error) {
          console.error('Failed to update streak:', error);
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
