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
import { apiGet } from '@/lib/api';
import { businessConfig, type BusinessConfig } from '@/lib/businessConfig';

interface BrandingContextValue {
  branding: BusinessConfig;
  loading: boolean;
  refresh: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BusinessConfig>(businessConfig);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await apiGet<BusinessConfig>('/business');
      setBranding({ ...businessConfig, ...data, socialLinks: { ...businessConfig.socialLinks, ...data.socialLinks } });
    } catch {
      setBranding(businessConfig);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(() => ({ branding, loading, refresh }), [branding, loading, refresh]);
  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding must be used within BrandingProvider');
  return ctx;
}
