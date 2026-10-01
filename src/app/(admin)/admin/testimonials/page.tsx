'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiDelete, apiGet, apiPatch, apiPost, API_URL, getStoredToken } from '@/lib/api';
import { getErrorMessage, resolveMediaUrl } from '@/lib/utils';
import type { Testimonial } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';

type TestimonialForm = {
  name: string;
  review: string;
  rating: number;
  status: string;
  isFeatured: boolean;
  photoUrl: string;
};

export default function AdminTestimonialsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [uploading, setUploading] = useState(false);
  const form = useForm<TestimonialForm>({
    defaultValues: {
      name: '',
      review: '',
      rating: 5,
      status: 'APPROVED',
      isFeatured: false,
      photoUrl: '',
    },
  });
  const photoUrl = form.watch('photoUrl');

  async function load() {
    try {
      setLoading(true);
      const data = await apiGet<Testimonial[] | { items: Testimonial[] }>('/admin/testimonials');
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
    form.reset({
      name: '',
      review: '',
      rating: 5,
      status: 'APPROVED',
      isFeatured: false,
      photoUrl: '',
    });
    setOpen(true);
  }

  function openEdit(t: Testimonial) {
    setEditing(t);
    form.reset({
      name: t.name,
      review: t.review,
      rating: t.rating,
      status: t.status,
      isFeatured: t.isFeatured,
      photoUrl: t.photoUrl || '',
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
      const res = await fetch(`${API_URL}/admin/media/testimonial`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Upload failed');
      form.setValue('photoUrl', json.data.url, { shouldDirty: true });
      toast.success('Photo uploaded');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: TestimonialForm) {
    try {
      const payload = {
        ...values,
        rating: Number(values.rating),
        photoUrl: values.photoUrl || null,
      };
      if (editing) {
        await apiPatch(`/admin/testimonials/${editing.id}`, payload);
        toast.success('Updated');
      } else {
        await apiPost('/admin/testimonials', payload);
        toast.success('Created');
      }
      setOpen(false);
      setEditing(null);
      form.reset();
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function approve(id: string) {
    try {
      await apiPatch(`/admin/testimonials/${id}`, { status: 'APPROVED' });
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
          title="Testimonials"
          description="Add client reviews with optional photos for a richer public page."
          action={
            <Button variant="gold" size="sm" onClick={openCreate}>
              Add
            </Button>
          }
        />
        {items.length === 0 ? (
          <EmptyState title="No testimonials" />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((t) => (
              <li key={t.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <div className="flex max-w-xl gap-3">
                  {t.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveMediaUrl(t.photoUrl)}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/10 font-serif text-navy">
                      {t.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-navy">
                      {t.name} · {t.rating}/5 · {t.status}
                    </p>
                    <p className="mt-1 text-sm text-muted line-clamp-2">{t.review}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
                    Edit
                  </Button>
                  {t.status !== 'APPROVED' && (
                    <Button size="sm" variant="outline" onClick={() => void approve(t.id)}>
                      Approve
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      void apiDelete(`/admin/testimonials/${t.id}`)
                        .then(load)
                        .catch((e) => toast.error(getErrorMessage(e)))
                    }
                  >
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
        title={editing ? 'Edit testimonial' : 'Add testimonial'}
      >
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <Input label="Name" {...form.register('name', { required: true })} />
          <Input
            label="Rating"
            type="number"
            min={1}
            max={5}
            {...form.register('rating', { valueAsNumber: true })}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-navy">Client photo (optional)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => void uploadFile(e.target.files?.[0] || null)}
            />
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolveMediaUrl(photoUrl)}
                alt="Preview"
                className="mt-2 h-16 w-16 rounded-full object-cover"
              />
            ) : null}
          </div>
          <Input label="Photo URL (optional)" {...form.register('photoUrl')} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-navy">Review</label>
            <textarea
              className="min-h-28 w-full rounded-md border border-border px-3 py-2 text-sm"
              {...form.register('review', { required: true })}
            />
          </div>
          <Select
            label="Status"
            options={[
              { value: 'PENDING', label: 'Pending' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'HIDDEN', label: 'Hidden' },
            ]}
            {...form.register('status')}
          />
          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" {...form.register('isFeatured')} /> Featured
          </label>
          <Button type="submit" variant="gold" className="w-full" disabled={uploading}>
            {editing ? 'Save changes' : 'Save'}
          </Button>
        </form>
      </Modal>
    </>
  );
}
