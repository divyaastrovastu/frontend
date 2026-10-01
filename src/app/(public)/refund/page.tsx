import { PageHero } from '@/components/PageHero';
import { businessConfig } from '@/lib/businessConfig';

export const metadata = { title: 'Refund Policy' };

export default function RefundPage() {
  return (
    <>
      <PageHero title="Refund Policy" subtitle="Cancellation and refund guidelines for consultations." />
      <article className="container-page prose-dav max-w-3xl py-12 md:py-16">
        <p>
          You may cancel or request a refund according to the notice windows configured for{' '}
          {businessConfig.name}. Typically, cancellations made well in advance may qualify for a
          partial refund; late cancellations may be non-refundable.
        </p>
        <h2>How to request</h2>
        <p>
          Cancel from your dashboard or email{' '}
          <a className="text-gold underline" href={`mailto:${businessConfig.email}`}>
            {businessConfig.email}
          </a>{' '}
          with your booking reference. Approved refunds are processed to the original payment
          method.
        </p>
        <h2>Rescheduling</h2>
        <p>
          Limited reschedules are allowed subject to availability and minimum notice requirements.
        </p>
      </article>
    </>
  );
}
