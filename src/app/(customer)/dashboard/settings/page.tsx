'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import type { NotificationPreference } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

const fields: { key: keyof NotificationPreference; label: string; hint: string }[] = [
  { key: 'emailEnabled', label: 'Email notifications', hint: 'Receive emails for bookings and updates' },
  { key: 'whatsappEnabled', label: 'WhatsApp notifications', hint: 'Receive WhatsApp messages' },
  { key: 'appointmentReminders', label: 'Appointment reminders', hint: '24h and 1h reminders' },
  { key: 'marketingMessages', label: 'Marketing messages', hint: 'Offers and announcements' },
  { key: 'birthdayGreetings', label: 'Birthday greetings', hint: 'Personal birthday wishes' },
  { key: 'festivalGreetings', label: 'Festival greetings', hint: 'Seasonal and festival messages' },
];

export default function SettingsPage() {
  const toast = useToast();
  const [prefs, setPrefs] = useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<NotificationPreference>('/notifications/preferences');
        setPrefs(data);
      } catch {
        setPrefs({
          id: '',
          userId: '',
          emailEnabled: true,
          whatsappEnabled: true,
          appointmentReminders: true,
          marketingMessages: false,
          birthdayGreetings: true,
          festivalGreetings: true,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    if (!prefs) return;
    try {
      setSaving(true);
      const updated = await apiPatch<NotificationPreference>('/notifications/preferences', prefs);
      setPrefs(updated);
      toast.success('Preferences saved');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading || !prefs) return <LoadingSpinner label="Loading settings…" />;

  return (
    <Card>
      <CardHeader title="Notification settings" description="Control how we reach you." />
      <ul className="space-y-4">
        {fields.map((f) => (
          <li key={f.key} className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-navy">{f.label}</p>
              <p className="text-xs text-muted">{f.hint}</p>
            </div>
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-gold"
              checked={Boolean(prefs[f.key])}
              onChange={(e) => setPrefs({ ...prefs, [f.key]: e.target.checked })}
            />
          </li>
        ))}
      </ul>
      <Button className="mt-6" variant="gold" loading={saving} onClick={() => void save()}>
        Save preferences
      </Button>
    </Card>
  );
}
