import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock } from 'lucide-react';
import { PageHero } from '@/components/PageHero';
import { Button } from '@/components/ui/Button';
import { formatCurrency, getEffectivePrice } from '@/lib/utils';
import type { Service } from '@/types';

async function getService(slug: string): Promise<Service | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${base}/services/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as Service;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getService(slug);
  return { title: service?.name || 'Service' };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const price = getEffectivePrice(service);

  return (
    <>
      <PageHero title={service.name} subtitle={service.shortDescription} />
      <section className="container-page grid gap-10 py-14 md:grid-cols-[1fr_320px] md:py-16">
        <article className="prose-dav rounded-xl border border-border bg-white p-6 md:p-8">
          <p className="whitespace-pre-wrap text-muted leading-relaxed">{service.description}</p>
        </article>
        <aside className="h-fit rounded-xl border border-border bg-white p-6">
          <p className="font-serif text-2xl text-navy">{formatCurrency(price)}</p>
          {service.discountPrice && Number(service.discountPrice) < Number(service.price) && (
            <p className="text-sm text-muted line-through">{formatCurrency(service.price)}</p>
          )}
          <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
            <Clock className="h-4 w-4" />
            {service.durationMinutes} minutes
          </p>
          <Link href={`/book?service=${service.slug}`} className="mt-6 block">
            <Button variant="gold" className="w-full">
              Book this service
            </Button>
          </Link>
        </aside>
      </section>
    </>
  );
}
