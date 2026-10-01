import { PageHero } from '@/components/PageHero';
import { businessConfig } from '@/lib/businessConfig';

export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Privacy Policy" subtitle={`How ${businessConfig.name} handles your personal information.`} />
      <article className="container-page prose-dav max-w-3xl py-12 md:py-16">
        <p>
          We collect account details, birth details you choose to share, booking information, and
          payment metadata required to deliver consultations. Data is used to schedule appointments,
          process payments, send reminders, and improve our services.
        </p>
        <h2>Information we collect</h2>
        <p>
          Name, email, mobile number, birth chart details, saved profiles, appointment history, and
          notification preferences. Payment card data is handled by our payment provider and is not
          stored on our servers.
        </p>
        <h2>How we use data</h2>
        <p>
          To provide astrology consultations, manage bookings, issue invoices, send transactional
          messages (email/WhatsApp), and — only with your consent — greeting or promotional
          campaigns.
        </p>
        <h2>Contact</h2>
        <p>
          For privacy requests email{' '}
          <a className="text-gold underline" href={`mailto:${businessConfig.email}`}>
            {businessConfig.email}
          </a>
          .
        </p>
      </article>
    </>
  );
}
