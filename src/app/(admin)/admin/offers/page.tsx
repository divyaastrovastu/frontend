'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Tag } from 'lucide-react';
import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api';
import { formatCurrency, formatDate, getErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';

export type Coupon = {
  id: string;
  code: string;
  description?: string | null;
  discountType: 'PERCENTAGE' | 'FIXED' | string;
  discountValue: number | string;
  maxUses?: number | null;
  usedCount: number;
  validFrom?: string | null;
  validUntil?: string | null;
  isActive: boolean;
  createdAt: string;
};

type OfferForm = {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxUses: number | '';
  validFrom: string;
  validUntil: string;
  isActive: boolean;
};

const emptyForm: OfferForm = {
  code: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  maxUses: '',
  validFrom: '',
  validUntil: '',
  isActive: true,
};

export default function AdminOffersPage() {
  const toast = useToast();
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const form = useForm<OfferForm>({ defaultValues: emptyForm });

  async function load() {
    try {
      setLoading(true);
      const data = await apiGet<Coupon[] | { items: Coupon[] }>('/admin/offers');
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
    form.reset(emptyForm);
    setOpen(true);
  }

  function openEdit(c: Coupon) {
    setEditing(c);
    form.reset({
      code: c.code,
      description: c.description || '',
      discountType: (c.discountType as 'PERCENTAGE' | 'FIXED') || 'PERCENTAGE',
      discountValue: Number(c.discountValue),
      maxUses: c.maxUses ?? '',
      validFrom: c.validFrom ? c.validFrom.slice(0, 10) : '',
      validUntil: c.validUntil ? c.validUntil.slice(0, 10) : '',
      isActive: c.isActive,
    });
    setOpen(true);
  }

  async function onSubmit(values: OfferForm) {
    const payload = {
      code: values.code.trim().toUpperCase(),
      description: values.description || null,
      discountType: values.discountType,
      discountValue: Number(values.discountValue),
      maxUses: values.maxUses === '' ? null : Number(values.maxUses),
      validFrom: values.validFrom || null,
      validUntil: values.validUntil || null,
      isActive: values.isActive,
    };
    try {
      if (editing) {
        await apiPatch(`/admin/offers/${editing.id}`, payload);
        toast.success('Offer updated');
      } else {
        await apiPost('/admin/offers', payload);
        toast.success('Offer created');
      }
      setOpen(false);
      setEditing(null);
      form.reset(emptyForm);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function remove(id: string) {
    try {
      await apiDelete(`/admin/offers/${id}`);
      toast.success('Offer deleted');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) return <LoadingSpinner label="Loading offers…" />;
  if (error) return <ErrorState onRetry={() => void load()} />;

  return (
    <>
      <Card>
        <CardHeader
          title="Offers & coupons"
          description="Promo codes customers can apply at booking. Service sale prices are set under Services."
          action={
            <Button variant="gold" size="sm" onClick={openCreate}>
              <Tag className="h-4 w-4" />
              Add offer
            </Button>
          }
        />
        {items.length === 0 ? (
          <EmptyState
            title="No coupon offers yet"
            description="Create a code like WELCOME10 for 10% off at checkout."
          />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-navy">
                    <span className="rounded bg-gold/15 px-2 py-0.5 font-mono text-sm">{c.code}</span>
                    {!c.isActive && (
                      <span className="ml-2 text-xs text-muted">Inactive</span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {c.discountType === 'FIXED'
                      ? `${formatCurrency(c.discountValue)} off`
                      : `${Number(c.discountValue)}% off`}
                    {c.description ? ` · ${c.description}` : ''}
                    {' · '}
                    Used {c.usedCount}
                    {c.maxUses != null ? `/${c.maxUses}` : ''}
                    {c.validUntil ? ` · until ${formatDate(c.validUntil)}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void remove(c.id)}>
                    Delete
                  </Button>
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
        title={editing ? 'Edit offer' : 'New offer'}
      >
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <Input
            label="Coupon code"
            placeholder="WELCOME10"
            {...form.register('code', { required: true })}
          />
          <Input label="Description (optional)" {...form.register('description')} />
          <Select
            label="Discount type"
            options={[
              { value: 'PERCENTAGE', label: 'Percentage (%)' },
              { value: 'FIXED', label: 'Fixed amount (₹)' },
            ]}
            {...form.register('discountType')}
          />
          <Input
            label="Discount value"
            type="number"
            {...form.register('discountValue', { valueAsNumber: true, required: true })}
          />
          <Input label="Max uses (optional)" type="number" {...form.register('maxUses')} />
          <Input label="Valid from" type="date" {...form.register('validFrom')} />
          <Input label="Valid until" type="date" {...form.register('validUntil')} />
          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" {...form.register('isActive')} /> Active
          </label>
          <Button type="submit" variant="gold" className="w-full">
            {editing ? 'Save changes' : 'Create offer'}
          </Button>
        </form>
      </Modal>
    </>
  );
}
