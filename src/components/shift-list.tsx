'use client';

import type { Shift } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { deleteShiftAction } from '@/lib/actions';
import { Phone, CheckCircle, User, Clock, MapPin, FileText } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { useActionState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ShiftListProps {
  shifts: Shift[];
  userId: string;
}

function DeleteButton({ shiftId }: { shiftId: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      className="w-full mt-2 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-600 dark:text-green-500 dark:hover:bg-green-950"
      disabled={pending}
      aria-label="Marcar como cambiada"
    >
      {pending ? (
        'Marcando...'
      ) : (
        <>
          <CheckCircle className="w-5 h-5 mr-2" />
          Marcar como Cambiada
        </>
      )}
    </Button>
  );
}

export default function ShiftList({ shifts, userId }: ShiftListProps) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(deleteShiftAction, { message: '' });

  useEffect(() => {
    if (state?.message) {
      toast({
        title: 'Guardia actualizada',
        description: state.message,
      });
    }
  }, [state, toast]);
  
  if (shifts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground italic">
          No hay guardias publicadas para este día.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {shifts.map((shift) => {
        const isOwner = shift.userId === userId;
        const whatsappNumber = shift.phone.replace(/[^0-9]/g, '');

        return (
          <Card key={shift.id} className={cn(isOwner && 'bg-primary/5 border-primary/20')}>
            <CardHeader className="p-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> {shift.location}
                </CardTitle>
                {isOwner ? (
                  <Badge variant="default">Mi Guardia</Badge>
                ) : (
                  <Badge variant="secondary">{shift.name}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4"/>
                    <span>{shift.time}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4"/>
                    <span>Publicado por: {shift.name}</span>
                </div>
                {shift.notes && (
                    <div className="flex items-start gap-2 text-muted-foreground pt-2">
                        <FileText className="w-4 h-4 mt-0.5 shrink-0"/>
                        <p className="italic">"{shift.notes}"</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-4 pt-0">
              {isOwner ? (
                <form action={formAction} className="w-full">
                  <input type="hidden" name="shiftId" value={shift.id} />
                  <DeleteButton shiftId={shift.id} />
                </form>
              ) : (
                <Button asChild className="w-full whatsapp-btn hover:bg-[#20b757]">
                  <a href={`https://wa.me/34${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                    <Phone className="w-4 h-4 mr-2" />
                    Contactar por WhatsApp
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
