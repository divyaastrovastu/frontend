'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiDelete, apiGet, apiPatch, apiPost, API_URL, getStoredToken } from '@/lib/api';
import { getErrorMessage, resolveMediaUrl } from '@/lib/utils';
import type { GalleryItem } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';

type GalleryForm = { imageUrl: string; caption: string; category: string; isActive: boolean };

export default function AdminGalleryPage() {
  const toast = useToast();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const form = useForm<GalleryForm>({
    defaultValues: { imageUrl: '', caption: '', category: 'EVENTS', isActive: true },
  });

  const imageUrl = form.watch('imageUrl');

  async function load() {
    try {
      setLoading(true);
      const data = await apiGet<GalleryItem[] | { items: GalleryItem[] }>('/admin/gallery');
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
    form.reset({ imageUrl: '', caption: '', category: 'EVENTS', isActive: true });
    setOpen(true);
  }

  function openEdit(item: GalleryItem) {
    setEditing(item);
    form.reset({
      imageUrl: item.imageUrl,
      caption: item.caption || '',
      category: item.category,
      isActive: item.isActive,
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
      const res = await fetch(`${API_URL}/admin/media/gallery`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Upload failed');
      form.setValue('imageUrl', json.data.url, { shouldDirty: true });
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: GalleryForm) {
    try {
      if (editing) {
        await apiPatch(`/admin/gallery/${editing.id}`, values);
        toast.success('Updated');
      } else {
        await apiPost('/admin/gallery', values);
        toast.success('Added');
      }
      setOpen(false);
      setEditing(null);
      form.reset();
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
          title="Gallery"
          description="Upload images or paste a URL. Relative /uploads paths are served from the API."
          action={
            <Button variant="gold" size="sm" onClick={openCreate}>
              Add image
            </Button>
          }
        />
        {items.length === 0 ? (
          <EmptyState title="No gallery items" description="Add your first photo to show on the public Gallery page." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveMediaUrl(item.imageUrl)}
                  alt={item.caption || ''}
                  className="aspect-video w-full object-cover bg-ivory"
                />
                <div className="flex items-center justify-between gap-2 p-2 text-xs">
                  <span className="truncate text-muted">{item.caption || item.category}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        void apiDelete(`/admin/gallery/${item.id}`)
                          .then(load)
                          .catch((e) => toast.error(getErrorMessage(e)))
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit gallery image' : 'Add gallery image'}
      >
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-navy">Upload image</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => void uploadFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-muted">{uploading ? 'Uploading…' : 'JPEG/PNG/WebP, max 5MB'}</p>
          </div>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveMediaUrl(imageUrl)}
              alt="Preview"
              className="aspect-video w-full rounded-md object-cover border border-border"
            />
          ) : null}
          <Input
            label="Image URL (or upload above)"
            placeholder="/uploads/gallery/... or https://..."
            {...form.register('imageUrl', { required: true })}
          />
          <p className="text-xs text-muted">
            Use Upload, or paste a direct image URL ending in .jpg/.png/.webp. Google Photos / Drive share
            links will not display.
          </p>
          <Input label="Caption" {...form.register('caption')} />
          <Select
            label="Category"
            options={['EVENTS', 'AWARDS', 'WORKSHOPS', 'CONSULTATIONS', 'MEDIA'].map((c) => ({
              value: c,
              label: c,
            }))}
            {...form.register('category')}
          />
          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" {...form.register('isActive')} /> Active on website
          </label>
          <Button type="submit" variant="gold" className="w-full" disabled={uploading}>
            {editing ? 'Save changes' : 'Save'}
          </Button>
        </form>
      </Modal>
    </>
  );
}
