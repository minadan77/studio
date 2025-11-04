'use client';

import { useState, useMemo } from 'react';
import type { Shift } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import ShiftModal from './shift-modal';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  initialShifts: Shift[];
  userId: string;
}

const abbreviatedLocation = (location: 'C.S. Granadilla' | 'SNU San Isidro') => {
  if (location === 'C.S. Granadilla') return 'Granadilla';
  if (location === 'SNU San Isidro') return 'SanIsidro';
  return location;
}

export default function CalendarView({ initialShifts, userId }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const shiftsByDate = useMemo(() => {
    return initialShifts.reduce((acc, shift) => {
      (acc[shift.date] = acc[shift.date] || []).push(shift);
      return acc;
    }, {} as Record<string, Shift[]>);
  }, [initialShifts]);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7; // 0=Lunes, 6=Domingo

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setModalOpen(true);
  };
  
  const calendarDays = [];
  for (let i = 0; i < startDayIndex; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="p-1"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateString = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const shifts = shiftsByDate[dateString] || [];
    const hasShifts = shifts.length > 0;
    
    calendarDays.push(
      <div
        key={day}
        className={cn(
          'day-cell rounded-lg p-1.5 text-center cursor-pointer flex flex-col justify-start transition-colors duration-150 relative group',
          isWeekend && 'weekend-cell',
          hasShifts && 'has-shifts hover:bg-red-100 dark:hover:bg-red-900/40',
          !hasShifts && 'hover:bg-muted'
        )}
        onClick={() => handleDayClick(dateString)}
        role="button"
        tabIndex={0}
        aria-label={`Ver guardias para el ${day} de ${monthNames[currentMonth]}`}
      >
        <span className={cn('text-lg font-bold', hasShifts ? 'text-red-600 dark:text-red-400' : 'text-foreground/80')}>
          {day}
        </span>
        <div className="w-full flex-grow flex flex-col justify-start items-center mt-1 space-y-1 text-[10px] leading-tight">
          {[0, 1].map(index => {
            const shift = shifts[index];
            if (shift) {
              return (
                <div key={shift.id} className="w-full bg-red-100/50 dark:bg-red-900/30 p-0.5 rounded-sm overflow-hidden">
                  <p className="font-semibold text-red-800 dark:text-red-200 truncate">{shift.name}</p>
                  <p className="font-bold text-red-700 dark:text-red-300 truncate">{abbreviatedLocation(shift.location)}</p>
                  <p className="text-foreground/80 font-medium truncate">{shift.time}</p>
                </div>
              )
            }
            return <div key={`placeholder-${index}`} className="h-[40px] w-full" />
          })}
        </div>
        {!hasShifts && <PlusCircle className="h-5 w-5 text-muted-foreground opacity-10 group-hover:opacity-60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
      </div>
    );
  }

  return (
    <>
      <Card className="shadow-lg">
        <div className="flex justify-between items-center p-3">
          <Button id="prev-month" variant="ghost" size="icon" onClick={handlePrevMonth} aria-label="Mes anterior">
            <ChevronLeft className="w-6 h-6 text-primary" />
          </Button>
          <h2 id="month-year" className="text-xl font-bold text-foreground font-headline">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <Button id="next-month" variant="ghost" size="icon" onClick={handleNextMonth} aria-label="Mes siguiente">
            <ChevronRight className="w-6 h-6 text-primary" />
          </Button>
        </div>
        <div className="grid grid-cols-7 text-center font-semibold text-sm text-muted-foreground mb-2 px-2">
          {dayNames.map((name, i) => (
            <span key={name} className={cn(i > 4 && "text-red-500")}>{name}</span>
          ))}
        </div>
        <CardContent className="p-2">
          <div id="calendar-body" className="grid grid-cols-7 gap-1.5">
            {calendarDays}
          </div>
        </CardContent>
      </Card>
      {selectedDate && (
        <ShiftModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            // We can't easily revalidate from the client, 
            // but closing the modal and reopening will show fresh data.
          }}
          date={selectedDate}
          shifts={shiftsByDate[selectedDate] || []}
          userId={userId}
        />
      )}
    </>
  );
}
