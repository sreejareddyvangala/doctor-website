import { useLocation } from 'react-router-dom';

import { SeoHead } from '@/components/SeoHead';
import { PageHero } from '@/components/PageHero';
import { AppointmentSection } from '@/components/sections/AppointmentSection';
import { doctor } from '@/data/site';

interface AppointmentState {
  reason?: string;
}

export default function AppointmentPage() {
  const { state } = useLocation();
  const reason = (state as AppointmentState | null)?.reason;

  return (
    <>
      <SeoHead
        title="Book an Appointment"
        description={`Request an appointment with ${doctor.name}, ${doctor.designationTitleCase}, at one of three clinic locations.`}
      />

      <PageHero
        eyebrow="Appointment"
        title="Book an appointment"
        description="Request a consultation at the clinic that suits you best. We will call you to confirm your slot."
        crumbs={[{ label: 'Appointment' }]}
      />

      <AppointmentSection
        tone="white"
        defaultReason={reason ? `I would like to consult about ${reason}.` : undefined}
      />
    </>
  );
}
