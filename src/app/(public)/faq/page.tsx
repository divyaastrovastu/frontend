'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PageHero } from '@/components/PageHero';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { apiGet } from '@/lib/api';
import type { FAQ } from '@/types';
import { cn } from '@/lib/cn';

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<FAQ[] | { items: FAQ[] }>('/faqs');
        setFaqs(Array.isArray(data) ? data : data.items || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <PageHero title="Frequently Asked Questions" subtitle="Answers about bookings, payments, and consultations." />
      <section className="container-page max-w-3xl py-14 md:py-16">
        {loading && <LoadingSpinner label="Loading FAQs…" />}
        {error && (
          <ErrorState
            message="Could not load FAQs. The API may be offline."
            onRetry={() => window.location.reload()}
          />
        )}
        {!loading && !error && faqs.length === 0 && (
          <EmptyState title="No FAQs yet" description="Answers will appear here once published." />
        )}
        <div className="space-y-3">
          {faqs
            .filter((f) => f.isActive)
            .map((faq) => {
              const open = openId === faq.id;
              return (
                <div key={faq.id} className="rounded-xl border border-border bg-white">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                    onClick={() => setOpenId(open ? null : faq.id)}
                  >
                    <span className="font-medium text-navy">{faq.question}</span>
                    <ChevronDown className={cn('h-4 w-4 text-gold transition', open && 'rotate-180')} />
                  </button>
                  {open && (
                    <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </section>
    </>
  );
}
