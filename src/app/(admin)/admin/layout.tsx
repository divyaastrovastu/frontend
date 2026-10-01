'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Bell,
  BookOpen,
  Calendar,
  CalendarClock,
  CreditCard,
  HelpCircle,
  Image,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  MessageSquareQuote,
  Search,
  Settings,
  Sparkles,
  Tag,
  FileText,
  Users,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/cn';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BrandLogo } from '@/components/BrandLogo';

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
  { href: '/admin/availability', label: 'Availability', icon: CalendarClock },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/services', label: 'Services', icon: Sparkles },
  { href: '/admin/offers', label: 'Offers', icon: Tag },
  { href: '/admin/blog', label: 'Blog', icon: BookOpen },
  { href: '/admin/gallery', label: 'Gallery', icon: Image },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
  { href: '/admin/enquiries', label: 'Enquiries', icon: Mail },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/admin/settings/content', label: 'Website content', icon: FileText },
  { href: '/admin/settings/branding', label: 'Branding', icon: Settings },
  { href: '/admin/settings/seo', label: 'SEO', icon: Search },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAuthenticated, isAdmin, logout } = useAuth();
  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    if (isLogin) return;
    if (!loading && !isAuthenticated) router.replace('/admin/login');
    if (!loading && isAuthenticated && !isAdmin) router.replace('/dashboard');
  }, [loading, isAuthenticated, isAdmin, router, isLogin]);

  if (isLogin) return <>{children}</>;

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory">
        <LoadingSpinner label="Loading admin…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory md:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-navy text-white md:flex">
        <div className="border-b border-white/10 px-4 py-5">
          <BrandLogo href="/admin" light size="sm" showName={false} />
          <p className="mt-2 text-xs text-white/50">Admin CMS</p>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm',
                  active ? 'bg-white/15 text-gold' : 'text-white/75 hover:bg-white/10'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className="m-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/10"
          onClick={() => void logout().then(() => router.push('/admin/login'))}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-white px-4 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <Settings className="h-4 w-4 text-gold" />
            <span className="font-serif text-navy">Admin</span>
          </div>
          <p className="text-sm text-muted">{user.name}</p>
          <Link href="/" className="text-xs text-gold hover:underline">
            View site
          </Link>
        </header>
        <div className="overflow-x-auto border-b border-border bg-white md:hidden">
          <nav className="flex gap-1 px-2 py-2">
            {nav.slice(0, 8).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'whitespace-nowrap rounded-full px-3 py-1 text-xs',
                  pathname.startsWith(item.href) ? 'bg-navy !text-white' : 'bg-ivory text-muted'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
