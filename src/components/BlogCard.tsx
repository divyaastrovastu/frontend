import Link from 'next/link';
import { Calendar } from 'lucide-react';
import type { BlogPost } from '@/types';
import { formatDate, resolveMediaUrl } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const image = resolveMediaUrl(post.featuredImage);

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <Card
        padded={false}
        className="h-full overflow-hidden transition group-hover:border-gold/40 group-hover:shadow-md"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-navy to-purple">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={post.title}
              className="h-full w-full object-cover opacity-95 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-100"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center font-serif text-xl text-gold/70">
              DIVYA ASTRO VASTU
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-navy/40 to-transparent" />
        </div>
        <div className="p-5">
          {post.category && (
            <span className="text-xs font-medium uppercase tracking-wide text-gold-dark">
              {post.category.name}
            </span>
          )}
          <h3 className="mt-1 font-serif text-xl leading-snug text-navy transition group-hover:text-purple">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-charcoal/75">{post.excerpt}</p>
          )}
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(post.publishedAt || post.createdAt)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
