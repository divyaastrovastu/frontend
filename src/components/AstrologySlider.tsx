'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/utils';
import { cn } from '@/lib/cn';

export type AstrologySlide = {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  link: string;
  sortOrder: number;
  isActive: boolean;
};

export function AstrologySlider({ slides }: { slides: AstrologySlide[] }) {
  const items = slides.filter((s) => s.isActive && s.imageUrl);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  const active = items[index] || items[0];
  const href = active.link?.trim() || '';

  const media = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolveMediaUrl(active.imageUrl)}
      alt={active.title || 'Astrology highlight'}
      className="h-full w-full object-cover transition duration-700"
    />
  );

  return (
    <section className="bg-navy py-14 text-white md:py-16">
      <div className="container-page">
        <div className="mb-8 max-w-2xl">
          <h2 className="mt-2 font-serif text-3xl text-white md:text-4xl">Astrology highlights</h2>
          <p className="mt-2 text-sm text-white/70">
            Daily wisdom and guidance.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="relative aspect-[21/9] min-h-[220px] w-full md:min-h-[320px]">
            {href ? (
              <Link href={href} className="absolute inset-0 block">
                {media}
              </Link>
            ) : (
              <div className="absolute inset-0">{media}</div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
            {(active.title || active.subtitle) && (
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                {active.title ? (
                  <h3 className="font-serif text-2xl text-white md:text-3xl">{active.title}</h3>
                ) : null}
                {active.subtitle ? (
                  <p className="mt-2 max-w-2xl text-sm text-white/80 md:text-base">{active.subtitle}</p>
                ) : null}
              </div>
            )}
          </div>

          {items.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous slide"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-navy/50 p-2 text-white hover:bg-navy/70"
                onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-navy/50 p-2 text-white hover:bg-navy/70"
                onClick={() => setIndex((i) => (i + 1) % items.length)}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                {items.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    className={cn(
                      'h-2 w-2 rounded-full transition',
                      i === index ? 'bg-gold' : 'bg-white/40 hover:bg-white/70'
                    )}
                    onClick={() => setIndex(i)}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
