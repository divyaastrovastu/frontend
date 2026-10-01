'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { BrandLogo } from '@/components/BrandLogo';
import { useAuthSafe } from '@/lib/auth';
import { useBranding } from '@/lib/branding';
import { useI18n } from '@/i18n/I18nProvider';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import type { TranslationKey } from '@/i18n/I18nProvider';

const links: { href: string; labelKey: TranslationKey }[] = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/about', labelKey: 'nav.about' },
  { href: '/services', labelKey: 'nav.services' },
  { href: '/blog', labelKey: 'nav.blog' },
  { href: '/gallery', labelKey: 'nav.gallery' },
  { href: '/testimonials', labelKey: 'nav.testimonials' },
  { href: '/faq', labelKey: 'nav.faq' },
  { href: '/contact', labelKey: 'nav.contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const auth = useAuthSafe();
  const { branding } = useBranding();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy/95 text-white backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <BrandLogo light size="sm" className="min-w-0" />

        <nav className="hidden items-center gap-1 xl:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-2.5 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white',
                pathname === link.href && 'bg-white/10 text-gold'
              )}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          {auth?.isAuthenticated ? (
            <Link href={auth.isAdmin ? '/admin' : '/dashboard'}>
              <Button variant="gold" size="sm">
                {t('nav.dashboard')}
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link href="/book">
                <Button variant="gold" size="sm">
                  {t('home.ctaBook')}
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-white lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-navy px-4 py-4 lg:hidden">
          <div className="mb-3">
            <LanguageSwitcher />
          </div>
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-md px-3 py-2.5 text-sm text-white/85',
                  pathname === link.href && 'bg-white/10 text-gold'
                )}
              >
                {t(link.labelKey)}
              </Link>
            ))}
            <Link href="/book" onClick={() => setOpen(false)} className="mt-2">
              <Button variant="gold" className="w-full">
                {t('home.ctaBook')}
              </Button>
            </Link>
            {branding.consultationHours ? (
              <p className="mt-3 text-center text-xs text-white/50">{branding.consultationHours}</p>
            ) : null}
          </nav>
        </div>
      )}
    </header>
  );
}
