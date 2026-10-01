'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHero } from '@/components/PageHero';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { apiPost } from '@/lib/api';
import { useBranding } from '@/lib/branding';
import { formatBusinessAddress } from '@/lib/businessConfig';
import { getErrorMessage, whatsappUrl } from '@/lib/utils';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Please write at least 10 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function ContactPage() {
  const toast = useToast();
  const { branding } = useBranding();
  const { t } = useI18n();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await apiPost('/contact', values);
      setSent(true);
      reset();
      toast.success(t('contact.success'));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not send message. Please try WhatsApp or email.'));
    }
  }

  return (
    <>
      <PageHero title={t('contact.title')} subtitle={t('contact.subtitle')} />
      <section className="container-page grid gap-8 py-14 md:grid-cols-2 md:py-16">
        <Card>
          <h2 className="font-serif text-xl text-navy">{t('contact.formTitle')}</h2>
          {sent ? (
            <p className="mt-4 text-sm text-success">{t('contact.success')}</p>
          ) : null}
          <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input label={t('contact.nameLabel')} error={errors.name?.message} {...register('name')} />
            <Input
              label={t('contact.emailLabel')}
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input label={t('contact.phoneLabel')} error={errors.phone?.message} {...register('phone')} />
            <Input
              label={t('contact.subjectLabel')}
              error={errors.subject?.message}
              {...register('subject')}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-navy">{t('contact.messageLabel')}</label>
              <textarea
                className="min-h-[120px] w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                {...register('message')}
              />
              {errors.message && <p className="text-xs text-danger">{errors.message.message}</p>}
            </div>
            <Button type="submit" variant="gold" loading={isSubmitting} className="w-full">
              {t('contact.submit')}
            </Button>
          </form>
        </Card>
        <div className="space-y-4">
          <Card>
            <h3 className="font-serif text-lg text-navy">{t('home.contactTitle')}</h3>
            <ul className="mt-4 space-y-3 text-sm text-charcoal/85">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-gold-dark" />
                {formatBusinessAddress(branding)}
              </li>
              <li className="flex gap-2">
                <Phone className="h-4 w-4 text-gold-dark" />
                <div className="flex flex-col gap-1">
                  <a className="text-navy hover:underline" href={`tel:${branding.phone.replace(/\s/g, '')}`}>
                    {branding.phone}
                  </a>
                  {branding.phoneSecondary ? (
                    <a
                      className="text-navy hover:underline"
                      href={`tel:${branding.phoneSecondary.replace(/\s/g, '')}`}
                    >
                      {branding.phoneSecondary}
                    </a>
                  ) : null}
                </div>
              </li>
              <li className="flex gap-2">
                <Mail className="h-4 w-4 text-gold-dark" />
                <a className="text-navy hover:underline" href={`mailto:${branding.email}`}>
                  {branding.email}
                </a>
              </li>
            </ul>
            <p className="mt-4 text-xs text-charcoal/70">
              {branding.consultationHours || t('common.hoursPending')}
            </p>
            <a
              href={whatsappUrl(branding.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="mt-5 block"
            >
              <Button variant="outline" className="w-full">
                {t('home.ctaWhatsapp')}
              </Button>
            </a>
          </Card>
        </div>
      </section>
    </>
  );
}
