import { PageHero } from '@/components/PageHero';
import { TestimonialCard } from '@/components/TestimonialCard';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Testimonial } from '@/types';

export const metadata = { title: 'Testimonials' };

async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${base}/testimonials`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data;
    return Array.isArray(data) ? data : data?.items || [];
  } catch {
    return [];
  }
}

export default async function TestimonialsPage() {
  const items = (await getTestimonials())
    .filter((t) => t.status === 'APPROVED')
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));

  return (
    <>
      <PageHero
        title="Client Stories"
        subtitle="Real experiences from people who found clarity through astrology and Vastu guidance."
      />
      <section className="container-page py-14 md:py-16">
        {items.length === 0 ? (
          <EmptyState
            title="No testimonials yet"
            description="Approved reviews will appear here when available."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
