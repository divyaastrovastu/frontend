'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Shield, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ServiceCard } from '@/components/ServiceCard';
import { TestimonialCard } from '@/components/TestimonialCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useBranding } from '@/lib/branding';
import { useI18n } from '@/i18n/I18nProvider';
import { localizedAstrologerName, localizedTagline, formatBusinessAddress } from '@/lib/businessConfig';
import { whatsappUrl } from '@/lib/utils';
import type { Service, Testimonial } from '@/types';

export function HomePageClient({
  services,
  testimonials,
}: {
  services: Service[];
  testimonials: Testimonial[];
}) {
  const { branding } = useBranding();
  const { t, locale } = useI18n();
  const name = localizedAstrologerName(locale, branding);
  const tagline = localizedTagline(locale, branding);
  const photo = branding.astrologerPhotoUrl;
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1$/, '') || 'http://localhost:4000';
  const photoSrc = photo
    ? photo.startsWith('/uploads')
      ? `${apiBase}${photo}`
      : photo
    : '';

  return (
    <>
      <section className="gradient-hero relative overflow-hidden text-white">
        <div className="container-page relative z-10 grid min-h-[78vh] items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <h1 className="font-serif text-3xl tracking-wide text-white md:text-4xl lg:text-[2.75rem]">
              <span className="text-gold">DIVYA</span> ASTRO VASTU
            </h1>
            <p className="mt-4 font-serif text-2xl leading-snug text-white/95 md:text-3xl lg:text-[2rem]">
              {t('home.heroTitle')}
            </p>
            <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-gold-light md:text-lg">
              {tagline}
            </p>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/85 md:text-base">
              {name}
              {branding.astrologerCredentials ? `, ${branding.astrologerCredentials}` : ''}
              <br />
              {branding.astrologerTitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/book">
                <Button variant="gold" size="lg">
                  {t('home.ctaBook')}
                </Button>
              </Link>
              <a href={whatsappUrl(branding.whatsapp)} target="_blank" rel="noreferrer">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  {t('home.ctaWhatsapp')}
                </Button>
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-3 rounded-[2rem] border border-gold/25" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5">
              {photoSrc ? (
                <Image
                  src={photoSrc}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 90vw, 420px"
                  priority
                  unoptimized={photoSrc.includes('localhost')}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                  <p className="font-serif text-2xl text-white">{name}</p>
                  <p className="mt-2 text-sm text-white/60">{branding.astrologerTitle}</p>
                  <p className="mt-6 text-xs leading-relaxed text-white/45">{t('home.photoPending')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl text-navy md:text-4xl">{t('home.introTitle')}</h2>
          <p className="mt-4 leading-relaxed text-charcoal/85">{t('home.introBody')}</p>
          {branding.experienceYears ? (
            <p className="mt-3 text-sm font-medium text-navy">
              {branding.experienceYears}+ years of professional practice
            </p>
          ) : null}
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { icon: Shield, title: t('home.why1') },
            { icon: Clock, title: t('home.why2') },
            { icon: Star, title: t('home.why3') },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-white p-6">
              <item.icon className="h-8 w-8 text-gold" />
              <h3 className="mt-4 font-serif text-lg leading-snug text-navy">{item.title}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl text-navy">{t('home.servicesTitle')}</h2>
              <p className="mt-2 max-w-xl text-charcoal/80">{t('home.servicesBody')}</p>
            </div>
            <Link
              href="/services"
              className="text-sm font-medium text-navy underline-offset-4 hover:underline"
            >
              {t('common.viewAll')}
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {services.length ? (
              services.map((s) => <ServiceCard key={s.id} service={s} />)
            ) : (
              <EmptyState
                className="md:col-span-3"
                title={t('home.servicesTitle')}
                description="Services will appear once published in admin."
              />
            )}
          </div>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <h2 className="text-center font-serif text-3xl text-navy">{t('home.testimonialsTitle')}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.length ? (
            testimonials.map((item) => <TestimonialCard key={item.id} testimonial={item} />)
          ) : (
            <EmptyState
              className="md:col-span-3"
              title={t('home.testimonialsTitle')}
              description="Approved client testimonials will appear here."
            />
          )}
        </div>
      </section>

      <section className="bg-navy py-16 text-white md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl text-white">{t('home.ctaTitle')}</h2>
            <p className="mt-3 text-white/70">{t('home.ctaBody')}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/book">
                <Button variant="gold">{t('home.ctaBook')}</Button>
              </Link>
              <a href={whatsappUrl(branding.whatsapp)} target="_blank" rel="noreferrer">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  {t('home.ctaWhatsapp')}
                </Button>
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/80">
            <h3 className="font-serif text-xl text-gold">{t('home.contactTitle')}</h3>
            <p className="mt-3">{formatBusinessAddress(branding)}</p>
            <p className="mt-3">
              {branding.phone}
              {branding.phoneSecondary ? ` · ${branding.phoneSecondary}` : ''}
            </p>
            <p className="mt-1">{branding.email}</p>
            <p className="mt-3 text-white/50">
              {branding.consultationHours || t('common.hoursPending')}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
