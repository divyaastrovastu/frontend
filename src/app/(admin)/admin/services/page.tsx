'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api';
import { formatCurrency, getErrorMessage } from '@/lib/utils';
import type { Service } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

type ServiceForm = {
  name: string;
  shortDescription: string;
  description: string;
  durationMinutes: number;
  price: number;
  discountPrice: number | '';
  isActive: boolean;
  isFeatured: boolean;
};

const emptyForm: ServiceForm = {
  name: '',
  shortDescription: '',
  description: '',
  durationMinutes: 30,
  price: 999,
  discountPrice: '',
  isActive: true,
  isFeatured: false,
};

export default function AdminServicesPage() {
  const toast = useToast();
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const form = useForm<ServiceForm>({ defaultValues: emptyForm });

  async function load() {
    try {
      setLoading(true);
      const data = await apiGet<Service[] | { items: Service[] }>('/admin/services');
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

  function openEdit(s: Service) {
    setEditing(s);
    form.reset({
      name: s.name,
      shortDescription: s.shortDescription,
      description: s.description,
      durationMinutes: s.durationMinutes,
      price: Number(s.price),
      discountPrice: s.discountPrice != null ? Number(s.discountPrice) : '',
      isActive: s.isActive,
      isFeatured: s.isFeatured,
    });
    setOpen(true);
  }

  async function onSubmit(values: ServiceForm) {
    const payload = {
      name: values.name,
      shortDescription: values.shortDescription,
      description: values.description,
      durationMinutes: Number(values.durationMinutes),
      price: Number(values.price),
      discountPrice: values.discountPrice === '' ? null : Number(values.discountPrice),
      isActive: values.isActive,
      isFeatured: values.isFeatured,
    };
    try {
      if (editing) {
        await apiPatch(`/admin/services/${editing.id}`, payload);
        toast.success('Service updated');
      } else {
        await apiPost('/admin/services', payload);
        toast.success('Service created');
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
      await apiDelete(`/admin/services/${id}`);
      toast.success('Deleted');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) return <LoadingSpinner label="Loading services…" />;
  if (error) return <ErrorState onRetry={() => void load()} />;

  return (
    <>
      <Card>
        <CardHeader
          title="Services"
          description="Catalog packages. Set an offer price to show discounts on the public site."
          action={
            <Button variant="gold" size="sm" onClick={openCreate}>
              Add service
            </Button>
          }
        />
        {items.length === 0 ? (
          <EmptyState title="No services" />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((s) => {
              const hasOffer =
                s.discountPrice != null && Number(s.discountPrice) < Number(s.price);
              return (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium text-navy">
                      {s.name}
                      {s.isFeatured ? (
                        <span className="ml-2 rounded bg-gold/20 px-1.5 py-0.5 text-[10px] font-semibold text-navy">
                          Featured
                        </span>
                      ) : null}
                    </p>
                    <p className="text-sm text-muted">
                      {hasOffer ? (
                        <>
                          <span className="font-semibold text-navy">
                            {formatCurrency(s.discountPrice!)}
                          </span>{' '}
                          <span className="line-through">{formatCurrency(s.price)}</span>
                          <span className="ml-1 text-success">Offer</span>
                        </>
                      ) : (
                        formatCurrency(s.price)
                      )}{' '}
                      · {s.durationMinutes} mins · {s.isActive ? 'Active' : 'Hidden'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => void remove(s.id)}>
                      Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit service' : 'New service'}
      >
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <Input label="Name" {...form.register('name', { required: true })} />
          <Input label="Short description" {...form.register('shortDescription', { required: true })} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-navy">Description</label>
            <textarea
              className="min-h-24 w-full rounded-md border border-border px-3 py-2 text-sm"
              {...form.register('description', { required: true })}
            />
          </div>
          <Input
            label="Duration (minutes)"
            type="number"
            {...form.register('durationMinutes', { valueAsNumber: true })}
          />
          <Input label="Regular price (₹)" type="number" {...form.register('price', { valueAsNumber: true })} />
          <Input
            label="Offer / discount price (₹, optional)"
            type="number"
            {...form.register('discountPrice')}
          />
          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" {...form.register('isActive')} /> Active on website
          </label>
          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" {...form.register('isFeatured')} /> Featured
          </label>
          <Button type="submit" variant="gold" className="w-full">
            {editing ? 'Save changes' : 'Create'}
          </Button>
        </form>
      </Modal>
    </>
  );
}
