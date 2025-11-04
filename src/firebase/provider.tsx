'use client';
import { createContext, useContext } from 'react';

// This is a placeholder provider. In a real app, you would
// initialize Firebase here and pass the instances down.
const FirebaseContext = createContext(null);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseContext.Provider value={null}>{children}</FirebaseContext.Provider>
  );
}

export const useFirebase = () => useContext(FirebaseContext);
