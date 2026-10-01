'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPut } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import {
  SITE_COPY_FIELDS,
  getByPath,
  setByPath,
} from '@/lib/siteCopyFields';
import en from '@/i18n/messages/en.json';
import hi from '@/i18n/messages/hi.json';
import gu from '@/i18n/messages/gu.json';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n/I18nProvider';
import type { Locale } from '@/lib/businessConfig';
import { cn } from '@/lib/cn';

type Overrides = Partial<Record<Locale, Record<string, unknown>>>;

const defaults: Record<Locale, Record<string, unknown>> = {
  en: en as unknown as Record<string, unknown>,
  hi: hi as unknown as Record<string, unknown>,
  gu: gu as unknown as Record<string, unknown>,
};

const locales: { id: Locale; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'Hindi' },
  { id: 'gu', label: 'Gujarati' },
];

export default function AdminSiteContentPage() {
  const toast = useToast();
  const { refreshCopy } = useI18n();
  const [locale, setLocale] = useState<Locale>('en');
  const [overrides, setOverrides] = useState<Overrides>({});
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  const sections = useMemo(() => {
    const map = new Map<string, typeof SITE_COPY_FIELDS>();
    for (const field of SITE_COPY_FIELDS) {
      const list = map.get(field.section) || [];
      list.push(field);
      map.set(field.section, list);
    }
    return Array.from(map.entries());
  }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await apiGet<Overrides>('/admin/site-copy');
      setOverrides(data || {});
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
    const next: Record<string, string> = {};
    for (const field of SITE_COPY_FIELDS) {
      const fromOverride = getByPath(overrides[locale], field.path);
      const fromDefault = getByPath(defaults[locale], field.path);
      next[field.path] = fromOverride || fromDefault;
    }
    setForm(next);
  }, [locale, overrides]);

  function updateField(path: string, value: string) {
    setForm((prev) => ({ ...prev, [path]: value }));
  }

  async function onSave() {
    try {
      setSaving(true);
      const localeTree: Record<string, unknown> = {};
      for (const field of SITE_COPY_FIELDS) {
        const value = (form[field.path] || '').trim();
        const defaultValue = getByPath(defaults[locale], field.path);
        // Store override when different from default, or keep previous custom if same intentionally
        if (value && value !== defaultValue) {
          setByPath(localeTree, field.path, value);
        }
      }

      const payload: Overrides = {
        en: locale === 'en' ? localeTree : overrides.en || {},
        hi: locale === 'hi' ? localeTree : overrides.hi || {},
        gu: locale === 'gu' ? localeTree : overrides.gu || {},
      };

      const saved = await apiPut<Overrides>('/admin/site-copy', payload);
      setOverrides(saved || payload);
      await refreshCopy();
      toast.success(`${locales.find((l) => l.id === locale)?.label} content saved`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save website content'));
    } finally {
      setSaving(false);
    }
  }

  async function resetLocaleToDefaults() {
    try {
      setSaving(true);
      const payload: Overrides = {
        en: locale === 'en' ? {} : overrides.en || {},
        hi: locale === 'hi' ? {} : overrides.hi || {},
        gu: locale === 'gu' ? {} : overrides.gu || {},
      };
      const saved = await apiPut<Overrides>('/admin/site-copy', payload);
      setOverrides(saved || payload);
      await refreshCopy();
      toast.success('Reset to default copy for this language');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading website content…" />;
  if (error) return <ErrorState onRetry={() => void load()} />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Website content"
          description="Change public page text (home, about, contact) without code. Save separately for English, Hindi, and Gujarati."
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" loading={saving} onClick={() => void resetLocaleToDefaults()}>
                Reset language
              </Button>
              <Button variant="gold" size="sm" loading={saving} onClick={() => void onSave()}>
                Save {locales.find((l) => l.id === locale)?.label}
              </Button>
            </div>
          }
        />

        <div className="mb-6 flex flex-wrap gap-2">
          {locales.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLocale(l.id)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition',
                locale === l.id ? 'bg-navy !text-white' : 'bg-ivory text-muted hover:text-navy'
              )}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {sections.map(([section, fields]) => (
            <div key={section}>
              <h3 className="mb-3 font-serif text-lg text-navy">{section}</h3>
              <div className="grid gap-4">
                {fields.map((field) =>
                  field.multiline ? (
                    <div key={field.path} className="space-y-1.5">
                      <label className="block text-sm font-medium text-navy">{field.label}</label>
                      <textarea
                        className="min-h-[90px] w-full rounded-md border border-border px-3 py-2 text-sm"
                        value={form[field.path] || ''}
                        onChange={(e) => updateField(field.path, e.target.value)}
                      />
                      <p className="text-[11px] text-muted">{field.path}</p>
                    </div>
                  ) : (
                    <div key={field.path}>
                      <Input
                        label={field.label}
                        value={form[field.path] || ''}
                        onChange={(e) => updateField(field.path, e.target.value)}
                      />
                      <p className="mt-1 text-[11px] text-muted">{field.path}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Button variant="gold" loading={saving} onClick={() => void onSave()}>
            Save {locales.find((l) => l.id === locale)?.label} content
          </Button>
        </div>
      </Card>
    </div>
  );
}
