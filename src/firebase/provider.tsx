'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useMemo,
} from 'react';
import {
  onSnapshot,
  collection,
  query,
  orderBy,
  Firestore,
  getFirestore,
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import type { Shift } from '@/lib/definitions';
import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseApp,
  type FirebaseOptions,
} from 'firebase/app';

// Esta configuración es pública y segura.
// Al estar directamente en el código, eliminamos todos los errores de variables de entorno.
const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyCCozUn2lAcvVM6VUmSFlnkLnLdP1jJVnU',
  authDomain: 'studio-6792195927-50f25.firebaseapp.com',
  projectId: 'studio-6792195927-50f25',
  storageBucket: 'studio-6792195927-50f25.appspot.com',
  messagingSenderId: '835504863875',
  appId: '1:835504863875:web:240adbdea3fa388b57b9b6',
};

interface FirebaseContextValue {
  db: Firestore;
  auth: Auth;
  app: FirebaseApp;
  shifts: Shift[];
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

let firebaseApp: FirebaseApp;
if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setAuth(getAuth(firebaseApp));
    setDb(getFirestore(firebaseApp));
  }, []);

  useEffect(() => {
    if (!db) {
      return;
    }

    const q = query(collection(db, 'shifts'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const shiftsFromDb = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
        })) as Shift[];
        setShifts(shiftsFromDb);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching shifts:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db]);

  const value = useMemo(() => {
    if (db && auth) {
      return { app: firebaseApp, db, auth, shifts, loading };
    }
    return null;
  }, [db, auth, shifts, loading]);

  if (!isMounted || !value) {
    // Muestra un estado de carga mientras el componente se monta o Firebase se inicializa
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p>Inicializando Firebase...</p>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useShifts = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useShifts must be used within a FirebaseProvider');
  }
  return { shifts: context.shifts, loading: context.loading };
};
