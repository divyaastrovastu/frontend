import { cn } from '@/lib/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
};

export function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', label && 'py-8')}>
      <div
        className={cn(
          'animate-spin rounded-full border-gold border-t-transparent',
          sizes[size],
          className
        )}
        role="status"
        aria-label={label || 'Loading'}
      />
      {label && <p className="text-sm text-muted">{label}</p>}
    </div>
  );
}
