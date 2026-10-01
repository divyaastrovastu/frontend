'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ExternalLink, Video } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import {
  formatCurrency,
  formatDate,
  formatTime,
  getErrorMessage,
} from '@/lib/utils';
import type { Appointment, TimeSlot } from '@/types';
import { AppointmentCalendar } from '@/components/AppointmentCalendar';
import { TimeSlotPicker } from '@/components/TimeSlotPicker';
import { AppointmentStatusBadge } from '@/components/PaymentStatus';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

function meetingLabel(platform?: string | null) {
  switch (platform) {
    case 'WHATSAPP':
      return 'WhatsApp consultation';
    case 'GOOGLE_MEET':
      return 'Google Meet';
    case 'ZOOM':
      return 'Zoom';
    case 'PHONE':
      return 'Phone call';
    case 'IN_PERSON':
      return 'In-person visit';
    default:
      return 'Consultation';
  }
}

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [item, setItem] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await apiGet<Appointment>(`/appointments/${id}`);
      setItem(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!date || !item) return;
    (async () => {
      try {
        setSlotsLoading(true);
        setStartTime(null);
        const data = await apiGet<TimeSlot[] | { slots: TimeSlot[] }>('/availability/slots', {
          serviceId: item.serviceId,
          date: format(date, 'yyyy-MM-dd'),
        });
        setSlots(Array.isArray(data) ? data : data.slots || []);
      } catch {
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    })();
  }, [date, item]);

  async function pay() {
    try {
      setBusy(true);
      const order = await apiPost<{
        orderId?: string;
        paymentId?: string;
        mock?: boolean;
      }>('/payments/create', { appointmentId: item?.id });
      if (order.mock && order.paymentId) {
        await apiPost(`/payments/${order.paymentId}/mock-complete`);
        toast.success('Payment confirmed');
        await load();
      } else if (order.orderId) {
        toast.info('Complete checkout with the payment provider.');
      } else {
        toast.error('Could not start payment');
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Payment could not be started'));
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    try {
      setBusy(true);
      await apiPost(`/appointments/${id}/cancel`, { reason: 'Cancelled by customer' });
      toast.success('Appointment cancelled');
      setCancelOpen(false);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function reschedule() {
    if (!date || !startTime) return;
    try {
      setBusy(true);
      await apiPost(`/appointments/${id}/reschedule`, {
        appointmentDate: format(date, 'yyyy-MM-dd'),
        startTime,
      });
      toast.success('Appointment rescheduled');
      setRescheduleOpen(false);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading appointment…" />;
  if (error || !item) {
    return (
      <ErrorState
        onRetry={() => void load()}
        action={
          <Button variant="outline" onClick={() => router.push('/dashboard/appointments')}>
            Back
          </Button>
        }
      />
    );
  }

  const canAct = !['CANCELLED', 'COMPLETED', 'REFUNDED'].includes(item.status);

  return (
    <>
      <Card>
        <CardHeader
          title={item.service?.name || 'Appointment'}
          description={`Ref ${item.bookingRef}`}
          action={<AppointmentStatusBadge status={item.status} />}
        />
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Date</dt>
            <dd className="font-medium text-navy">{formatDate(item.appointmentDate)}</dd>
          </div>
          <div>
            <dt className="text-muted">Time</dt>
            <dd className="font-medium text-navy">
              {formatTime(item.startTime)} – {formatTime(item.endTime)}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Amount</dt>
            <dd className="font-medium text-navy">{formatCurrency(item.amount)}</dd>
          </div>
          <div>
            <dt className="text-muted">Mode</dt>
            <dd className="font-medium text-navy">{meetingLabel(item.meetingPlatform)}</dd>
          </div>
        </dl>

        {(item.meetingLink || item.meetingPlatform) && (
          <div className="mt-5 rounded-lg border border-gold/40 bg-gold/10 p-4">
            <div className="flex items-start gap-3">
              <Video className="mt-0.5 h-5 w-5 shrink-0 text-navy" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy">Join your consultation</p>
                <p className="mt-1 text-sm text-charcoal/80">
                  {item.meetingPlatform === 'WHATSAPP'
                    ? 'Open WhatsApp at your appointment time and send the pre-filled message to start.'
                    : item.meetingPlatform === 'PHONE'
                      ? 'Keep your phone ready — you will receive a call at the scheduled time.'
                      : item.meetingPlatform === 'IN_PERSON'
                        ? 'Visit the clinic address shared on the Contact page. Arrive a few minutes early.'
                        : 'Use the join button below at your appointment time.'}
                </p>
                {item.meetingLink ? (
                  <a
                    href={item.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex"
                  >
                    <Button variant="gold">
                      {item.meetingPlatform === 'WHATSAPP' ? 'Open WhatsApp' : 'Join now'}
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                ) : (
                  <p className="mt-2 text-sm text-muted">
                    Link will appear here once the astrologer shares it.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {item.notes && <p className="mt-4 text-sm text-muted">Notes: {item.notes}</p>}
        <div className="mt-6 flex flex-wrap gap-2">
          {item.status === 'PAYMENT_PENDING' && (
            <Button variant="gold" loading={busy} onClick={() => void pay()}>
              Pay now
            </Button>
          )}
          {canAct && (
            <>
              <Button variant="outline" onClick={() => setRescheduleOpen(true)}>
                Reschedule
              </Button>
              <Button variant="danger" onClick={() => setCancelOpen(true)}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </Card>

      <ConfirmationModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={cancel}
        title="Cancel appointment?"
        message="This cannot be undone. Refund eligibility depends on cancellation window."
        confirmLabel="Cancel booking"
        danger
        loading={busy}
      />

      <Modal
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        title="Reschedule"
        size="lg"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <AppointmentCalendar selected={date} onSelect={setDate} />
          <div>
            {date ? (
              <TimeSlotPicker
                slots={slots}
                selected={startTime}
                onSelect={setStartTime}
                loading={slotsLoading}
              />
            ) : (
              <p className="text-sm text-muted">Select a new date</p>
            )}
            <Button
              className="mt-4"
              variant="gold"
              disabled={!date || !startTime}
              loading={busy}
              onClick={() => void reschedule()}
            >
              Confirm new slot
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
