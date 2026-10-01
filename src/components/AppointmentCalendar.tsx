'use client';

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';

interface AppointmentCalendarProps {
  selected?: Date | null;
  onSelect: (date: Date) => void;
  disabledDates?: string[];
  minDate?: Date;
}

export function AppointmentCalendar({
  selected,
  onSelect,
  disabledDates = [],
  minDate,
}: AppointmentCalendarProps) {
  const [month, setMonth] = useState(selected || new Date());
  const min = minDate || startOfDay(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const disabledSet = useMemo(() => new Set(disabledDates), [disabledDates]);

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setMonth(subMonths(month, 1))} aria-label="Previous month">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h4 className="font-serif text-lg text-navy">{format(month, 'MMMM yyyy')}</h4>
        <Button variant="ghost" size="sm" onClick={() => setMonth(addMonths(month, 1))} aria-label="Next month">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const iso = format(day, 'yyyy-MM-dd');
          const disabled =
            !isSameMonth(day, month) ||
            isBefore(day, min) ||
            disabledSet.has(iso);
          const isSelected = selected && isSameDay(day, selected);
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(day)}
              className={cn(
                'aspect-square rounded-md text-sm transition',
                !isSameMonth(day, month) && 'text-muted/40',
                disabled && 'cursor-not-allowed opacity-40',
                !disabled && !isSelected && 'hover:bg-gold/15 text-navy',
                isSelected && 'bg-navy text-white'
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
