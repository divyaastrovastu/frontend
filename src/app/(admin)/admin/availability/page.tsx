'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiDelete, apiGet, apiPost } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import type { AvailabilityRule, BlockedDate } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AvailabilityPage() {
  const toast = useToast();
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [blocked, setBlocked] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const ruleForm = useForm({
    defaultValues: { dayOfWeek: '1', startTime: '10:00', endTime: '19:00' },
  });
  const blockForm = useForm({ defaultValues: { date: '', reason: '' } });

  async function load() {
    try {
      setLoading(true);
      const [r, b] = await Promise.all([
        apiGet<AvailabilityRule[] | { items: AvailabilityRule[] }>('/admin/availability'),
        apiGet<BlockedDate[] | { items: BlockedDate[] }>('/admin/blocked-dates').catch(() => []),
      ]);
      setRules(Array.isArray(r) ? r : r.items || []);
      setBlocked(Array.isArray(b) ? b : (b as { items: BlockedDate[] }).items || []);
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

  async function addRule(values: { dayOfWeek: string; startTime: string; endTime: string }) {
    try {
      await apiPost('/admin/availability', {
        dayOfWeek: Number(values.dayOfWeek),
        startTime: values.startTime,
        endTime: values.endTime,
      });
      toast.success('Rule added');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function addBlocked(values: { date: string; reason: string }) {
    try {
      await apiPost('/admin/blocked-dates', values);
      toast.success('Date blocked');
      blockForm.reset();
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function removeRule(id: string) {
    try {
      await apiDelete(`/admin/availability/${id}`);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) return <LoadingSpinner label="Loading availability…" />;
  if (error) return <ErrorState onRetry={() => void load()} />;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader title="Weekly hours" />
        <form
          className="mb-4 grid gap-3 sm:grid-cols-3"
          onSubmit={ruleForm.handleSubmit(addRule)}
        >
          <Select
            label="Day"
            options={days.map((d, i) => ({ value: String(i), label: d }))}
            {...ruleForm.register('dayOfWeek')}
          />
          <Input label="Start" type="time" {...ruleForm.register('startTime')} />
          <Input label="End" type="time" {...ruleForm.register('endTime')} />
          <Button type="submit" variant="gold" className="sm:col-span-3">
            Add rule
          </Button>
        </form>
        {rules.length === 0 ? (
          <EmptyState title="No rules" description="Add weekly availability windows." />
        ) : (
          <ul className="divide-y divide-border text-sm">
            {rules.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2">
                <span>
                  {days[r.dayOfWeek]} · {r.startTime}–{r.endTime}
                </span>
                <Button size="sm" variant="outline" onClick={() => void removeRule(r.id)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Blocked dates" />
        <form className="mb-4 space-y-3" onSubmit={blockForm.handleSubmit(addBlocked)}>
          <Input label="Date" type="date" {...blockForm.register('date', { required: true })} />
          <Input label="Reason" {...blockForm.register('reason')} />
          <Button type="submit" variant="gold">
            Block date
          </Button>
        </form>
        {blocked.length === 0 ? (
          <EmptyState title="No blocked dates" />
        ) : (
          <ul className="divide-y divide-border text-sm">
            {blocked.map((b) => (
              <li key={b.id} className="py-2">
                {b.date.slice(0, 10)} {b.reason ? `· ${b.reason}` : ''}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
