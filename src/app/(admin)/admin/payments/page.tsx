'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Payment } from '@/types';
import { PaymentStatus } from '@/components/PaymentStatus';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AdminPaymentsPage() {
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<Payment[] | { items: Payment[] }>('/admin/payments');
        setItems(Array.isArray(data) ? data : data.items || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  return (
    <Card>
      <CardHeader title="Payments" />
      {items.length === 0 ? (
        <EmptyState title="No payments" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border text-muted">
              <tr>
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium">Amount</th>
                <th className="py-2 font-medium">Provider</th>
                <th className="py-2 font-medium">Order</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((p) => (
                <tr key={p.id}>
                  <td className="py-3">{formatDate(p.paidAt || p.createdAt)}</td>
                  <td className="py-3">{formatCurrency(p.amount)}</td>
                  <td className="py-3">{p.provider}</td>
                  <td className="py-3">{p.orderId || '—'}</td>
                  <td className="py-3">
                    <PaymentStatus status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
