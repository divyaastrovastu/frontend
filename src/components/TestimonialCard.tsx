import { Star } from 'lucide-react';
import type { Testimonial } from '@/types';
import { resolveMediaUrl } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const photo = resolveMediaUrl(testimonial.photoUrl);

  return (
    <Card className="h-full transition hover:border-gold/40 hover:shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex gap-0.5" aria-label={`${testimonial.rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < testimonial.rating ? 'fill-gold text-gold' : 'text-border'
              }`}
            />
          ))}
        </div>
        {testimonial.isFeatured ? (
          <span className="rounded bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy">
            Featured
          </span>
        ) : null}
      </div>
      <p className="text-sm leading-relaxed text-charcoal/90">&ldquo;{testimonial.review}&rdquo;</p>
      <div className="mt-5 flex items-center gap-3 border-t border-border/70 pt-4">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={testimonial.name}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-gold/20"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/10 font-serif text-sm text-navy ring-2 ring-gold/10">
            {testimonial.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-medium text-navy">{testimonial.name}</p>
          <p className="text-xs text-muted">Verified client</p>
        </div>
      </div>
    </Card>
  );
}
