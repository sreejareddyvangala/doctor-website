import { Container } from '@/components/Container';
import { AppointmentForm } from '@/components/AppointmentForm';
import { cn } from '@/utils/cn';

interface AppointmentSectionProps {
  headingLevel?: 'h1' | 'h2';
  tone?: 'white' | 'gray';
  defaultReason?: string;
}

/** Rocket appointment: narrow max-w-3xl column, centred header, white form card. */
export function AppointmentSection({
  headingLevel: Heading = 'h2',
  tone = 'white',
  defaultReason,
}: AppointmentSectionProps) {
  return (
    <section
      id="appointment"
      aria-labelledby="appointment-heading"
      className={cn('scroll-mt-24 py-16 lg:py-24', tone === 'gray' ? 'bg-gray-50' : 'bg-white')}
    >
      <Container className="max-w-3xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-700">
            Get in Touch
          </p>
          <Heading
            id="appointment-heading"
            className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl"
          >
            Book an Appointment
          </Heading>
          <p className="text-gray-500">
            Fill in the form below and our team will confirm your appointment with Dr. S. Kranthi
            Reddy.
          </p>
        </div>

        <AppointmentForm defaultReason={defaultReason} />
      </Container>
    </section>
  );
}
