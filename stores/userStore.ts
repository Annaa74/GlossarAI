import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import * as authService from '../services/auth';
import { calculateStreak } from '../services/srs';
import { useVocabStore } from './vocabStore';
import { reportError, trackEvent, AuthEvents } from '../services/observability';

// Pull a Firebase auth error code off an unknown thrown value so we can tag
// analytics events with WHY a flow failed without leaking the raw message.
const codeOf = (err: unknown): string | undefined =>
  err && typeof err === 'object' && 'code' in err
    ? String((err as { code: unknown }).code ?? '')
    : undefined;

// Run once after a successful signUp / signIn from any provider. If the
// previous session was a guest, push their local data to Firestore. Always
// hydrate cloud-side favorites afterward so the local Set reflects what's
// in the user's profile across devices.
const handlePostAuth = async (priorWasGuest: boolean, userId: string): Promise<void> => {
  const vocab = useVocabStore.getState();
  if (priorWasGuest) {
    await vocab.migrateGuestDataToCloud(userId);
  }
  await vocab.hydrateFavoritesFromRemote(userId);
};

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
  resendVerificationEmail: () => Promise<void>;
  reloadAuthUser: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateEmail: (currentPassword: string, newEmail: string) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
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
        const priorWasGuest = !!get().user?.id?.startsWith('guest-');
        set({ isLoading: true, error: null });
        trackEvent(AuthEvents.SigninStarted);
        try {
          const user = await authService.signIn(email, password);
          set({ user, isAuthenticated: true, isLoading: false });
          trackEvent(AuthEvents.SigninCompleted, { priorWasGuest });
          // Fire-and-forget — don't block the UI on the migration / hydration.
          handlePostAuth(priorWasGuest, user.id).catch(() => {});
        } catch (error: unknown) {
          set({ error: authService.mapAuthError(error), isLoading: false });
          reportError(error, { op: 'signIn' });
          trackEvent(AuthEvents.SigninFailed, { code: codeOf(error) });
          throw error;
        }
      },

      signUp: async (email: string, password: string, displayName: string) => {
        const priorWasGuest = !!get().user?.id?.startsWith('guest-');
        set({ isLoading: true, error: null });
        trackEvent(AuthEvents.SignupStarted);
        try {
          const user = await authService.signUp(email, password, displayName);
          set({ user, isAuthenticated: true, isLoading: false });
          trackEvent(AuthEvents.SignupCompleted, { priorWasGuest });
          handlePostAuth(priorWasGuest, user.id).catch(() => {});
        } catch (error: unknown) {
          set({ error: authService.mapAuthError(error), isLoading: false });
          reportError(error, { op: 'signUp' });
          trackEvent(AuthEvents.SignupFailed, { code: codeOf(error) });
          throw error;
        }
      },

      signInWithGoogle: async (idToken: string) => {
        const priorWasGuest = !!get().user?.id?.startsWith('guest-');
        set({ isLoading: true, error: null });
        try {
          const user = await authService.signInWithGoogleIdToken(idToken);
          set({ user, isAuthenticated: true, isLoading: false });
          trackEvent(AuthEvents.GoogleSigninCompleted, { priorWasGuest });
          handlePostAuth(priorWasGuest, user.id).catch(() => {});
        } catch (error: unknown) {
          set({ error: authService.mapAuthError(error), isLoading: false });
          reportError(error, { op: 'signInWithGoogle' });
          trackEvent(AuthEvents.GoogleSigninFailed, { code: codeOf(error) });
          throw error;
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          await authService.signOut();
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error: unknown) {
          set({ error: authService.mapAuthError(error), isLoading: false });
        }
      },

      deleteAccount: async (currentPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = get();
          // Guests have no Firebase record — just clear local state.
          if (user?.id?.startsWith('guest-')) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            trackEvent(AuthEvents.AccountDeleted, { guest: true });
            return;
          }
          await authService.deleteAccount(currentPassword);
          set({ user: null, isAuthenticated: false, isLoading: false });
          trackEvent(AuthEvents.AccountDeleted, { guest: false });
        } catch (error: unknown) {
          set({ error: authService.mapAuthError(error), isLoading: false });
          reportError(error, { op: 'deleteAccount' });
          trackEvent(AuthEvents.AccountDeletionFailed, { code: codeOf(error) });
          throw error;
        }
      },

      sendPasswordReset: async (email: string) => {
        set({ error: null });
        try {
          await authService.sendPasswordReset(email);
          trackEvent(AuthEvents.PasswordResetSent);
        } catch (error: unknown) {
          set({ error: authService.mapAuthError(error) });
          reportError(error, { op: 'sendPasswordReset' });
          trackEvent(AuthEvents.PasswordResetFailed, { code: codeOf(error) });
          throw error;
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      resendVerificationEmail: async () => {
        set({ error: null });
        try {
          await authService.resendVerificationEmail();
          trackEvent(AuthEvents.EmailVerificationResent);
        } catch (error: unknown) {
          set({ error: authService.mapAuthError(error) });
          reportError(error, { op: 'resendVerificationEmail' });
          throw error;
        }
      },

      reloadAuthUser: async () => {
        try {
          const wasVerified = !!get().user?.emailVerified;
          const refreshed = await authService.reloadAuthUser();
          if (refreshed) {
            set({ user: refreshed });
            // Catch the verification flip so the funnel sees it.
            if (!wasVerified && refreshed.emailVerified) {
              trackEvent(AuthEvents.EmailVerified);
            }
          }
        } catch (error: unknown) {
          set({ error: authService.mapAuthError(error) });
          reportError(error, { op: 'reloadAuthUser' });
        }
      },

      updatePassword: async (currentPassword: string, newPassword: string) => {
        set({ error: null });
        try {
          await authService.updateUserPassword(currentPassword, newPassword);
          trackEvent(AuthEvents.PasswordChanged);
        } catch (error: unknown) {
          set({ error: authService.mapAuthError(error) });
          reportError(error, { op: 'updatePassword' });
          throw error;
        }
      },

      updateEmail: async (currentPassword: string, newEmail: string) => {
        set({ error: null });
        try {
          await authService.updateUserEmail(currentPassword, newEmail);
          trackEvent(AuthEvents.EmailChangeRequested);
        } catch (error: unknown) {
          set({ error: authService.mapAuthError(error) });
          reportError(error, { op: 'updateEmail' });
          throw error;
        }
      },

      updateDisplayName: async (displayName: string) => {
        set({ error: null });
        try {
          await authService.updateUserDisplayName(displayName);
          // Mirror the change locally so the UI reflects it instantly.
          const { user } = get();
          if (user) set({ user: { ...user, displayName } });
          trackEvent(AuthEvents.DisplayNameChanged);
        } catch (error: unknown) {
          set({ error: authService.mapAuthError(error) });
          reportError(error, { op: 'updateDisplayName' });
          throw error;
        }
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
