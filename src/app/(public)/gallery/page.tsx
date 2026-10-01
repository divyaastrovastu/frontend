import { PageHero } from '@/components/PageHero';
import { GalleryGrid } from '@/components/GalleryGrid';
import type { GalleryItem } from '@/types';

export const metadata = { title: 'Gallery' };

async function getGallery(): Promise<GalleryItem[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${base}/gallery`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data;
    return Array.isArray(data) ? data : data?.items || [];
  } catch {
    return [];
  }
}

export default async function GalleryPage() {
  const items = (await getGallery()).filter((i) => i.isActive);

  return (
    <>
      <PageHero
        title="Moments & Milestones"
        subtitle="Consultations, workshops, awards, and community gatherings — tap any photo to view larger."
      />
      <section className="container-page py-14 md:py-16">
        <GalleryGrid items={items} />
      </section>
    </>
  );
}
