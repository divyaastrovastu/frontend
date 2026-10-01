'use client';

import { MessageCircle } from 'lucide-react';
import { whatsappUrl } from '@/lib/utils';
import { useBranding } from '@/lib/branding';

export function WhatsAppButton({
  compact = false,
  className = '',
}: {
  compact?: boolean;
  className?: string;
}) {
  const { branding } = useBranding();
  const href = whatsappUrl(
    branding.whatsapp,
    `Hello ${branding.name}, I would like to chat about a consultation.`
  );

  if (compact) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold !text-white shadow-md hover:brightness-105 ${className}`}
      >
        <MessageCircle className="h-4 w-4" />
        Chat on WhatsApp
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`fixed bottom-20 right-4 z-[60] flex items-center gap-2 rounded-full bg-[#25D366] py-3 pl-3 pr-4 !text-white shadow-xl transition hover:scale-[1.03] hover:shadow-2xl md:bottom-6 md:right-6 ${className}`}
      aria-label="Chat support on WhatsApp"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
        <MessageCircle className="h-6 w-6" />
      </span>
      <span className="pr-1 text-sm font-semibold leading-tight !text-white">
        Chat support
        <span className="block text-[11px] font-normal text-white/90">WhatsApp</span>
      </span>
    </a>
  );
}
