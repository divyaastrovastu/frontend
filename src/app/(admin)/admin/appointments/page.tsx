'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '@/lib/api';
import { formatCurrency, formatDate, formatTime, getErrorMessage } from '@/lib/utils';
import type { Appointment, AppointmentStatus } from '@/types';
import { AppointmentStatusBadge } from '@/components/PaymentStatus';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';

const statuses: AppointmentStatus[] = [
  'PENDING',
  'PAYMENT_PENDING',
  'CONFIRMED',
  'RESCHEDULED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
];

export default function AdminAppointmentsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('');
  const [meetingFor, setMeetingFor] = useState<Appointment | null>(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingPlatform, setMeetingPlatform] = useState('WHATSAPP');
  const [savingMeeting, setSavingMeeting] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await apiGet<Appointment[] | { items: Appointment[] }>('/admin/appointments', {
        status: filter || undefined,
      });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function updateStatus(id: string, status: string) {
    try {
      await apiPatch(`/admin/appointments/${id}/status`, { status });
      toast.success('Status updated');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  function openMeeting(a: Appointment) {
    setMeetingFor(a);
    setMeetingLink(a.meetingLink || '');
    setMeetingPlatform(a.meetingPlatform || 'WHATSAPP');
  }

  async function saveMeeting() {
    if (!meetingFor) return;
    try {
      setSavingMeeting(true);
      await apiPatch(`/admin/appointments/${meetingFor.id}/meeting`, {
        meetingLink: meetingLink || '',
        meetingPlatform,
      });
      toast.success('Join link saved');
      setMeetingFor(null);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingMeeting(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading appointments…" />;
  if (error) return <ErrorState onRetry={() => void load()} />;

  return (
    <>
      <Card>
        <CardHeader
          title="Appointments"
          action={
            <Select
              options={[{ value: '', label: 'All statuses' }, ...statuses.map((s) => ({ value: s, label: s }))]}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-48"
            />
          }
        />
        {items.length === 0 ? (
          <EmptyState title="No appointments" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-border text-muted">
                <tr>
                  <th className="py-2 font-medium">Ref</th>
                  <th className="py-2 font-medium">Customer</th>
                  <th className="py-2 font-medium">Service</th>
                  <th className="py-2 font-medium">When</th>
                  <th className="py-2 font-medium">Amount</th>
                  <th className="py-2 font-medium">Join</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((a) => (
                  <tr key={a.id}>
                    <td className="py-3">{a.bookingRef}</td>
                    <td className="py-3">{a.customer?.name || a.customerId.slice(0, 8)}</td>
                    <td className="py-3">{a.service?.name || '—'}</td>
                    <td className="py-3">
                      {formatDate(a.appointmentDate)} {formatTime(a.startTime)}
                    </td>
                    <td className="py-3">{formatCurrency(a.amount)}</td>
                    <td className="py-3">
                      {a.meetingLink ? (
                        <a
                          href={a.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gold underline"
                        >
                          Open
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="py-3">
                      <AppointmentStatusBadge status={a.status} />
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        <Button size="sm" variant="outline" onClick={() => openMeeting(a)}>
                          Join link
                        </Button>
                        {a.status !== 'CONFIRMED' && (
                          <Button size="sm" variant="outline" onClick={() => void updateStatus(a.id, 'CONFIRMED')}>
                            Confirm
                          </Button>
                        )}
                        {a.status !== 'COMPLETED' && (
                          <Button size="sm" variant="ghost" onClick={() => void updateStatus(a.id, 'COMPLETED')}>
                            Complete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(meetingFor)}
        onClose={() => setMeetingFor(null)}
        title={`Join link · ${meetingFor?.bookingRef || ''}`}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-navy">Platform</label>
            <select
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
              value={meetingPlatform}
              onChange={(e) => setMeetingPlatform(e.target.value)}
            >
              <option value="WHATSAPP">WhatsApp</option>
              <option value="GOOGLE_MEET">Google Meet</option>
              <option value="ZOOM">Zoom</option>
              <option value="PHONE">Phone</option>
              <option value="IN_PERSON">In person</option>
            </select>
          </div>
          <Input
            label="Meeting / WhatsApp link"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="https://wa.me/... or https://meet.google.com/..."
          />
          <Button variant="gold" loading={savingMeeting} onClick={() => void saveMeeting()}>
            Save join link
          </Button>
        </div>
      </Modal>
    </>
  );
}
