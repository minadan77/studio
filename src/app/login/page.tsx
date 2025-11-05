'use client';

import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Chrome } from 'lucide-react';
import { useFirebase } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';

function LoginButton() {
  const { auth } = useFirebase();

  const handleSignIn = async () => {
    if (!auth) {
      console.error('Auth service is not available.');
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Error starting sign-in redirect:', error);
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
  const { user, loading: userLoading } = useUser();
  const { auth } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [processingRedirect, setProcessingRedirect] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!auth) return;

    // This effect runs once on mount to check for a redirect result.
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          // User successfully signed in via redirect.
          // The useUser hook will handle the redirect to '/'.
        }
      })
      .catch((error) => {
        console.error('Error getting redirect result:', error);
        if (error.code === 'auth/unauthorized-domain') {
          toast({
            title: 'Error de Dominio',
            description:
              'El dominio no está autorizado. Por favor, añádelo en la configuración de Firebase Auth.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error de Inicio de Sesión',
            description: 'Hubo un problema al iniciar sesión.',
            variant: 'destructive',
          });
        }
      })
      .finally(() => {
        setProcessingRedirect(false);
      });
  }, [auth, router, toast]);

  useEffect(() => {
    // Redirect to home if user is already logged in and not loading.
    if (!userLoading && !processingRedirect && user) {
      router.push('/');
    }
  }, [user, userLoading, processingRedirect, router]);

  const showLoading = userLoading || processingRedirect || !isClient;

  if (showLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">GuardiaSwap</h1>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Only show login button if not loading and no user is present
  if (!user) {
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

  // If we are here, it means user is logged in, but the redirect effect hasn't fired yet.
  // Show loading until the redirect happens.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
       <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">GuardiaSwap</h1>
          <p className="text-muted-foreground">Redirigiendo...</p>
        </div>
    </div>
  );
}
