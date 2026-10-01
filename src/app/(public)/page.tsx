import { HomePageClient } from '@/components/HomePageClient';
import type { Service, Testimonial } from '@/types';

async function fetchSafe<T>(path: string): Promise<T | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${base}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as T;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [servicesData, testimonialsData] = await Promise.all([
    fetchSafe<Service[] | { items: Service[] }>('/services'),
    fetchSafe<Testimonial[] | { items: Testimonial[] }>('/testimonials'),
  ]);

  const services = (Array.isArray(servicesData) ? servicesData : servicesData?.items || [])
    .filter((s) => s.isFeatured || s.isActive)
    .slice(0, 3);

  const testimonials = (
    Array.isArray(testimonialsData) ? testimonialsData : testimonialsData?.items || []
  )
    .filter((t) => t.status === 'APPROVED' || t.isFeatured)
    .slice(0, 3);

  return <HomePageClient services={services} testimonials={testimonials} />;
}
