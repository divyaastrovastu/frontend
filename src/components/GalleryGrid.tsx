'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff, X } from 'lucide-react';
import type { GalleryCategory, GalleryItem } from '@/types';
import { resolveMediaUrl } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';

const CATEGORIES: { value: '' | GalleryCategory; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'EVENTS', label: 'Events' },
  { value: 'AWARDS', label: 'Awards' },
  { value: 'WORKSHOPS', label: 'Workshops' },
  { value: 'CONSULTATIONS', label: 'Consultations' },
  { value: 'MEDIA', label: 'Media' },
];

function GalleryImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-ivory text-muted',
          className
        )}
      >
        <ImageOff className="h-8 w-8 opacity-50" />
        <span className="text-xs">Image unavailable</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState<'' | GalleryCategory>('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const list = filter ? items.filter((i) => i.category === filter) : items;
    return [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [items, filter]);

  const active = activeIndex !== null ? filtered[activeIndex] : null;

  useEffect(() => {
    if (activeIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setActiveIndex(null);
      if (e.key === 'ArrowRight') {
        setActiveIndex((i) => (i === null ? i : (i + 1) % filtered.length));
      }
      if (e.key === 'ArrowLeft') {
        setActiveIndex((i) =>
          i === null ? i : (i - 1 + filtered.length) % filtered.length
        );
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, filtered.length]);

  if (items.length === 0) {
    return (
      <EmptyState
        title="Gallery is empty"
        description="Upload photos from Admin → Gallery to show them here."
      />
    );
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => {
              setFilter(c.value);
              setActiveIndex(null);
            }}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium transition',
              filter === c.value
                ? 'bg-navy !text-white'
                : 'border border-border bg-white text-charcoal hover:border-gold/50'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No images in this category" description="Try another filter." />
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {filtered.map((item, index) => {
            const src = resolveMediaUrl(item.imageUrl);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl border border-border bg-white text-left transition hover:border-gold/50 hover:shadow-md"
              >
                <GalleryImage
                  src={src}
                  alt={item.caption || 'Gallery image'}
                  className="w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
                <div className="px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gold-dark">
                    {item.category}
                  </p>
                  {item.caption ? (
                    <p className="mt-1 text-sm text-navy">{item.caption}</p>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {active ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-navy/80 p-4 backdrop-blur-sm"
          onClick={() => setActiveIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setActiveIndex(null)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          {filtered.length > 1 ? (
            <>
              <button
                type="button"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:left-6"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) =>
                    i === null ? i : (i - 1 + filtered.length) % filtered.length
                  );
                }}
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:right-6"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i === null ? i : (i + 1) % filtered.length));
                }}
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}
          <figure
            className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <GalleryImage
              src={resolveMediaUrl(active.imageUrl)}
              alt={active.caption || 'Gallery image'}
              className="max-h-[75vh] w-full object-contain"
            />
            {(active.caption || active.category) && (
              <figcaption className="px-5 py-4 text-sm text-navy">
                <span className="font-semibold text-gold-dark">{active.category}</span>
                {active.caption ? ` · ${active.caption}` : ''}
              </figcaption>
            )}
          </figure>
        </div>
      ) : null}
    </>
  );
}
