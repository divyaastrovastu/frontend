import { AlertTriangle } from 'lucide-react';
import { type ReactNode } from 'react';
import { Button } from './Button';
import { cn } from '@/lib/cn';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = 'Unable to load',
  message = 'We could not reach the server. Please try again shortly.',
  onRetry,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-danger/20 bg-white px-6 py-12 text-center',
        className
      )}
    >
      <AlertTriangle className="mb-3 h-10 w-10 text-danger/80" />
      <h3 className="font-serif text-lg text-navy">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{message}</p>
      <div className="mt-5 flex gap-3">
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        )}
        {action}
      </div>
    </div>
  );
}
