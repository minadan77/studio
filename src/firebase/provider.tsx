'use client';
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { db } from '@/firebase';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import type { Shift } from '@/lib/definitions';

interface FirebaseContextValue {
  shifts: Shift[];
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const value = { shifts, loading };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (!context) {
        throw new Error('useFirebase must be used within a FirebaseProvider');
    }
    return context;
};

// Custom hook to be used by components that need shift data
export const useShifts = () => {
    return useFirebase();
}
