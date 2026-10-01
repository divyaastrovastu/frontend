import { PageHero } from '@/components/PageHero';
import { BlogCard } from '@/components/BlogCard';
import { EmptyState } from '@/components/ui/EmptyState';
import type { BlogPost } from '@/types';

export const metadata = { title: 'Blog' };

async function getPosts(): Promise<BlogPost[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${base}/blog`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data;
    return Array.isArray(data) ? data : data?.items || [];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <PageHero
        title="Insights & Guidance"
        subtitle="Articles on Vedic astrology, Vastu, festivals, and mindful living."
      />
      <section className="container-page py-14 md:py-16">
        {posts.length === 0 ? (
          <EmptyState
            title="No articles yet"
            description="Blog posts will appear here when published, or when the API is online."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <BlogCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
