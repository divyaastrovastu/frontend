'use client';

import type { TimeSlot } from '@/types';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/cn';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selected?: string | null;
  onSelect: (startTime: string) => void;
  loading?: boolean;
}

function isAvailable(slot: TimeSlot): boolean {
  return slot.available !== false;
}

export function TimeSlotPicker({ slots, selected, onSelect, loading }: TimeSlotPickerProps) {
  if (loading) return <LoadingSpinner label="Loading available slots…" />;

  const available = slots.filter(isAvailable);
  if (!slots.length || available.length === 0) {
    return (
      <EmptyState
        title="No slots available"
        description="Please choose another weekday date. Sundays are typically closed."
      />
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm text-charcoal/80">
        {available.length} slot{available.length === 1 ? '' : 's'} available
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((slot) => {
          const open = isAvailable(slot);
          return (
            <button
              key={slot.startTime}
              type="button"
              disabled={!open}
              onClick={() => onSelect(slot.startTime)}
              className={cn(
                'rounded-md border px-2 py-2.5 text-sm font-medium transition',
                !open && 'cursor-not-allowed border-border/60 bg-ivory text-charcoal/35 line-through',
                open &&
                  selected !== slot.startTime &&
                  'border-border bg-white text-navy hover:border-gold hover:bg-gold/10',
                selected === slot.startTime && 'border-navy bg-navy text-white'
              )}
            >
              {formatTime(slot.startTime)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
