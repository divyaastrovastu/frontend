'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth';
import { getErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password required'),
});

type FormValues = z.infer<typeof schema>;

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
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
      toast.success('Welcome back');
      const redirect = searchParams.get('redirect');
      if (user.role === 'ADMIN') router.push('/admin');
      else router.push(redirect || '/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid email or password'));
    }
  }

  return (
    <Card className="w-full max-w-md">
      <h1 className="font-serif text-2xl text-navy">Sign in</h1>
      <p className="mt-1 text-sm text-muted">Access your consultations and bookings.</p>
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
      <div className="mt-4 flex justify-between text-sm">
        <Link href="/forgot-password" className="text-muted hover:text-gold">
          Forgot password?
        </Link>
        <Link href="/register" className="text-navy hover:text-gold">
          Create account
        </Link>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LoginForm />
    </Suspense>
  );
}
