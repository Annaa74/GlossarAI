import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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
  await setDoc(
    doc(db, 'users', userId),
    { notificationSettings: settings },
    { merge: true }
  );
};
