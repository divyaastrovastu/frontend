'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { NotificationLog } from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<NotificationLog[] | { items: NotificationLog[] }>(
          '/admin/notifications'
        );
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
      <CardHeader title="Notification logs" description="Email and WhatsApp delivery history." />
      {items.length === 0 ? (
        <EmptyState title="No logs yet" />
      ) : (
        <ul className="divide-y divide-border text-sm">
          {items.map((n) => (
            <li key={n.id} className="flex flex-wrap justify-between gap-2 py-3">
              <div>
                <p className="font-medium text-navy">{n.subject || n.type}</p>
                <p className="text-xs text-muted">
                  {n.channel} · {n.status}
                  {n.error ? ` · ${n.error}` : ''}
                </p>
              </div>
              <span className="text-xs text-muted">{formatDate(n.sentAt || n.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
