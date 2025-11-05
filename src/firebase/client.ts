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
  // This is the config provided for local development and client-side rendering.
  const webAppConfig = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
  if (webAppConfig) {
    try {
      return JSON.parse(webAppConfig);
    } catch (e) {
      console.error("Error parsing NEXT_PUBLIC_FIREBASE_CONFIG", e);
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

  // During server-side build, these might not be available. We should not throw an error here.
  // Instead, the server-side code should use its own initialization.
  // Returning an empty object and letting initializeApp handle it.
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
