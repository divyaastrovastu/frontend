'use client';

import { useEffect, useState } from 'react';
import { apiPatch, API_URL, getStoredToken } from '@/lib/api';
import { useBranding } from '@/lib/branding';import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/utils';
import type { BusinessConfig } from '@/lib/businessConfig';

export default function BrandingSettingsPage() {
  const toast = useToast();
  const { branding, refresh } = useBranding();
  const [form, setForm] = useState<Partial<BusinessConfig>>(branding);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(branding);
  }, [branding]);

  function setField<K extends keyof BusinessConfig>(key: K, value: BusinessConfig[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSave() {
    try {
      setSaving(true);
      await apiPatch('/admin/branding', {
        ...form,
        facebook: form.socialLinks?.facebook,
        instagram: form.socialLinks?.instagram,
        youtube: form.socialLinks?.youtube,
        experienceYears: form.experienceYears === null || form.experienceYears === ('' as never)
          ? null
          : Number(form.experienceYears),
      });
      await refresh();
      toast.success('Branding saved');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save branding'));
    } finally {
      setSaving(false);
    }
  }

  async function onUpload(file: File | null) {
    if (!file) return;
    try {
      setUploading(true);
      const body = new FormData();
      body.append('photo', file);
      const token = getStoredToken();
      const res = await fetch(`${API_URL}/admin/branding/photo`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Upload failed');
      await refresh();
      toast.success('Astrologer photo uploaded');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Photo upload failed'));
    } finally {
      setUploading(false);
    }
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1$/, '') || 'http://localhost:4000';
  const photoPreview = form.astrologerPhotoUrl
    ? form.astrologerPhotoUrl.startsWith('/uploads')
      ? `${apiBase}${form.astrologerPhotoUrl}`
      : form.astrologerPhotoUrl
    : '';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Business branding"
          description="Public website identity for DIVYA ASTRO VASTU. Leave fields blank if not confirmed yet."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Business name" value={form.name || ''} onChange={(e) => setField('name', e.target.value)} />
          <Input
            label="Astrologer name (English)"
            value={form.astrologerName || ''}
            onChange={(e) => setField('astrologerName', e.target.value)}
          />
          <Input
            label="Astrologer name (Hindi)"
            value={form.astrologerNameHi || ''}
            onChange={(e) => setField('astrologerNameHi', e.target.value)}
          />
          <Input
            label="Astrologer name (Gujarati)"
            value={form.astrologerNameGu || ''}
            onChange={(e) => setField('astrologerNameGu', e.target.value)}
          />
          <Input
            label="Credentials"
            value={form.astrologerCredentials || ''}
            onChange={(e) => setField('astrologerCredentials', e.target.value)}
          />
          <Input
            label="Title"
            value={form.astrologerTitle || ''}
            onChange={(e) => setField('astrologerTitle', e.target.value)}
          />
          <Input
            label="Experience years (optional)"
            type="number"
            value={form.experienceYears ?? ''}
            onChange={(e) =>
              setField('experienceYears', e.target.value === '' ? null : Number(e.target.value))
            }
          />
          <Input
            label="Consultation hours"
            value={form.consultationHours || ''}
            onChange={(e) => setField('consultationHours', e.target.value)}
            placeholder="e.g. Mon–Sat, 10:00 AM – 7:00 PM"
          />
          <Input label="Primary phone" value={form.phone || ''} onChange={(e) => setField('phone', e.target.value)} />
          <Input
            label="Secondary phone"
            value={form.phoneSecondary || ''}
            onChange={(e) => setField('phoneSecondary', e.target.value)}
          />
          <Input
            label="WhatsApp (with country code)"
            value={form.whatsapp || ''}
            onChange={(e) => setField('whatsapp', e.target.value)}
          />
          <Input label="Email" value={form.email || ''} onChange={(e) => setField('email', e.target.value)} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-navy">Consultation mode</label>
            <select
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
              value={form.consultationMode || 'WHATSAPP'}
              onChange={(e) =>
                setField(
                  'consultationMode',
                  e.target.value as BusinessConfig['consultationMode']
                )
              }
            >
              <option value="WHATSAPP">WhatsApp video / chat</option>
              <option value="GOOGLE_MEET">Google Meet</option>
              <option value="ZOOM">Zoom</option>
              <option value="PHONE">Phone call</option>
              <option value="IN_PERSON">In person</option>
            </select>
          </div>
          <Input
            label="Default meeting link (optional)"
            value={form.defaultMeetingLink || ''}
            onChange={(e) => setField('defaultMeetingLink', e.target.value)}
            placeholder="https://meet.google.com/... or Zoom URL"
          />
          <div className="md:col-span-2">
            <Input
              label="Address line"
              value={form.addressLine || ''}
              onChange={(e) => setField('addressLine', e.target.value)}
            />
          </div>          <Input label="City" value={form.city || ''} onChange={(e) => setField('city', e.target.value)} />
          <Input label="State" value={form.state || ''} onChange={(e) => setField('state', e.target.value)} />
          <Input label="Pincode" value={form.pincode || ''} onChange={(e) => setField('pincode', e.target.value)} />
          <Input
            label="Website URL"
            value={form.websiteUrl || ''}
            onChange={(e) => setField('websiteUrl', e.target.value)}
          />
          <Input
            label="Facebook URL (optional)"
            value={form.socialLinks?.facebook || ''}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                socialLinks: { ...prev.socialLinks!, facebook: e.target.value },
              }))
            }
          />
          <Input
            label="Instagram URL (optional)"
            value={form.socialLinks?.instagram || ''}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                socialLinks: { ...prev.socialLinks!, instagram: e.target.value },
              }))
            }
          />
          <Input
            label="YouTube URL (optional)"
            value={form.socialLinks?.youtube || ''}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                socialLinks: { ...prev.socialLinks!, youtube: e.target.value },
              }))
            }
          />
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-sm font-medium text-navy">English tagline</label>
            <textarea
              className="min-h-[70px] w-full rounded-md border border-border px-3 py-2 text-sm"
              value={form.tagline || ''}
              onChange={(e) => setField('tagline', e.target.value)}
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-sm font-medium text-navy">Hindi tagline</label>
            <textarea
              className="min-h-[70px] w-full rounded-md border border-border px-3 py-2 text-sm"
              value={form.taglineHi || ''}
              onChange={(e) => setField('taglineHi', e.target.value)}
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-sm font-medium text-navy">Gujarati tagline</label>
            <textarea
              className="min-h-[70px] w-full rounded-md border border-border px-3 py-2 text-sm"
              value={form.taglineGu || ''}
              onChange={(e) => setField('taglineGu', e.target.value)}
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-sm font-medium text-navy">Short description</label>
            <textarea
              className="min-h-[90px] w-full rounded-md border border-border px-3 py-2 text-sm"
              value={form.description || ''}
              onChange={(e) => setField('description', e.target.value)}
            />
          </div>
        </div>
        <div className="mt-6">
          <Button variant="gold" loading={saving} onClick={onSave}>
            Save branding
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Astrologer photo"
          description="Upload a clear portrait (JPEG/PNG/WebP, max 5MB). Shown on Home and About."
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative h-48 w-40 overflow-hidden rounded-xl border border-border bg-ivory">
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreview} alt="Astrologer" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center p-3 text-center text-xs text-muted">
                No photo uploaded
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => void onUpload(e.target.files?.[0] || null)}
            />
            <p className="mt-2 text-xs text-muted">{uploading ? 'Uploading…' : 'Recommended: vertical portrait photo.'}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
