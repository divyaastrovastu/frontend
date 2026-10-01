'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiGet, apiPatch, apiPost } from '@/lib/api';
import { formatDate, getErrorMessage } from '@/lib/utils';
import type { Campaign } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';

type CampaignForm = {
  name: string;
  subject: string;
  message: string;
  audience: string;
  channel: string;
  status: string;
};

export default function AdminCampaignsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const form = useForm<CampaignForm>({
    defaultValues: {
      name: '',
      subject: '',
      message: '',
      audience: 'OPTED_IN',
      channel: 'EMAIL',
      status: 'DRAFT',
    },
  });

  async function load() {
    try {
      setLoading(true);
      const data = await apiGet<Campaign[] | { items: Campaign[] }>('/admin/campaigns');
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

  function openCreate() {
    setEditing(null);
    form.reset({
      name: '',
      subject: '',
      message: '',
      audience: 'OPTED_IN',
      channel: 'EMAIL',
      status: 'DRAFT',
    });
    setOpen(true);
  }

  function openEdit(c: Campaign) {
    setEditing(c);
    form.reset({
      name: c.name,
      subject: c.subject || '',
      message: c.message,
      audience: c.audience,
      channel: c.channels[0] || 'EMAIL',
      status: c.status,
    });
    setOpen(true);
  }

  async function onSubmit(values: CampaignForm) {
    const payload = {
      name: values.name,
      subject: values.subject,
      message: values.message,
      audience: values.audience,
      channels: [values.channel],
      status: values.status,
    };
    try {
      if (editing) {
        await apiPatch(`/admin/campaigns/${editing.id}`, payload);
        toast.success('Campaign updated');
      } else {
        await apiPost('/admin/campaigns', payload);
        toast.success('Campaign created');
      }
      setOpen(false);
      setEditing(null);
      form.reset();
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function run(id: string) {
    try {
      setBusyId(id);
      await apiPost(`/admin/campaigns/${id}/run`);
      toast.success('Campaign started');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={() => void load()} />;

  return (
    <>
      <Card>
        <CardHeader
          title="Campaigns"
          description="Consent-aware greetings and announcements."
          action={
            <Button variant="gold" size="sm" onClick={openCreate}>
              New campaign
            </Button>
          }
        />
        {items.length === 0 ? (
          <EmptyState title="No campaigns" />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-navy">{c.name}</p>
                  <p className="text-xs text-muted">
                    {c.status} · {c.audience} · {c.channels.join(', ')} · {formatDate(c.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                    Edit
                  </Button>
                  {c.status !== 'COMPLETED' && c.status !== 'CANCELLED' && (
                    <Button
                      size="sm"
                      variant="gold"
                      loading={busyId === c.id}
                      onClick={() => void run(c.id)}
                    >
                      Run
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit campaign' : 'Create campaign'}
      >
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <Input label="Name" {...form.register('name', { required: true })} />
          <Input label="Subject" {...form.register('subject')} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-navy">Message</label>
            <textarea
              className="min-h-28 w-full rounded-md border border-border px-3 py-2 text-sm"
              {...form.register('message', { required: true })}
            />
          </div>
          <Select
            label="Audience"
            options={[
              { value: 'OPTED_IN', label: 'Opted in' },
              { value: 'ALL', label: 'All' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'WITH_APPOINTMENTS', label: 'With appointments' },
              { value: 'BIRTHDAY', label: 'Birthday' },
            ]}
            {...form.register('audience')}
          />
          <Select
            label="Channel"
            options={[
              { value: 'EMAIL', label: 'Email' },
              { value: 'WHATSAPP', label: 'WhatsApp' },
            ]}
            {...form.register('channel')}
          />
          <Select
            label="Status"
            options={[
              { value: 'DRAFT', label: 'Draft' },
              { value: 'SCHEDULED', label: 'Scheduled' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
            {...form.register('status')}
          />
          <Button type="submit" variant="gold" className="w-full">
            {editing ? 'Save changes' : 'Save draft'}
          </Button>
        </form>
      </Modal>
    </>
  );
}
