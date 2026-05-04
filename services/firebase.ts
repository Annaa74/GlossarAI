import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { Auth, getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'your-api-key',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);

  // Persist the auth session in AsyncStorage so users stay signed in across
  // cold starts. Without this the Firebase JS SDK defaults to in-memory
  // persistence on React Native and effectively logs the user out every
  // time the app process is killed.
  //
  // `getReactNativePersistence` ships in the RN bundle of firebase/auth
  // (dist/rn/index.js, picked by Metro via the package's "react-native"
  // field) but isn't in the public TypeScript types — hence the cast.
  const getReactNativePersistence = (
    firebaseAuth as unknown as {
      getReactNativePersistence?: (storage: unknown) => unknown;
    }
  ).getReactNativePersistence;

  try {
    if (getReactNativePersistence) {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage) as any,
      });
    } else {
      auth = getAuth(app);
    }
  } catch (e) {
    // initializeAuth throws if called twice (hot reload, etc.) — fall back.
    console.warn('[firebase] initializeAuth failed, using default persistence:', e);
    auth = getAuth(app);
  }
} else {
  app = getApps()[0];
  auth = getAuth(app);
}

db = getFirestore(app);

export { app, auth, db };
