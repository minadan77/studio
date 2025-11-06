'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CalendarView from '@/components/calendar-view';
import { Button } from '@/components/ui/button';
import { useShifts } from '@/firebase/provider';

export default function Home() {
  const { shifts, loading: shiftsLoading } = useShifts();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const accessGranted = sessionStorage.getItem('app-access-granted') === 'true';
    if (!accessGranted) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('app-access-granted');
    router.push('/login');
  };

  if (shiftsLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 pb-20 bg-background min-h-screen">
      <header className="text-center mb-6 relative">
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary font-headline">
          Guardias a Cambiar
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Toca un día para ver o publicar una guardia.
        </p>
        <div className="absolute top-0 right-0">
          <Button variant="outline" onClick={handleLogout}>
            Salir
          </Button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto">
        <CalendarView initialShifts={shifts} userId="shared-user" />
      </main>
    </div>
  );
}
