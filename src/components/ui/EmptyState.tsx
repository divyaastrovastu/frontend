import { Inbox } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'Nothing here yet',
  description = 'Content will appear once data is available.',
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white/60 px-6 py-12 text-center',
        className
      )}
    >
      <div className="mb-3 text-gold">{icon || <Inbox className="h-10 w-10" />}</div>
      <h3 className="font-serif text-lg text-navy">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
