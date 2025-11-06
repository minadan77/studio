'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { KeyRound } from 'lucide-react';

const CORRECT_KEY = 'enfermeria00';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Comprobar si el usuario ya tiene acceso
    if (sessionStorage.getItem('app-access-granted') === 'true') {
      router.push('/');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_KEY) {
      sessionStorage.setItem('app-access-granted', 'true');
      toast({
        title: 'Acceso Concedido',
        description: 'Bienvenido/a a GuardiaSwap.',
      });
      router.push('/');
    } else {
      toast({
        title: 'Clave Incorrecta',
        description: 'La clave de acceso introducida no es válida.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">GuardiaSwap</h1>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-sm text-center">
        <KeyRound className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold text-primary mb-2">GuardiaSwap</h1>
        <p className="text-muted-foreground mb-8">
          Introduce la clave para acceder
        </p>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2 text-left">
            <Label htmlFor="password">Clave de Acceso</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full" size="lg">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
