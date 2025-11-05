'use client';

import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// This function safely parses the config from the server environment variable.
const getFirebaseConfig = (): FirebaseOptions => {
  try {
    // This is the config provided by App Hosting during deployment.
    const config = process.env.FIREBASE_CONFIG;
    if (config) {
      return JSON.parse(config);
    }
    // This is the config provided for local development.
    const webAppConfig = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
     if (webAppConfig) {
      return JSON.parse(webAppConfig);
    }
    throw new Error("Firebase config not found in environment variables.");
  } catch (error) {
    console.error("Error parsing Firebase config:", error);
    // Fallback to individual variables if the main one is not available
    // This is useful for local development.
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
  }
};


const firebaseConfig = getFirebaseConfig();

function initializeFirebase() {
  if (getApps().length) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

export const app = initializeFirebase();
export const auth = getAuth(app);
export const db = getFirestore(app);

if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectAuthEmulator(auth, 'http://localhost:9099');
}

export { FirebaseProvider, useShifts } from './provider';
export { useUser } from './auth/use-user';
