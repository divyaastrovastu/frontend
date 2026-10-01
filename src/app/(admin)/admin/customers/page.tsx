'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AdminCustomersPage() {
  const [items, setItems] = useState<User[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<User[] | { items: User[] }>('/admin/customers', {
          q: q || undefined,
        });
        setItems(Array.isArray(data) ? data : data.items || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [q]);

  if (loading) return <LoadingSpinner label="Loading customers…" />;
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  return (
    <Card>
      <CardHeader
        title="Customers"
        action={
          <Input
            placeholder="Search name or email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-56"
          />
        }
      />
      {items.length === 0 ? (
        <EmptyState title="No customers" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-border text-muted">
              <tr>
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Email</th>
                <th className="py-2 font-medium">Mobile</th>
                <th className="py-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((u) => (
                <tr key={u.id}>
                  <td className="py-3">{u.name}</td>
                  <td className="py-3">{u.email}</td>
                  <td className="py-3">{u.mobile || '—'}</td>
                  <td className="py-3">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
