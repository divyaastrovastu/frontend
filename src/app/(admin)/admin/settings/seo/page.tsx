'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiGet, apiPut } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import type { PageSeo } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

const pageKeys = ['home', 'about', 'services', 'blog', 'contact', 'faq'];

export default function AdminSeoPage() {
  const toast = useToast();
  const [items, setItems] = useState<PageSeo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [active, setActive] = useState('home');
  const form = useForm({
    defaultValues: {
      pageKey: 'home',
      title: '',
      metaDescription: '',
      keywords: '',
      ogTitle: '',
      ogDescription: '',
      canonicalUrl: '',
    },
  });

  async function load() {
    try {
      setLoading(true);
      const data = await apiGet<PageSeo[] | { items: PageSeo[] }>('/admin/seo');
      const list = Array.isArray(data) ? data : data.items || [];
      setItems(list);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const existing = items.find((i) => i.pageKey === active);
    form.reset({
      pageKey: active,
      title: existing?.title || '',
      metaDescription: existing?.metaDescription || '',
      keywords: existing?.keywords || '',
      ogTitle: existing?.ogTitle || '',
      ogDescription: existing?.ogDescription || '',
      canonicalUrl: existing?.canonicalUrl || '',
    });
  }, [active, items, form]);

  async function onSubmit(values: {
    pageKey: string;
    title: string;
    metaDescription: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    canonicalUrl: string;
  }) {
    try {
      await apiPut('/admin/seo', values);
      toast.success('SEO saved');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={() => void load()} />;

  return (
    <Card>
      <CardHeader title="Page SEO" description="Titles and meta descriptions for public pages." />
      <div className="mb-4 flex flex-wrap gap-2">
        {pageKeys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={`rounded-full px-3 py-1 text-xs capitalize ${
              active === key ? 'bg-navy text-white' : 'bg-ivory text-muted'
            }`}
          >
            {key}
          </button>
        ))}
      </div>
      {items.length === 0 && (
        <EmptyState
          className="mb-4"
          title="No SEO records yet"
          description="Saving will create entries when the API is available."
        />
      )}
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
        <Input label="Title" {...form.register('title')} />
        <Input label="Keywords" {...form.register('keywords')} />
        <div className="sm:col-span-2">
          <Input label="Meta description" {...form.register('metaDescription')} />
        </div>
        <Input label="OG title" {...form.register('ogTitle')} />
        <Input label="Canonical URL" {...form.register('canonicalUrl')} />
        <div className="sm:col-span-2">
          <Input label="OG description" {...form.register('ogDescription')} />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" variant="gold">
            Save SEO
          </Button>
        </div>
      </form>
    </Card>
  );
}
