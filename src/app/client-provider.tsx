'use client';

import { FirebaseProvider } from '@/firebase/provider';
import { ReactNode } from 'react';

export default function ClientProvider({ children }: { children: ReactNode }) {
  // Ahora FirebaseProvider solo se encarga de los datos de Firestore, no de la autenticación.
  return <FirebaseProvider>{children}</FirebaseProvider>;
}
