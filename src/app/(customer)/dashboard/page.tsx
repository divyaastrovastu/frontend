'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import type { Appointment, Payment } from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AppointmentStatusBadge } from '@/components/PaymentStatus';

export default function CustomerOverviewPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [a, p] = await Promise.all([
          apiGet<Appointment[] | { items: Appointment[] }>('/appointments/me').catch(() => []),
          apiGet<Payment[] | { items: Payment[] }>('/payments/me').catch(() => []),
        ]);
        setAppointments(Array.isArray(a) ? a : a.items || []);
        setPayments(Array.isArray(p) ? p : p.items || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const upcoming = appointments.filter((a) =>
    ['CONFIRMED', 'PAYMENT_PENDING', 'PENDING', 'RESCHEDULED'].includes(a.status)
  );

  if (loading) return <LoadingSpinner label="Loading overview…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-navy md:text-3xl">Welcome, {user?.name}</h1>
        <p className="mt-1 text-sm text-muted">Manage your consultations and account.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Upcoming</p>
          <p className="mt-2 font-serif text-3xl text-navy">{upcoming.length}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Total bookings</p>
          <p className="mt-2 font-serif text-3xl text-navy">{appointments.length}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Payments</p>
          <p className="mt-2 font-serif text-3xl text-navy">{payments.length}</p>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Upcoming appointments"
          action={
            <Link href="/book">
              <Button variant="gold" size="sm">
                Book new
              </Button>
            </Link>
          }
        />
        {upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming appointments"
            description="Book a consultation to get started."
            action={
              <Link href="/book">
                <Button variant="outline" size="sm">
                  Book consultation
                </Button>
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {upcoming.slice(0, 5).map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-navy">{a.service?.name || 'Consultation'}</p>
                  <p className="text-sm text-muted">
                    {formatDate(a.appointmentDate)} · {formatTime(a.startTime)} ·{' '}
                    {formatCurrency(a.amount)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <AppointmentStatusBadge status={a.status} />
                  <Link href={`/dashboard/appointments/${a.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
