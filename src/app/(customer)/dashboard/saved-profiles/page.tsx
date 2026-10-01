'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiDelete, apiGet, apiPost } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import type { SavedProfile } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';

const schema = z.object({
  label: z.string().min(1),
  relation: z.enum(['SELF', 'SPOUSE', 'CHILD', 'PARENT', 'OTHER']),
  name: z.string().min(1),
  dateOfBirth: z.string().optional(),
  birthTime: z.string().optional(),
  birthPlace: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function SavedProfilesPage() {
  const toast = useToast();
  const [items, setItems] = useState<SavedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { relation: 'SELF' },
  });

  async function load() {
    try {
      setLoading(true);
      const data = await apiGet<SavedProfile[] | { items: SavedProfile[] }>('/saved-profiles');
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

  async function onSubmit(values: FormValues) {
    try {
      await apiPost('/saved-profiles', values);
      toast.success('Profile saved');
      setOpen(false);
      reset({ relation: 'SELF' });
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function remove(id: string) {
    try {
      await apiDelete(`/saved-profiles/${id}`);
      toast.success('Removed');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) return <LoadingSpinner label="Loading profiles…" />;
  if (error) return <ErrorState onRetry={() => void load()} />;

  return (
    <>
      <Card>
        <CardHeader
          title="Saved profiles"
          description="Store birth details for family members."
          action={
            <Button variant="gold" size="sm" onClick={() => setOpen(true)}>
              Add profile
            </Button>
          }
        />
        {items.length === 0 ? (
          <EmptyState title="No saved profiles" description="Add relatives for quicker bookings." />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-navy">
                    {p.name} <span className="text-xs text-muted">({p.label})</span>
                  </p>
                  <p className="text-xs text-muted">
                    {p.relation}
                    {p.birthPlace ? ` · ${p.birthPlace}` : ''}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => void remove(p.id)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Add saved profile">
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Label" error={errors.label?.message} {...register('label')} />
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Select
            label="Relation"
            options={[
              { value: 'SELF', label: 'Self' },
              { value: 'SPOUSE', label: 'Spouse' },
              { value: 'CHILD', label: 'Child' },
              { value: 'PARENT', label: 'Parent' },
              { value: 'OTHER', label: 'Other' },
            ]}
            {...register('relation')}
          />
          <Input label="Date of birth" type="date" {...register('dateOfBirth')} />
          <Input label="Birth time" type="time" {...register('birthTime')} />
          <Input label="Birth place" {...register('birthPlace')} />
          <Button type="submit" variant="gold" className="w-full" loading={isSubmitting}>
            Save
          </Button>
        </form>
      </Modal>
    </>
  );
}
