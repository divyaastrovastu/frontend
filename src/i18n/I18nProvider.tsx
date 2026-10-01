'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import en from '@/i18n/messages/en.json';
import hi from '@/i18n/messages/hi.json';
import gu from '@/i18n/messages/gu.json';
import { apiGet } from '@/lib/api';
import type { Locale } from '@/lib/businessConfig';

type Messages = typeof en;
type NestedKeyOf<T, P extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: NestedKeyOf<T[K], P extends '' ? K : `${P}.${K}`>;
    }[keyof T & string]
  : P;

export type TranslationKey = NestedKeyOf<Messages>;

type LocaleOverrides = Partial<Record<Locale, Record<string, unknown>>>;

const dictionaries: Record<Locale, Messages> = { en, hi, gu };
const STORAGE_KEY = 'dav_locale';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  refreshCopy: () => Promise<void>;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function deepMerge(
  base: Record<string, unknown>,
  overlay?: Record<string, unknown>
): Record<string, unknown> {
  if (!overlay) return { ...base };
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      base[key] &&
      typeof base[key] === 'object' &&
      !Array.isArray(base[key])
    ) {
      out[key] = deepMerge(
        base[key] as Record<string, unknown>,
        value as Record<string, unknown>
      );
    } else if (value !== undefined && value !== null && value !== '') {
      out[key] = value;
    }
  }
  return out;
}

function getByPath(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur && typeof cur === 'object' && part in (cur as object)) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return path;
    }
  }
  return typeof cur === 'string' ? cur : path;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [overrides, setOverrides] = useState<LocaleOverrides>({});

  const refreshCopy = useCallback(async () => {
    try {
      const data = await apiGet<LocaleOverrides>('/site-copy');
      setOverrides(data || {});
    } catch {
      setOverrides({});
    }
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && dictionaries[saved]) setLocaleState(saved);
    document.documentElement.lang = saved && dictionaries[saved] ? saved : 'en';
    void refreshCopy();
  }, [refreshCopy]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  const merged = useMemo(() => {
    return deepMerge(
      dictionaries[locale] as unknown as Record<string, unknown>,
      overrides[locale]
    );
  }, [locale, overrides]);

  const t = useCallback((key: TranslationKey) => getByPath(merged, key), [merged]);

  const value = useMemo(
    () => ({ locale, setLocale, t, refreshCopy }),
    [locale, setLocale, t, refreshCopy]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
