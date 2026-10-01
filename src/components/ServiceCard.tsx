import Link from 'next/link';
import { Clock } from 'lucide-react';
import type { Service } from '@/types';
import { formatCurrency, getEffectivePrice } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const price = getEffectivePrice(service);
  const hasDiscount =
    service.discountPrice != null && Number(service.discountPrice) < Number(service.price);

  return (
    <Card className="flex h-full flex-col transition hover:border-gold/40 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="font-serif text-xl text-navy">{service.name}</h3>
        {service.isFeatured && (
          <span className="rounded bg-navy/10 px-2 py-0.5 text-xs font-semibold text-navy">
            Featured
          </span>
        )}
      </div>
      <p className="flex-1 text-sm leading-relaxed text-charcoal/80">{service.shortDescription}</p>
      <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-lg text-navy">{formatCurrency(price)}</span>
            {hasDiscount && (
              <span className="text-sm text-charcoal/50 line-through">
                {formatCurrency(service.price)}
              </span>
            )}
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-charcoal/70">
            <Clock className="h-3.5 w-3.5" />
            {service.durationMinutes} mins
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/services/${service.slug}`}>
            <Button variant="outline" size="sm">
              Details
            </Button>
          </Link>
          <Link href={`/book?service=${service.slug}`}>
            <Button variant="gold" size="sm">
              Book
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
