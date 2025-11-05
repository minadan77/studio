'use client';

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Chrome } from 'lucide-react';
import { useFirebase } from '@/firebase/provider';

function LoginButton() {
  const router = useRouter();
  const { auth } = useFirebase();

  const handleSignIn = async () => {
    if (!auth) {
      console.error("Auth service is not available.");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  return (
    <Button onClick={handleSignIn} size="lg">
      <Chrome className="mr-2 h-5 w-5" />
      Iniciar Sesión con Google
    </Button>
  );
}


export default function LoginPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
          <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-primary mb-2">GuardiaSwap</h1>
          </div>
        <div>Cargando...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">GuardiaSwap</h1>
            <p className="text-muted-foreground">Inicia sesión para continuar</p>
        </div>
      <LoginButton />
    </div>
  );
}
