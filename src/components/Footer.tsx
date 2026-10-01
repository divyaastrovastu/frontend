'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useBranding } from '@/lib/branding';
import { useI18n } from '@/i18n/I18nProvider';
import { formatBusinessAddress } from '@/lib/businessConfig';
import { BrandLogo } from '@/components/BrandLogo';

export function Footer() {
  const { branding } = useBranding();
  const { t } = useI18n();

  const footerLinks = [
    { href: '/about', label: t('nav.about') },
    { href: '/services', label: t('nav.services') },
    { href: '/book', label: t('nav.book') },
    { href: '/blog', label: t('nav.blog') },
    { href: '/faq', label: t('nav.faq') },
    { href: '/contact', label: t('nav.contact') },
    { href: '/privacy', label: t('footer.privacy') },
    { href: '/terms', label: t('footer.terms') },
    { href: '/refund', label: t('footer.refund') },
  ];

  const social = [
    { href: branding.socialLinks.facebook, label: 'Facebook', short: 'f' },
    { href: branding.socialLinks.instagram, label: 'Instagram', short: 'ig' },
    { href: branding.socialLinks.youtube, label: 'YouTube', short: 'yt' },
  ].filter((s) => Boolean(s.href));

  return (
    <footer className="mt-auto bg-navy text-white">
      <div className="gold-divider" />
      <div className="container-page grid gap-10 py-12 md:grid-cols-3">
        <div>
          <BrandLogo light size="md" />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            {branding.astrologerTitle}
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/60">{branding.description}</p>
          {social.length > 0 ? (
            <div className="mt-5 flex gap-3">
              {social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-xs font-semibold uppercase tracking-wide hover:border-gold hover:text-gold"
                  aria-label={s.label}
                >
                  {s.short}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <h4 className="font-serif text-lg text-gold">Explore</h4>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-white/75">
            {footerLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg text-gold">{t('home.contactTitle')}</h4>
          <ul className="mt-4 space-y-3 text-sm text-white/75">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>{formatBusinessAddress(branding)}</span>
            </li>
            <li className="flex gap-2">
              <Phone className="h-4 w-4 shrink-0 text-gold" />
              <div className="flex flex-col gap-1">
                <a href={`tel:${branding.phone.replace(/\s/g, '')}`} className="hover:text-gold">
                  {branding.phone}
                </a>
                {branding.phoneSecondary ? (
                  <a
                    href={`tel:${branding.phoneSecondary.replace(/\s/g, '')}`}
                    className="hover:text-gold"
                  >
                    {branding.phoneSecondary}
                  </a>
                ) : null}
              </div>
            </li>
            <li className="flex gap-2">
              <Mail className="h-4 w-4 shrink-0 text-gold" />
              <a href={`mailto:${branding.email}`} className="hover:text-gold">
                {branding.email}
              </a>
            </li>
          </ul>
          <p className="mt-4 text-xs text-white/50">
            {branding.consultationHours || t('common.hoursPending')}
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/45">
        © {new Date().getFullYear()} {branding.legalName}. {t('footer.rights')}
      </div>
    </footer>
  );
}
