import { useEffect, useMemo } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useUserStore } from '../stores/userStore';

// Required for the OAuth flow to dismiss the in-app browser when it returns.
// Wrapped so a misconfigured native module never blocks render.
try {
  WebBrowser.maybeCompleteAuthSession();
} catch (e) {
  console.warn('[google-auth] maybeCompleteAuthSession failed:', e);
}

const ANDROID_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const IOS_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const WEB_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

/**
 * Drives the Google OAuth flow and exchanges the ID token with Firebase via
 * the user store. Safe to call even when no client IDs are configured —
 * `ready` will simply stay false and the button stays disabled.
 *
 * Setup required outside of code:
 *   1. Firebase Console → Authentication → Sign-in method → enable "Google".
 *   2. Google Cloud Console → APIs & Services → Credentials, create OAuth
 *      2.0 client IDs:
 *        - Android (with this app's SHA-1 fingerprint and the package id
 *          `com.glosserai.app`)
 *        - Web (Firebase auto-creates one when you enable Google sign-in;
 *          reuse that client ID here)
 *        - iOS (only if you ship iOS later)
 *   3. Plug those IDs into `.env` as EXPO_PUBLIC_GOOGLE_*_CLIENT_ID.
 *   4. App must be running as a custom dev client (not Expo Go) for Android,
 *      since the Android client ID is keyed to the package + SHA-1.
 */
export const useGoogleAuth = () => {
  const signInWithGoogle = useUserStore((s) => s.signInWithGoogle);

  const hasAnyId = !!(ANDROID_ID || IOS_ID || WEB_ID);

  // Hooks must be called unconditionally; pass a placeholder webClientId when
  // nothing is configured so useAuthRequest can build internal state without
  // crashing. The `hasAnyId` flag below gates whether we ever surface the
  // request as "ready" to callers.
  const config = useMemo(
    () => ({
      androidClientId: ANDROID_ID,
      iosClientId: IOS_ID,
      webClientId: WEB_ID || 'placeholder.apps.googleusercontent.com',
    }),
    []
  );

  type AuthTuple = ReturnType<typeof Google.useAuthRequest>;
  let request: AuthTuple[0] | null = null;
  let response: AuthTuple[1] | null = null;
  let promptAsync: AuthTuple[2] | null = null;

  try {
    const result = Google.useAuthRequest(config);
    request = result[0];
    response = result[1];
    promptAsync = result[2];
  } catch (e) {
    console.warn('[google-auth] useAuthRequest threw, disabling button:', e);
  }

  useEffect(() => {
    if (!response || response.type !== 'success') return;
    const idToken = response.authentication?.idToken ?? (response.params as any)?.id_token;
    if (!idToken) return;
    signInWithGoogle(idToken).catch((err) => {
      console.error('[google-auth] firebase exchange failed:', err);
    });
  }, [response, signInWithGoogle]);

  const ready = hasAnyId && !!request && !!promptAsync;

  return {
    /** Trigger the Google sign-in flow. No-op if not configured. */
    prompt: async () => {
      if (!ready || !promptAsync) {
        console.warn('[google-auth] prompt() called but Google client IDs are not set in .env');
        return;
      }
      await promptAsync();
    },
    /** False until env vars are set and the request is built. */
    ready,
    response,
  };
};

export default useGoogleAuth;
