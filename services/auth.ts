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
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';

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

  // Create user document in Firestore
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
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), {
    ...userData,
    createdAt: userData.createdAt.toISOString(),
    lastStudyDate: null,
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
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), {
    ...userData,
    createdAt: userData.createdAt.toISOString(),
    lastStudyDate: null,
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
    };
  }

  // First sign-in for this Google account — create the Firestore profile.
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
  };

  await setDoc(userDocRef, {
    ...userData,
    createdAt: userData.createdAt.toISOString(),
    lastStudyDate: null,
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
  };
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
