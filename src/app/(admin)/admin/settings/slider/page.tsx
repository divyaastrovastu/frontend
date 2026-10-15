'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPut, API_URL, getStoredToken } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage, resolveMediaUrl } from '@/lib/utils';
import type { AstrologySlide } from '@/components/AstrologySlider';

const EMPTY: AstrologySlide[] = Array.from({ length: 5 }, (_, i) => ({
  id: `slide-${i + 1}`,
  imageUrl: '',
  title: '',
  subtitle: '',
  link: '',
  sortOrder: i + 1,
  isActive: false,
}));

export default function AdminHomeSliderPage() {
  const toast = useToast();
  const [slides, setSlides] = useState<AstrologySlide[]>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await apiGet<{ slides: AstrologySlide[] }>('/admin/home-slider');
      const next = EMPTY.map((slot, i) => ({ ...slot, ...(data.slides?.[i] || {}) }));
      setSlides(next);
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

  function updateSlide(index: number, patch: Partial<AstrologySlide>) {
    setSlides((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  async function onSave() {
    try {
      setSaving(true);
      await apiPut('/admin/home-slider', { slides });
      toast.success('Slider saved');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save slider'));
    } finally {
      setSaving(false);
    }
  }

  async function onUpload(index: number, file: File | null) {
    if (!file) return;
    try {
      setUploadingIndex(index);
      const body = new FormData();
      body.append('image', file);
      const token = getStoredToken();
      const res = await fetch(`${API_URL}/admin/media/slider?index=${index}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Upload failed');
      const url = json.data?.url as string;
      updateSlide(index, { imageUrl: url, isActive: true });
      toast.success(`Slide ${index + 1} image uploaded`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Upload failed'));
    } finally {
      setUploadingIndex(null);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={() => void load()} />;

  return (
    <Card>
      <CardHeader
        title="Home astrology slider"
        description="Up to 5 slides. Upload images, edit titles daily, toggle active, then Save. Images are stored on Cloudinary."
        action={
          <Button variant="gold" size="sm" loading={saving} onClick={() => void onSave()}>
            Save slider
          </Button>
        }
      />
      <div className="space-y-8">
        {slides.map((slide, index) => (
          <div key={slide.id} className="rounded-xl border border-border p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-navy">Slide {index + 1}</p>
              <label className="flex items-center gap-2 text-sm text-navy">
                <input
                  type="checkbox"
                  checked={slide.isActive}
                  onChange={(e) => updateSlide(index, { isActive: e.target.checked })}
                />
                Active on website
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-[160px_1fr]">
              <div>
                <div className="aspect-video overflow-hidden rounded-lg border border-border bg-ivory">
                  {slide.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveMediaUrl(slide.imageUrl)}
                      alt={`Slide ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted">No image</div>
                  )}
                </div>
                <input
                  className="mt-2 block w-full text-xs"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => void onUpload(index, e.target.files?.[0] || null)}
                />
                <p className="mt-1 text-xs text-muted">
                  {uploadingIndex === index ? 'Uploading…' : 'JPEG/PNG/WebP, max 5MB'}
                </p>
              </div>
              <div className="space-y-3">
                <Input
                  label="Title"
                  value={slide.title}
                  onChange={(e) => updateSlide(index, { title: e.target.value })}
                />
                <Input
                  label="Subtitle"
                  value={slide.subtitle}
                  onChange={(e) => updateSlide(index, { subtitle: e.target.value })}
                />
                <Input
                  label="Link (optional)"
                  placeholder="/services or https://..."
                  value={slide.link}
                  onChange={(e) => updateSlide(index, { link: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Button variant="gold" loading={saving} onClick={() => void onSave()}>
          Save slider
        </Button>
      </div>
    </Card>
  );
}
