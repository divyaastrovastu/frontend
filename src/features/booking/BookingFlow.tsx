'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Check } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import {
  formatCurrency,
  formatDate,
  formatTime,
  getEffectivePrice,
  getErrorMessage,
} from '@/lib/utils';
import type { Appointment, Service, TimeSlot } from '@/types';
import { AppointmentCalendar } from '@/components/AppointmentCalendar';
import { TimeSlotPicker } from '@/components/TimeSlotPicker';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';

const steps = ['Service', 'Date & Time', 'Details', 'Confirm'];
const DRAFT_KEY = 'dav_booking_draft';

type BookingDraft = {
  serviceId?: string;
  serviceSlug?: string;
  date?: string;
  startTime?: string;
  notes?: string;
  step?: number;
};

function normalizeSlots(data: TimeSlot[] | { slots: TimeSlot[] } | null | undefined): TimeSlot[] {
  const list = Array.isArray(data) ? data : data?.slots || [];
  return list.map((s) => ({
    startTime: s.startTime,
    endTime: s.endTime,
    available: s.available !== false,
  }));
}

export function BookingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponPreview, setCouponPreview] = useState<{
    discount: number;
    finalAmount: number;
    code: string;
  } | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState<Appointment | null>(null);
  const [paid, setPaid] = useState(false);

  // Restore draft after login redirect
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as BookingDraft;
      if (draft.date) setDate(new Date(draft.date));
      if (draft.startTime) setStartTime(draft.startTime);
      if (draft.notes) setNotes(draft.notes);
      if (typeof draft.step === 'number') setStep(draft.step);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingServices(true);
        const data = await apiGet<Service[] | { items: Service[] }>('/services');
        const list = Array.isArray(data) ? data : data.items || [];
        if (cancelled) return;
        const active = list.filter((s) => s.isActive);
        setServices(active);

        let draft: BookingDraft = {};
        try {
          draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || '{}') as BookingDraft;
        } catch {
          draft = {};
        }

        const slug = searchParams.get('service') || draft.serviceSlug;
        const id = draft.serviceId;
        const match =
          active.find((s) => (slug ? s.slug === slug : false)) ||
          active.find((s) => (id ? s.id === id : false));
        if (match) {
          setService(match);
          if (draft.step && draft.step > 0) setStep(draft.step);
          else setStep(1);
        }
      } catch {
        if (!cancelled) setServicesError(true);
      } finally {
        if (!cancelled) setLoadingServices(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  useEffect(() => {
    if (!service || !date) return;
    let cancelled = false;
    (async () => {
      try {
        setSlotsLoading(true);
        setStartTime((prev) => prev); // keep restored time until slots load
        const data = await apiGet<TimeSlot[] | { slots: TimeSlot[] }>('/availability/slots', {
          date: format(date, 'yyyy-MM-dd'),
          duration: service.durationMinutes,
        });
        if (cancelled) return;
        const normalized = normalizeSlots(data);
        setSlots(normalized);
        setStartTime((prev) =>
          prev && normalized.some((s) => s.startTime === prev && s.available !== false) ? prev : null
        );
      } catch {
        if (!cancelled) {
          setSlots([]);
          toast.error('Could not load slots for this date.');
        }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [service, date, toast]);

  // Persist draft while booking
  useEffect(() => {
    if (!service) return;
    const draft: BookingDraft = {
      serviceId: service.id,
      serviceSlug: service.slug,
      date: date ? format(date, 'yyyy-MM-dd') : undefined,
      startTime: startTime || undefined,
      notes,
      step,
    };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [service, date, startTime, notes, step]);

  const price = useMemo(() => (service ? getEffectivePrice(service) : 0), [service]);
  const payable = couponPreview?.finalAmount ?? price;

  async function applyCoupon() {
    if (!couponCode.trim() || !service) return;
    try {
      setCouponChecking(true);
      const preview = await apiPost<{
        discount: number;
        finalAmount: number;
        code: string;
      }>('/offers/preview', {
        code: couponCode.trim(),
        amount: price,
      });
      setCouponPreview(preview);
      setCouponCode(preview.code);
      toast.success(`Offer applied: ${formatCurrency(preview.discount)} off`);
    } catch (err) {
      setCouponPreview(null);
      toast.error(getErrorMessage(err, 'Invalid offer code'));
    } finally {
      setCouponChecking(false);
    }
  }

  async function submitBooking() {
    if (!service || !date || !startTime) return;
    if (authLoading) {
      toast.error('Checking login status… please try again in a moment.');
      return;
    }
    if (!isAuthenticated) {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          serviceId: service.id,
          serviceSlug: service.slug,
          date: format(date, 'yyyy-MM-dd'),
          startTime,
          notes,
          step: 2,
        } satisfies BookingDraft)
      );
      router.push(`/login?redirect=${encodeURIComponent(`/book?service=${service.slug}`)}`);
      return;
    }
    try {
      setSubmitting(true);
      const result = await apiPost<{
        appointment: Appointment;
        payment: { paymentId: string; orderId: string; mock?: boolean; keyId?: string; amount: number };
        meeting?: { meetingLink?: string; meetingPlatform?: string; meetingInstructions?: string };
      }>('/appointments', {
        serviceId: service.id,
        appointmentDate: format(date, 'yyyy-MM-dd'),
        startTime,
        notes: notes || undefined,
        couponCode: couponPreview?.code || couponCode.trim() || undefined,
      });
      setBooking({
        ...result.appointment,
        meetingLink: result.appointment.meetingLink || result.meeting?.meetingLink || null,
        meetingPlatform:
          result.appointment.meetingPlatform || result.meeting?.meetingPlatform || null,
      });
      let paymentOk = false;
      if (result.payment?.mock && result.payment.paymentId) {
        await apiPost(`/payments/${result.payment.paymentId}/mock-complete`);
        paymentOk = true;
        toast.success('Consultation booked and confirmed.');
      } else if (result.payment?.orderId && !result.payment.mock) {
        toast.success('Appointment created. Complete Razorpay payment to confirm.');
      } else {
        toast.success('Appointment created.');
      }
      setPaid(paymentOk);
      sessionStorage.removeItem(DRAFT_KEY);
      setStep(3);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Booking failed. Please try another slot.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingServices || authLoading) return <LoadingSpinner label="Preparing booking…" />;
  if (servicesError) {
    return (
      <ErrorState
        title="Services unavailable"
        message="We could not load consultation services. Make sure the API is running."
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-8">
      <ol className="flex flex-wrap gap-2">
        {steps.map((label, i) => (
          <li
            key={label}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
              i === step
                ? 'bg-navy text-white'
                : i < step
                  ? 'bg-gold/25 text-navy'
                  : 'border border-border bg-white text-charcoal/70'
            }`}
          >
            {i < step ? <Check className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
            {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {services.length === 0 ? (
            <EmptyState
              className="md:col-span-2"
              title="No services listed"
              description="Consultation packages will appear here once published."
            />
          ) : (
            services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setService(s);
                  setDate(null);
                  setStartTime(null);
                  setStep(1);
                }}
                className="rounded-xl border border-border bg-white p-5 text-left transition hover:border-gold hover:shadow-sm"
              >
                <h3 className="font-serif text-xl text-navy">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/80">{s.shortDescription}</p>
                <p className="mt-4 font-semibold text-navy">
                  {formatCurrency(getEffectivePrice(s))} · {s.durationMinutes} mins
                </p>
              </button>
            ))
          )}
        </div>
      )}

      {step === 1 && service && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm text-charcoal/80">
              Selected: <strong className="text-navy">{service.name}</strong>
            </p>
            <AppointmentCalendar
              selected={date}
              onSelect={(d) => {
                setDate(d);
                setStartTime(null);
              }}
            />
            <p className="mt-3 text-xs text-charcoal/70">
              Tip: choose a weekday (Mon–Sat). Closed dates show no slots.
            </p>
          </div>
          <Card>
            <h3 className="mb-4 font-serif text-lg text-navy">
              {date ? formatDate(date.toISOString()) : 'Select a date'}
            </h3>
            {date ? (
              <TimeSlotPicker
                slots={slots}
                selected={startTime}
                onSelect={setStartTime}
                loading={slotsLoading}
              />
            ) : (
              <EmptyState title="Pick a date" description="Available times will show here." />
            )}
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button variant="gold" disabled={!date || !startTime} onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          </Card>
        </div>
      )}

      {step === 2 && service && date && startTime && (
        <Card className="mx-auto max-w-xl">
          <h3 className="font-serif text-xl text-navy">Confirm details</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal/70">Service</dt>
              <dd className="font-semibold text-navy">{service.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal/70">Date</dt>
              <dd className="font-semibold text-navy">{formatDate(date.toISOString())}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal/70">Time</dt>
              <dd className="font-semibold text-navy">{formatTime(startTime)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal/70">Amount</dt>
              <dd className="font-semibold text-navy">
                {couponPreview ? (
                  <>
                    <span className="mr-2 text-sm font-normal text-muted line-through">
                      {formatCurrency(price)}
                    </span>
                    {formatCurrency(payable)}
                  </>
                ) : (
                  formatCurrency(price)
                )}
              </dd>
            </div>
            {user && (
              <div className="flex justify-between gap-4">
                <dt className="text-charcoal/70">Booked for</dt>
                <dd className="font-semibold text-navy">{user.name}</dd>
              </div>
            )}
          </dl>
          <div className="mt-4 space-y-3">
            <Input
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Share birth details or questions"
            />
            {isAuthenticated && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">Offer code</label>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponPreview(null);
                    }}
                    placeholder="e.g. WELCOME10"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    loading={couponChecking}
                    onClick={() => void applyCoupon()}
                    disabled={!couponCode.trim()}
                  >
                    Apply
                  </Button>
                </div>
                {couponPreview && (
                  <p className="mt-1 text-xs text-success">
                    {couponPreview.code} applied — you save {formatCurrency(couponPreview.discount)}.
                  </p>
                )}
              </div>
            )}
          </div>
          {!isAuthenticated && (
            <p className="mt-4 rounded-md border border-border bg-ivory px-3 py-2 text-sm text-charcoal">
              Please{' '}
              <Link
                href={`/login?redirect=${encodeURIComponent(`/book?service=${service.slug}`)}`}
                className="font-semibold text-navy underline"
              >
                log in
              </Link>{' '}
              or{' '}
              <Link href="/register" className="font-semibold text-navy underline">
                create an account
              </Link>{' '}
              to complete booking. Your selection will be saved.
            </p>
          )}
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button variant="gold" loading={submitting} onClick={() => void submitBooking()}>
              {isAuthenticated ? 'Confirm & pay' : 'Login to book'}
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && booking && (
        <Card className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
            <Check className="h-7 w-7" />
          </div>
          <h3 className="font-serif text-2xl text-navy">
            {paid ? 'Consultation confirmed' : 'Booking received'}
          </h3>
          <p className="mt-2 text-sm text-charcoal/80">
            Reference <strong className="text-navy">{booking.bookingRef}</strong>
            {paid
              ? '. Your appointment is confirmed. Details are in your dashboard.'
              : '. Complete payment to confirm your slot.'}
          </p>
          {booking.meetingLink && (
            <div className="mt-5 rounded-lg border border-gold/40 bg-gold/10 p-4 text-left">
              <p className="text-sm font-semibold text-navy">How to join</p>
              <p className="mt-1 text-sm text-charcoal/80">
                {booking.meetingPlatform === 'WHATSAPP'
                  ? 'At your appointment time, open WhatsApp with the button below and send the message to start your consultation.'
                  : 'Use the join button below at your scheduled time.'}
              </p>
              <a
                href={booking.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex"
              >
                <Button variant="gold">
                  {booking.meetingPlatform === 'WHATSAPP' ? 'Open WhatsApp' : 'Join now'}
                </Button>
              </a>
            </div>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={`/dashboard/appointments/${booking.id}`}>
              <Button variant="gold">View appointment</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Go to dashboard</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
