'use client';

import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseOptions,
} from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const getFirebaseConfig = (): FirebaseOptions => {
  // For server-side rendering in production, the config is stringified and passed as an environment variable.
  // This is the variable set by Firebase App Hosting.
  if (process.env.FIREBASE_CONFIG) {
    try {
      return JSON.parse(process.env.FIREBASE_CONFIG);
    } catch (e) {
      console.error('Error parsing FIREBASE_CONFIG', e);
    }
  }

  // For client-side rendering and local development, the config is available on NEXT_PUBLIC_FIREBASE_CONFIG.
  // This is set by Firebase Studio.
  if (process.env.NEXT_PUBLIC_FIREBASE_CONFIG) {
    try {
      return JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG);
    } catch (e) {
      console.error('Error parsing NEXT_PUBLIC_FIREBASE_CONFIG', e);
    }
  }
  
  // Fallback for other environments, trying to build from individual variables.
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

  // If no config is found, we should not throw an error on the server during build,
  // as it might be a server-side only process. Instead, we return an empty object
  // and let the client-side code handle the missing configuration.
  return {};
};

// Initialize Firebase for the client-side
const app = !getApps().length ? initializeApp(getFirebaseConfig()) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// It's safe to connect to emulators here as this is a client file.
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  // In a real app, you would want to connect to emulators here
  // import { connectAuthEmulator } from 'firebase/auth';
  // import { connectFirestoreEmulator } from 'firebase/firestore';
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

export { app, auth, db };
