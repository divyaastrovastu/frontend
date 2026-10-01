'use client';

import { AuthProvider } from '@/lib/auth';
import { BrandingProvider } from '@/lib/branding';
import { I18nProvider } from '@/i18n/I18nProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { WhatsAppButton } from '@/components/WhatsAppButton';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <BrandingProvider>
        <AuthProvider>
          <ToastProvider>
            {children}
            <WhatsAppButton />
          </ToastProvider>
        </AuthProvider>
      </BrandingProvider>
    </I18nProvider>
  );
}
