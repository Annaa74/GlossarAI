/**
 * Thin observability shim. Lets every call site in the app use the same
 * reportError / trackEvent API regardless of which provider (if any) is
 * actually wired up.
 *
 * Default behaviour:
 *   - Dev:  pretty-prints to the JS console.
 *   - Prod: silent unless a provider is registered.
 *
 * To plug in Sentry / PostHog / Firebase Analytics later, call
 * `configureObservability({ onError, onEvent })` once at app boot (e.g.,
 * from app/_layout.tsx) — no other call sites need to change.
 */

type ErrorContext = Record<string, unknown>;
type EventProps = Record<string, unknown>;

interface ObservabilityProvider {
  onError?: (error: unknown, context?: ErrorContext) => void;
  onEvent?: (name: string, props?: EventProps) => void;
}

let provider: ObservabilityProvider = {};

export const configureObservability = (next: ObservabilityProvider): void => {
  provider = next;
};

const isDev = process.env.NODE_ENV !== 'production';

const errorCode = (error: unknown): string | undefined => {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: unknown }).code;
    if (typeof code === 'string') return code;
  }
  return undefined;
};

export const reportError = (error: unknown, context?: ErrorContext): void => {
  // Always surface in dev so engineers see the original error untouched.
  if (isDev) {
    const code = errorCode(error);

    console.error('[error]', code ?? '(no code)', error, context ?? {});
  }
  try {
    provider.onError?.(error, context);
  } catch {
    // Never let the reporter itself crash the app.
  }
};

export const trackEvent = (name: string, props?: EventProps): void => {
  if (isDev) {
    console.info('[event]', name, props ?? {});
  }
  try {
    provider.onEvent?.(name, props);
  } catch {
    // Same — analytics must never break the user flow.
  }
};

// Standardised event names so the analytics dashboard stays consistent.
export const AuthEvents = {
  SignupStarted: 'signup_started',
  SignupCompleted: 'signup_completed',
  SignupFailed: 'signup_failed',
  SigninStarted: 'signin_started',
  SigninCompleted: 'signin_completed',
  SigninFailed: 'signin_failed',
  GoogleSigninCompleted: 'google_signin_completed',
  GoogleSigninFailed: 'google_signin_failed',
  PasswordResetSent: 'password_reset_sent',
  PasswordResetFailed: 'password_reset_failed',
  PasswordChanged: 'password_changed',
  EmailChangeRequested: 'email_change_requested',
  DisplayNameChanged: 'display_name_changed',
  EmailVerificationResent: 'email_verification_resent',
  EmailVerified: 'email_verified',
  AccountDeleted: 'account_deleted',
  AccountDeletionFailed: 'account_deletion_failed',
} as const;
