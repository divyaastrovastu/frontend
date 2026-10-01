'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import type { Appointment } from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AppointmentStatusBadge } from '@/components/PaymentStatus';

export default function AppointmentsPage() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<Appointment[] | { items: Appointment[] }>('/appointments/me');
        setItems(Array.isArray(data) ? data : data.items || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner label="Loading appointments…" />;
  if (error) {
    return <ErrorState onRetry={() => window.location.reload()} />;
  }

  return (
    <Card>
      <CardHeader
        title="My appointments"
        action={
          <Link href="/book">
            <Button variant="gold" size="sm">
              Book new
            </Button>
          </Link>
        }
      />
      {items.length === 0 ? (
        <EmptyState title="No appointments" description="Your bookings will appear here." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border text-muted">
              <tr>
                <th className="py-2 font-medium">Reference</th>
                <th className="py-2 font-medium">Service</th>
                <th className="py-2 font-medium">When</th>
                <th className="py-2 font-medium">Amount</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((a) => (
                <tr key={a.id}>
                  <td className="py-3">{a.bookingRef}</td>
                  <td className="py-3">{a.service?.name || '—'}</td>
                  <td className="py-3">
                    {formatDate(a.appointmentDate)} {formatTime(a.startTime)}
                  </td>
                  <td className="py-3">{formatCurrency(a.amount)}</td>
                  <td className="py-3">
                    <AppointmentStatusBadge status={a.status} />
                  </td>
                  <td className="py-3 text-right">
                    <Link href={`/dashboard/appointments/${a.id}`}>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </Link>
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
