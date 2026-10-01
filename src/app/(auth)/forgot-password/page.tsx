'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiPost } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await apiPost('/auth/forgot-password', values);
      setDone(true);
      toast.success('If an account exists, reset instructions were sent.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <Card className="w-full max-w-md">
      <h1 className="font-serif text-2xl text-navy">Forgot password</h1>
      <p className="mt-1 text-sm text-muted">We will email you a reset link if the account exists.</p>
      {done ? (
        <p className="mt-6 text-sm text-success">Check your inbox for further instructions.</p>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Button type="submit" variant="gold" className="w-full" loading={isSubmitting}>
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-navy hover:text-gold">
          Back to sign in
        </Link>
      </p>
    </Card>
  );
}
