'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Bell,
  Calendar,
  CreditCard,
  FileText,
  Home,
  KeyRound,
  LogOut,
  Settings,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/cn';
import { BrandLogo } from '@/components/BrandLogo';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const nav = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/dashboard/appointments', label: 'Appointments', icon: Calendar },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/invoices', label: 'Invoices', icon: FileText },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/saved-profiles', label: 'Saved profiles', icon: Users },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/change-password', label: 'Password', icon: KeyRound },
];

const mobileNav = nav.slice(0, 5);

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/login?redirect=/dashboard');
    if (!loading && isAdmin) router.replace('/admin');
  }, [loading, isAuthenticated, isAdmin, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner label="Loading dashboard…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-border bg-navy text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <BrandLogo href="/" light size="sm" showName={false} />
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-white/70 sm:inline">{user.name}</span>
            <button
              type="button"
              onClick={() => void logout().then(() => router.push('/'))}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6 pb-24 md:pb-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-6 space-y-1 rounded-xl border border-border bg-white p-3">
            {nav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition',
                    active
                      ? 'bg-navy !text-white [&_svg]:text-white'
                      : 'text-charcoal hover:bg-ivory'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white md:hidden">
        <div className="flex justify-around px-1 py-2">
          {mobileNav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]',
                  active ? 'text-navy' : 'text-muted'
                )}
              >
                <item.icon className={cn('h-5 w-5', active && 'text-gold')} />
                {item.label.split(' ')[0]}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
