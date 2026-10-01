'use client';

import { useI18n } from '@/i18n/I18nProvider';
import type { Locale } from '@/lib/businessConfig';
import { cn } from '@/lib/cn';

const options: { value: Locale; labelKey: 'common.english' | 'common.hindi' | 'common.gujarati' }[] = [
  { value: 'en', labelKey: 'common.english' },
  { value: 'hi', labelKey: 'common.hindi' },
  { value: 'gu', labelKey: 'common.gujarati' },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className={cn('inline-flex items-center gap-1 rounded-full border border-border bg-white/80 p-1', className)} role="group" aria-label={t('common.language')}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setLocale(opt.value)}
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-medium transition',
            locale === opt.value ? 'bg-navy text-white' : 'text-charcoal hover:bg-ivory'
          )}
        >
          {t(opt.labelKey)}
        </button>
      ))}
    </div>
  );
}
