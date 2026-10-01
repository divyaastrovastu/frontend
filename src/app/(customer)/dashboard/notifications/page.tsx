'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { NotificationLog } from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<NotificationLog[] | { items: NotificationLog[] }>(
          '/notifications/me'
        );
        setItems(Array.isArray(data) ? data : data.items || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner label="Loading notifications…" />;
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  return (
    <Card>
      <CardHeader title="Notifications" description="Booking confirmations, reminders, and updates." />
      {items.length === 0 ? (
        <EmptyState title="No notifications" description="Messages sent to you will appear here." />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((n) => (
            <li key={n.id} className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-navy">{n.subject || n.type}</p>
                <span className="text-xs text-muted">{formatDate(n.sentAt || n.createdAt)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {n.channel} · {n.status}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
