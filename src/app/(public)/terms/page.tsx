import { PageHero } from '@/components/PageHero';
import { businessConfig } from '@/lib/businessConfig';

export const metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <>
      <PageHero title="Terms of Service" subtitle={`Terms for using ${businessConfig.name} services.`} />
      <article className="container-page prose-dav max-w-3xl py-12 md:py-16">
        <p>
          By booking a consultation or creating an account, you agree to these terms. Astrology and
          Vastu guidance is advisory in nature and does not replace professional medical, legal, or
          financial advice.
        </p>
        <h2>Bookings & attendance</h2>
        <p>
          Appointments are confirmed after successful payment. Please join on time. Repeated
          no-shows may affect future booking privileges.
        </p>
        <h2>Conduct</h2>
        <p>
          Communications must remain respectful. We reserve the right to refuse service in cases of
          abuse or misuse of the platform.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about these terms:{' '}
          <a className="text-gold underline" href={`mailto:${businessConfig.email}`}>
            {businessConfig.email}
          </a>
          .
        </p>
      </article>
    </>
  );
}
