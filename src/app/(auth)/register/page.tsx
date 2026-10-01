'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth';
import { getErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';

const schema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    mobile: z.string().optional(),
    password: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string().min(8),
    dateOfBirth: z.string().optional(),
    birthTime: z.string().optional(),
    birthPlace: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      setError('');
      const { confirmPassword, ...payload } = values;
      void confirmPassword;
      await registerUser(payload);
      toast.success('Account created');
      router.push('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed'));
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <h1 className="font-serif text-2xl text-navy">Create account</h1>
      <p className="mt-1 text-sm text-muted">Register to book consultations and manage profiles.</p>
      <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <div className="sm:col-span-2">
          <Input label="Full name" error={errors.name?.message} {...register('name')} />
        </div>
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Mobile" error={errors.mobile?.message} {...register('mobile')} />
        <Input
          label="Password"
          type="password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm password"
          type="password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
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
        {error && <p className="sm:col-span-2 text-sm text-danger">{error}</p>}
        <div className="sm:col-span-2">
          <Button type="submit" variant="gold" className="w-full" loading={isSubmitting}>
            Create account
          </Button>
        </div>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        Already registered?{' '}
        <Link href="/login" className="text-navy hover:text-gold">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
