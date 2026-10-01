import { PageHero } from '@/components/PageHero';
import { ServiceCard } from '@/components/ServiceCard';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Service } from '@/types';

export const metadata = { title: 'Services' };

async function getServices(): Promise<Service[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${base}/services`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data;
    return Array.isArray(data) ? data : data?.items || [];
  } catch {
    return [];
  }
}

export default async function ServicesPage() {
  const services = (await getServices()).filter((s) => s.isActive);

  return (
    <>
      <PageHero
        title="Astrology & Vastu Services"
        subtitle="Choose a consultation designed for clarity in the areas that matter most to you."
      />
      <section className="container-page py-14 md:py-16">
        {services.length === 0 ? (
          <EmptyState
            title="No services available"
            description="Services will appear here when the backend is reachable."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
