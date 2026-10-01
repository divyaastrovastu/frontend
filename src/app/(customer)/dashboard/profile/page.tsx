'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiGet, apiPatch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { getErrorMessage } from '@/lib/utils';
import type { User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

const schema = z.object({
  name: z.string().min(2),
  mobile: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  birthTime: z.string().optional().nullable(),
  birthPlace: z.string().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const { refreshUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    (async () => {
      try {
        const me = await apiGet<User>('/auth/me');
        const p = me.customerProfile;
        reset({
          name: me.name,
          mobile: me.mobile || '',
          dateOfBirth: p?.dateOfBirth?.slice(0, 10) || '',
          birthTime: p?.birthTime || '',
          birthPlace: p?.birthPlace || '',
          gender: p?.gender || undefined,
          address: p?.address || '',
          city: p?.city || '',
          state: p?.state || '',
          pincode: p?.pincode || '',
        });
      } catch {
        toast.error('Could not load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [reset, toast]);

  async function onSubmit(values: FormValues) {
    try {
      await apiPatch('/profile', values);
      await refreshUser();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) return <LoadingSpinner label="Loading profile…" />;

  return (
    <Card>
      <CardHeader title="Your profile" description="Keep birth details updated for accurate readings." />
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Name" error={errors.name?.message} {...register('name')} />
        <Input label="Mobile" {...register('mobile')} />
        <Input label="Date of birth" type="date" {...register('dateOfBirth')} />
        <Input label="Birth time" type="time" {...register('birthTime')} />
        <Input label="Birth place" {...register('birthPlace')} />
        <Select
          label="Gender"
          options={[
            { value: 'MALE', label: 'Male' },
            { value: 'FEMALE', label: 'Female' },
            { value: 'OTHER', label: 'Other' },
            { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
          ]}
          placeholder="Select"
          {...register('gender')}
        />
        <div className="sm:col-span-2">
          <Input label="Address" {...register('address')} />
        </div>
        <Input label="City" {...register('city')} />
        <Input label="State" {...register('state')} />
        <Input label="Pincode" {...register('pincode')} />
        <div className="sm:col-span-2">
          <Button type="submit" variant="gold" loading={isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
}
