import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  verifyBeforeUpdateEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';

// Map Firebase auth error codes to user-facing copy. Firebase throws errors
// shaped like { code: 'auth/invalid-credential', message: 'Firebase: Error (auth/...)' }
// — we never want the raw `message` reaching the UI.
export const mapAuthError = (err: unknown): string => {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect.';
    case 'auth/email-already-in-use':
      return 'An account already exists with that email. Try signing in.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 8 characters with a number.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again in a few minutes.';
    case 'auth/network-request-failed':
      return "You're offline. Check your connection and try again.";
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Contact support.';
    case 'auth/requires-recent-login':
      return 'Please sign in again to continue.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with that email under a different sign-in method.';
    case 'auth/invalid-action-code':
    case 'auth/expired-action-code':
      return 'That link has expired or already been used. Request a new one.';
    default:
      // Last-resort fallback. We deliberately don't surface err.message here
      // because Firebase's raw messages leak the SDK internals.
      return 'Something went wrong. Please try again.';
  }
};

// Create a new user account
export const signUp = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // Update display name in Firebase Auth
  await updateProfile(firebaseUser, { displayName });

  // Kick off the verification email. Don't fail signup if this throws (rate
  // limits, transient network) — the user can resend from the home banner.
  try {
    await sendEmailVerification(firebaseUser);
  } catch (e) {
    console.warn('[auth] sendEmailVerification on signup failed:', e);
  }

  // Create user document in Firestore. emailVerified is intentionally NOT
  // persisted here — it lives on the Firebase Auth record and we read it
  // fresh on every sign-in / reload.
  const userData: User = {
    id: firebaseUser.uid,
    email: firebaseUser.email || email,
    displayName,
    streak: 0,
    lastStudyDate: null,
    notificationSettings: {
      enabled: true,
      reminderTime: '09:00',
      frequency: 'daily',
    },
    createdAt: new Date(),
    emailVerified: firebaseUser.emailVerified,
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), {
    id: userData.id,
    email: userData.email,
    displayName: userData.displayName,
    streak: 0,
    lastStudyDate: null,
    notificationSettings: userData.notificationSettings,
    createdAt: userData.createdAt.toISOString(),
  });

  return userData;
};

// Sign in existing user
export const signIn = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // Get user data from Firestore
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      id: firebaseUser.uid,
      email: data.email,
      displayName: data.displayName,
      streak: data.streak || 0,
      lastStudyDate: data.lastStudyDate ? new Date(data.lastStudyDate) : null,
      notificationSettings: data.notificationSettings || {
        enabled: true,
        reminderTime: '09:00',
        frequency: 'daily',
      },
      createdAt: new Date(data.createdAt),
      emailVerified: firebaseUser.emailVerified,
    };
  }

  // If no Firestore doc exists, create one
  const userData: User = {
    id: firebaseUser.uid,
    email: firebaseUser.email || email,
    displayName: firebaseUser.displayName || email.split('@')[0],
    streak: 0,
    lastStudyDate: null,
    notificationSettings: {
      enabled: true,
      reminderTime: '09:00',
      frequency: 'daily',
    },
    createdAt: new Date(),
    emailVerified: firebaseUser.emailVerified,
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), {
    id: userData.id,
    email: userData.email,
    displayName: userData.displayName,
    streak: 0,
    lastStudyDate: null,
    notificationSettings: userData.notificationSettings,
    createdAt: userData.createdAt.toISOString(),
  });

  return userData;
};

// Sign in with a Google ID token (obtained via expo-auth-session on the client).
// Exchanges the token with Firebase, then ensures a Firestore user doc exists.
export const signInWithGoogleIdToken = async (idToken: string): Promise<User> => {
  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(auth, credential);
  const firebaseUser = userCredential.user;

  const userDocRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      id: firebaseUser.uid,
      email: data.email,
      displayName: data.displayName,
      streak: data.streak || 0,
      lastStudyDate: data.lastStudyDate ? new Date(data.lastStudyDate) : null,
      notificationSettings: data.notificationSettings || {
        enabled: true,
        reminderTime: '09:00',
        frequency: 'daily',
      },
      createdAt: new Date(data.createdAt),
      emailVerified: firebaseUser.emailVerified,
    };
  }

  // First sign-in for this Google account — create the Firestore profile.
  // Google has already verified the email, so emailVerified is true.
  const userData: User = {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || (firebaseUser.email?.split('@')[0] ?? 'User'),
    streak: 0,
    lastStudyDate: null,
    notificationSettings: {
      enabled: true,
      reminderTime: '09:00',
      frequency: 'daily',
    },
    createdAt: new Date(),
    emailVerified: firebaseUser.emailVerified,
  };

  await setDoc(userDocRef, {
    id: userData.id,
    email: userData.email,
    displayName: userData.displayName,
    streak: 0,
    lastStudyDate: null,
    notificationSettings: userData.notificationSettings,
    createdAt: userData.createdAt.toISOString(),
  });

  return userData;
};

// Sign out
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

// Get current user data
export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;

  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  if (!userDoc.exists()) return null;

  const data = userDoc.data();
  return {
    id: firebaseUser.uid,
    email: data.email,
    displayName: data.displayName,
    streak: data.streak || 0,
    lastStudyDate: data.lastStudyDate ? new Date(data.lastStudyDate) : null,
    notificationSettings: data.notificationSettings || {
      enabled: true,
      reminderTime: '09:00',
      frequency: 'daily',
    },
    createdAt: new Date(data.createdAt),
    emailVerified: firebaseUser.emailVerified,
  };
};

// Resend the email verification link to the currently signed-in user.
// Throws if no user is signed in or rate-limited.
export const resendVerificationEmail = async (): Promise<void> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new Error('You are not signed in.');
  if (firebaseUser.emailVerified) return; // already verified, nothing to send
  await sendEmailVerification(firebaseUser);
};

// Force a refresh of the cached Firebase user (so emailVerified picks up
// after the user clicks the link). Returns the latest User snapshot, or
// null if not signed in.
export const reloadAuthUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;
  await firebaseUser.reload();
  return getCurrentUser();
};

// Reauthenticate the current email/password user. Required before any
// sensitive operation per Firebase's recent-login policy.
const reauth = async (currentPassword: string): Promise<FirebaseUser> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new Error('You are not signed in.');
  if (!firebaseUser.email) {
    throw new Error('This account has no email and cannot be modified from the app.');
  }
  const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
  await reauthenticateWithCredential(firebaseUser, credential);
  return firebaseUser;
};

// Change the current user's password. Requires their current password to
// satisfy Firebase's recent-login requirement.
export const updateUserPassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const firebaseUser = await reauth(currentPassword);
  await updatePassword(firebaseUser, newPassword);
};

// Change the current user's email. Sends a verification link to the NEW
// address; the email actually changes on the auth record only after the
// user clicks that link. (verifyBeforeUpdateEmail vs the deprecated
// updateEmail — the latter is blocked for security on most projects.)
export const updateUserEmail = async (currentPassword: string, newEmail: string): Promise<void> => {
  const firebaseUser = await reauth(currentPassword);
  await verifyBeforeUpdateEmail(firebaseUser, newEmail);
};

// Update displayName on both Firebase Auth and the Firestore profile doc.
// No reauth needed — this is a non-sensitive change.
export const updateUserDisplayName = async (displayName: string): Promise<void> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new Error('You are not signed in.');
  await updateProfile(firebaseUser, { displayName });
  await setDoc(doc(db, 'users', firebaseUser.uid), { displayName }, { merge: true });
};

// Subscribe to auth state changes
export const subscribeToAuthChanges = (
  callback: (user: FirebaseUser | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

// Update user streak
export const updateStreak = async (userId: string, streak: number): Promise<void> => {
  await setDoc(
    doc(db, 'users', userId),
    {
      streak,
      lastStudyDate: new Date().toISOString(),
    },
    { merge: true }
  );
};

// Update notification settings
export const updateNotificationSettings = async (
  userId: string,
  settings: User['notificationSettings']
): Promise<void> => {
  await setDoc(doc(db, 'users', userId), { notificationSettings: settings }, { merge: true });
};

// Send a password-reset email. Resolves silently on success; throws if Firebase
// rejects the email (e.g. invalid format). Note: Firebase intentionally does
// not error when the email is unknown, to avoid leaking which addresses are
// registered.
export const sendPasswordReset = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

// Permanently delete the current user's account and Firestore profile.
// Requires the user's current password to satisfy Firebase's recent-login
// requirement for sensitive operations. Order matters: we delete the
// Firestore doc while still authenticated, THEN delete the auth user. If the
// auth deletion fails partway, the doc is already gone and the user can
// sign up fresh; the reverse would orphan a doc the client can no longer
// read or delete.
export const deleteAccount = async (currentPassword: string): Promise<void> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new Error('You are not signed in.');
  if (!firebaseUser.email) {
    throw new Error('This account has no email and cannot be deleted from the app.');
  }

  const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
  await reauthenticateWithCredential(firebaseUser, credential);

  await deleteDoc(doc(db, 'users', firebaseUser.uid));
  await deleteUser(firebaseUser);
};
