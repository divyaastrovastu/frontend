import type { PaymentStatus as Status } from '@/types';
import { cn } from '@/lib/cn';
import { appointmentStatusLabel } from '@/lib/utils';

const styles: Record<Status, string> = {
  CREATED: 'bg-muted/15 text-muted',
  PENDING: 'bg-warning/10 text-warning',
  SUCCESS: 'bg-success/10 text-success',
  FAILED: 'bg-danger/10 text-danger',
  REFUNDED: 'bg-purple/10 text-purple',
  PARTIALLY_REFUNDED: 'bg-purple/10 text-purple',
};

interface PaymentStatusProps {
  status: Status | string;
  className?: string;
}

export function PaymentStatus({ status, className }: PaymentStatusProps) {
  const key = status as Status;
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
        styles[key] || 'bg-navy/10 text-navy',
        className
      )}
    >
      {appointmentStatusLabel(status)}
    </span>
  );
}

export function AppointmentStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    CONFIRMED: 'bg-success/10 text-success',
    COMPLETED: 'bg-navy/10 text-navy',
    CANCELLED: 'bg-danger/10 text-danger',
    PAYMENT_PENDING: 'bg-warning/10 text-warning',
    PENDING: 'bg-warning/10 text-warning',
    RESCHEDULED: 'bg-purple/10 text-purple',
    NO_SHOW: 'bg-muted/20 text-muted',
    REFUND_REQUESTED: 'bg-warning/10 text-warning',
    REFUNDED: 'bg-purple/10 text-purple',
  };
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
        map[status] || 'bg-navy/10 text-navy'
      )}
    >
      {appointmentStatusLabel(status)}
    </span>
  );
}
