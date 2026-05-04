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
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: (currentPassword: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
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

      signInWithGoogle: async (idToken: string) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.signInWithGoogleIdToken(idToken);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || 'Google sign-in failed',
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

      deleteAccount: async (currentPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = get();
          // Guests have no Firebase record — just clear local state.
          if (user?.id?.startsWith('guest-')) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }
          await authService.deleteAccount(currentPassword);
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error: any) {
          const message =
            error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential'
              ? 'Incorrect password.'
              : error?.code === 'auth/too-many-requests'
                ? 'Too many attempts. Try again in a few minutes.'
                : error?.message || 'Failed to delete account';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      sendPasswordReset: async (email: string) => {
        set({ error: null });
        try {
          await authService.sendPasswordReset(email);
        } catch (error: any) {
          set({ error: error.message || 'Failed to send reset email' });
          throw error;
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      updateStreak: async () => {
        const { user } = get();
        if (!user) return;

        // Hot-path guard: this is called after every swipe. If we already
        // recorded a study day today, calculateStreak returns the same value
        // — skip the set() and the Firestore write to keep swiping smooth.
        if (user.lastStudyDate) {
          const last = new Date(user.lastStudyDate);
          last.setHours(0, 0, 0, 0);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (last.getTime() === today.getTime()) return;
        }

        const newStreak = calculateStreak(user.lastStudyDate, user.streak);
        const updatedUser = {
          ...user,
          streak: newStreak,
          lastStudyDate: new Date(),
        };

        set({ user: updatedUser });

        if (!user.id.startsWith('guest-')) {
          try {
            await authService.updateStreak(user.id, newStreak);
          } catch (error) {
            console.error('Failed to update streak:', error);
          }
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
