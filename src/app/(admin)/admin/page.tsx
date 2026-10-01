'use client';

import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { apiGet } from '@/lib/api';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import type { Appointment, DashboardStats } from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AppointmentStatusBadge } from '@/components/PaymentStatus';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<DashboardStats>('/admin/dashboard');
        setStats(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard…" />;
  if (error) {
    return (
      <ErrorState
        title="Dashboard unavailable"
        message="Could not load admin metrics. The API may be offline."
        onRetry={() => window.location.reload()}
      />
    );
  }

  const cards = [
    { label: 'Appointments', value: stats?.totalAppointments ?? 0 },
    { label: 'Upcoming', value: stats?.upcomingAppointments ?? 0 },
    { label: 'Customers', value: stats?.totalCustomers ?? 0 },
    { label: 'Revenue', value: formatCurrency(stats?.totalRevenue ?? 0) },
    { label: 'Enquiries', value: stats?.pendingEnquiries ?? 0 },
  ];

  const chartData = stats?.revenueByMonth || [];
  const recent = stats?.recentAppointments || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-navy md:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted">Overview of bookings, revenue, and activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label}>
            <p className="text-xs uppercase tracking-wide text-muted">{c.label}</p>
            <p className="mt-2 font-serif text-2xl text-navy">{c.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Revenue" description="Monthly totals" />
          {chartData.length === 0 ? (
            <EmptyState title="No revenue data" description="Charts appear once payments are recorded." />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d4" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#C9A227" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent appointments" />
          {recent.length === 0 ? (
            <EmptyState title="No appointments" />
          ) : (
            <ul className="divide-y divide-border">
              {recent.slice(0, 6).map((a: Appointment) => (
                <li key={a.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-navy">{a.customer?.name || a.bookingRef}</p>
                    <p className="text-xs text-muted">
                      {formatDate(a.appointmentDate)} {formatTime(a.startTime)}
                    </p>
                  </div>
                  <AppointmentStatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
