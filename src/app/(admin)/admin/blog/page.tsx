'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiDelete, apiGet, apiPatch, apiPost, API_URL, getStoredToken } from '@/lib/api';
import { formatDate, getErrorMessage, resolveMediaUrl } from '@/lib/utils';
import type { BlogPost } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';

type BlogForm = {
  title: string;
  excerpt: string;
  content: string;
  status: string;
  featuredImage: string;
};

export default function AdminBlogPage() {
  const toast = useToast();
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [uploading, setUploading] = useState(false);
  const form = useForm<BlogForm>({
    defaultValues: { title: '', excerpt: '', content: '', status: 'DRAFT', featuredImage: '' },
  });
  const featuredImage = form.watch('featuredImage');

  async function load() {
    try {
      setLoading(true);
      const data = await apiGet<BlogPost[] | { items: BlogPost[] }>('/admin/blog');
      setItems(Array.isArray(data) ? data : data.items || []);
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

  function openCreate() {
    setEditing(null);
    form.reset({ title: '', excerpt: '', content: '', status: 'DRAFT', featuredImage: '' });
    setOpen(true);
  }

  function openEdit(p: BlogPost) {
    setEditing(p);
    form.reset({
      title: p.title,
      excerpt: p.excerpt || '',
      content: p.content,
      status: p.status,
      featuredImage: p.featuredImage || '',
    });
    setOpen(true);
  }

  async function uploadFile(file: File | null) {
    if (!file) return;
    try {
      setUploading(true);
      const body = new FormData();
      body.append('image', file);
      const token = getStoredToken();
      const res = await fetch(`${API_URL}/admin/media/blog`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Upload failed');
      form.setValue('featuredImage', json.data.url, { shouldDirty: true });
      toast.success('Cover image uploaded');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: BlogForm) {
    try {
      const payload = {
        ...values,
        featuredImage: values.featuredImage || null,
        publishedAt: values.status === 'PUBLISHED' ? new Date().toISOString() : null,
      };
      if (editing) {
        await apiPatch(`/admin/blog/${editing.id}`, payload);
        toast.success('Post updated');
      } else {
        await apiPost('/admin/blog', payload);
        toast.success('Post saved');
      }
      setOpen(false);
      setEditing(null);
      form.reset();
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function remove(id: string) {
    try {
      await apiDelete(`/admin/blog/${id}`);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={() => void load()} />;

  return (
    <>
      <Card>
        <CardHeader
          title="Blog posts"
          description="Publish insights with a cover image for a richer public blog."
          action={
            <Button variant="gold" size="sm" onClick={openCreate}>
              New post
            </Button>
          }
        />
        {items.length === 0 ? (
          <EmptyState title="No posts" />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-ivory">
                    {p.featuredImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolveMediaUrl(p.featuredImage)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-navy">{p.title}</p>
                    <p className="text-xs text-muted">
                      {p.status} · {formatDate(p.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void remove(p.id)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit blog post' : 'New blog post'}
        size="lg"
      >
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <Input label="Title" {...form.register('title', { required: true })} />
          <Input label="Excerpt" {...form.register('excerpt')} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-navy">Cover image</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => void uploadFile(e.target.files?.[0] || null)}
            />
            {featuredImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolveMediaUrl(featuredImage)}
                alt="Cover"
                className="mt-2 aspect-video w-full rounded-md object-cover border border-border"
              />
            ) : null}
          </div>
          <Input
            label="Cover image URL (optional)"
            {...form.register('featuredImage')}
            placeholder="/uploads/blog/... or https://..."
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-navy">Content</label>
            <textarea
              className="min-h-40 w-full rounded-md border border-border px-3 py-2 text-sm"
              {...form.register('content', { required: true })}
            />
          </div>
          <Select
            label="Status"
            options={[
              { value: 'DRAFT', label: 'Draft' },
              { value: 'PUBLISHED', label: 'Published' },
            ]}
            {...form.register('status')}
          />
          <Button type="submit" variant="gold" className="w-full" disabled={uploading}>
            {editing ? 'Save changes' : 'Save'}
          </Button>
        </form>
      </Modal>
    </>
  );
}
