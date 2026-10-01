'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import type { Invoice } from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function InvoicesPage() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<Invoice[] | { items: Invoice[] }>('/invoices/me');
        setItems(Array.isArray(data) ? data : data.items || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner label="Loading invoices…" />;
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  return (
    <Card>
      <CardHeader title="Invoices" />
      {items.length === 0 ? (
        <EmptyState title="No invoices" description="Invoices are generated after successful payment." />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((inv) => (
            <li key={inv.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium text-navy">{inv.invoiceNumber}</p>
                <p className="text-sm text-muted">
                  {inv.serviceName} · {formatDate(inv.appointmentDate)} {formatTime(inv.appointmentTime)} ·{' '}
                  {formatCurrency(inv.totalAmount)}
                </p>
              </div>
              {inv.pdfPath && (
                <a href={inv.pdfPath} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
