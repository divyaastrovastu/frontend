import { Suspense } from 'react';
import { PageHero } from '@/components/PageHero';
import { BookingFlow } from '@/features/booking/BookingFlow';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const metadata = { title: 'Book Consultation' };

export default function BookPage() {
  return (
    <>
      <PageHero
        title="Book a Consultation"
        subtitle="Select a service, choose a convenient slot, and confirm your appointment."
      />
      <section className="container-page py-12 md:py-16">
        <Suspense fallback={<LoadingSpinner label="Preparing booking…" />}>
          <BookingFlow />
        </Suspense>
      </section>
    </>
  );
}
