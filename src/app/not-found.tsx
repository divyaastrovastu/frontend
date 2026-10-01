import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm uppercase tracking-wide text-gold">404</p>
      <h1 className="mt-2 font-serif text-3xl text-navy">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        The page you are looking for does not exist or may have moved.
      </p>
      <Link href="/" className="mt-6">
        <Button variant="gold">Back to home</Button>
      </Link>
    </div>
  );
}
