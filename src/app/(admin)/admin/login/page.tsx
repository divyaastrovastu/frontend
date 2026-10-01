'use client';

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
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const { login } = useAuth();
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
      const user = await login(values.email, values.password);
      if (user.role !== 'ADMIN') {
        setError('Admin access required');
        return;
      }
      toast.success('Welcome, admin');
      router.push('/admin');
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed'));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <Card className="w-full max-w-md">
        <p className="text-xs uppercase tracking-wide text-gold">Admin</p>
        <h1 className="mt-1 font-serif text-2xl text-navy">DivyaAstroVastu CMS</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register('password')}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" variant="gold" className="w-full" loading={isSubmitting}>
            Sign in
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-muted">
          <Link href="/">Back to website</Link>
        </p>
      </Card>
    </div>
  );
}
