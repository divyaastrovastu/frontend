import { MetadataRoute } from 'next';
import { businessConfig } from '@/lib/businessConfig';

const base = process.env.NEXT_PUBLIC_APP_URL || businessConfig.websiteUrl || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    '',
    '/about',
    '/services',
    '/book',
    '/blog',
    '/gallery',
    '/testimonials',
    '/contact',
    '/faq',
    '/privacy',
    '/terms',
    '/refund',
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  try {
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${api}/sitemap-data`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = (await res.json()) as {
        data?: { services?: string[]; blogs?: string[] };
      };
      for (const slug of json.data?.services || []) {
        entries.push({
          url: `${base}/services/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
      for (const slug of json.data?.blogs || []) {
        entries.push({
          url: `${base}/blog/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }
  } catch {
    // API may be offline during build
  }

  return entries;
}
