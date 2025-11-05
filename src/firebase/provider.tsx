'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { onSnapshot, collection, query, orderBy, Firestore, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import type { Shift } from '@/lib/definitions';

interface FirebaseContextValue {
  db: Firestore | null;
  auth: Auth | null;
  app: FirebaseApp | null;
  shifts: Shift[];
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextValue>({
  db: null,
  auth: null,
  app: null,
  shifts: [],
  loading: true,
});

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  const firebaseApp = useMemo(() => {
    const firebaseConfigString = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
    if (!firebaseConfigString) {
      console.error("Firebase config string is not available.");
      return null;
    }
    const firebaseConfig: FirebaseOptions = JSON.parse(firebaseConfigString);
    if (getApps().length === 0) {
      return initializeApp(firebaseConfig);
    }
    return getApp();
  }, []);

  const db = firebaseApp ? getFirestore(firebaseApp) : null;
  const auth = firebaseApp ? getAuth(firebaseApp) : null;

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'shifts'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const shiftsFromDb = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Shift[];
      setShifts(shiftsFromDb);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching shifts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const value = { app: firebaseApp, db, auth, shifts, loading };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useFirebase must be used within a FirebaseProvider');
    }
    return context;
};

export const useShifts = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useShifts must be used within a FirebaseProvider');
    }
    return { shifts: context.shifts, loading: context.loading };
};