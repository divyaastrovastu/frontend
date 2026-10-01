import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHero } from '@/components/PageHero';
import { formatDate, resolveMediaUrl } from '@/lib/utils';
import type { BlogPost } from '@/types';

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${base}/blog/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as BlogPost;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return {
    title: post?.seoTitle || post?.title || 'Article',
    description: post?.seoDescription || post?.excerpt || undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const cover = resolveMediaUrl(post.featuredImage);

  return (
    <>
      <PageHero title={post.title} subtitle={post.excerpt || undefined} />
      <article className="container-page max-w-3xl py-12 md:py-16">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <Link href="/blog" className="text-navy hover:underline">
            ← All articles
          </Link>
          <span>·</span>
          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
          {post.category ? (
            <>
              <span>·</span>
              <span className="uppercase tracking-wide text-gold-dark">{post.category.name}</span>
            </>
          ) : null}
        </div>
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={post.title}
            className="mt-6 aspect-[16/9] w-full rounded-xl object-cover shadow-sm"
          />
        )}
        <div className="prose-dav mt-8 whitespace-pre-wrap text-base leading-relaxed text-charcoal/90">
          {post.content}
        </div>
      </article>
    </>
  );
}
