'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PageHero } from '@/components/PageHero';
import { Button } from '@/components/ui/Button';
import { useBranding } from '@/lib/branding';
import { useI18n } from '@/i18n/I18nProvider';
import { localizedAstrologerName } from '@/lib/businessConfig';
import { resolveMediaUrl } from '@/lib/utils';

export default function AboutPage() {
  const { branding } = useBranding();
  const { t, locale } = useI18n();
  const name = localizedAstrologerName(locale, branding);
  const photoSrc = resolveMediaUrl(
    branding.aboutPhotoUrl || branding.astrologerPhotoUrl || branding.homePhotoUrl || ''
  );

  return (
    <>
      <PageHero title={t('about.title')} subtitle={t('about.subtitle')} />
      <section className="container-page grid gap-10 py-14 md:grid-cols-2 md:py-20">
        <div>
          <h2 className="font-serif text-2xl text-navy md:text-3xl">
            {name}
            {branding.astrologerCredentials ? `, ${branding.astrologerCredentials}` : ''}
          </h2>
          <p className="mt-2 text-sm font-semibold text-gold-dark">{branding.astrologerTitle}</p>
          <p className="mt-4 leading-relaxed text-charcoal/85">{t('about.body')}</p>
          {branding.experienceYears ? (
            <p className="mt-4 text-sm text-navy">
              Professional experience: {branding.experienceYears}+ years
            </p>
          ) : null}
          <Link href="/book" className="mt-8 inline-block">
            <Button variant="gold">{t('home.ctaBook')}</Button>
          </Link>
        </div>
        <div className="space-y-6">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-ivory">
            {photoSrc ? (
              <Image
                src={photoSrc}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 480px"
                unoptimized={
                  photoSrc.includes('localhost') || photoSrc.includes('res.cloudinary.com')
                }
              />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-charcoal/70">
                {t('home.photoPending')}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-white p-6 text-sm text-charcoal/80">
            <p>
              {branding.city}, {branding.state}, {branding.country}
            </p>
            <p className="mt-2">{branding.consultationHours || t('common.hoursPending')}</p>
          </div>
        </div>
      </section>
    </>
  );
}
