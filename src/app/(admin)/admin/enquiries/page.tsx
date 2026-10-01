'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '@/lib/api';
import { formatDate, getErrorMessage } from '@/lib/utils';
import type { ContactEnquiry } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

export default function AdminEnquiriesPage() {
  const toast = useToast();
  const [items, setItems] = useState<ContactEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await apiGet<ContactEnquiry[] | { items: ContactEnquiry[] }>('/admin/enquiries');
      setItems(Array.isArray(data) ? data : data.items || []);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function mark(id: string, status: string) {
    try {
      await apiPatch(`/admin/enquiries/${id}`, { status });
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={() => void load()} />;

  return (
    <Card>
      <CardHeader title="Contact enquiries" />
      {items.length === 0 ? (
        <EmptyState title="No enquiries" />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((e) => (
            <li key={e.id} className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-navy">
                    {e.subject} <span className="text-xs text-muted">({e.status})</span>
                  </p>
                  <p className="text-sm text-muted">
                    {e.name} · {e.email} {e.phone ? `· ${e.phone}` : ''} · {formatDate(e.createdAt)}
                  </p>
                  <p className="mt-2 text-sm text-charcoal">{e.message}</p>
                </div>
                <div className="flex gap-2">
                  {e.status === 'NEW' && (
                    <Button size="sm" variant="outline" onClick={() => void mark(e.id, 'IN_PROGRESS')}>
                      Start
                    </Button>
                  )}
                  {e.status !== 'RESOLVED' && (
                    <Button size="sm" variant="gold" onClick={() => void mark(e.id, 'RESOLVED')}>
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
