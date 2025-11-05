'use client';

import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseOptions,
} from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FirebaseProvider, useShifts } from './provider';
import { useUser } from './auth/use-user';

const getFirebaseConfig = (): FirebaseOptions => {
  // For server-side rendering, the config is stringified and passed as an environment variable.
  // This is the variable set by Firebase App Hosting.
  if (process.env.FIREBASE_CONFIG) {
    return JSON.parse(process.env.FIREBASE_CONFIG);
  }

  // For client-side, the config is available on NEXT_PUBLIC_FIREBASE_CONFIG.
  // This is set by Firebase Studio in the local development environment.
  if (process.env.NEXT_PUBLIC_FIREBASE_CONFIG) {
    return JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG);
  }

  // As a final fallback for other environments, try to build from individual variables.
  const fallbackConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (fallbackConfig.apiKey && fallbackConfig.projectId) {
    return fallbackConfig;
  }

  throw new Error(
    'Firebase configuration is not found. Check your environment variables.'
  );
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(getFirebaseConfig()) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  // In a real app, you would want to connect to emulators here
  // import { connectAuthEmulator } from 'firebase/auth';
  // import { connectFirestoreEmulator } from 'firebase/firestore';
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

export { app, auth, db, FirebaseProvider, useShifts, useUser };
