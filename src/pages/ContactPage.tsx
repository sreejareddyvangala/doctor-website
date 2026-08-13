import { SeoHead } from '@/components/SeoHead';
import { PageHero } from '@/components/PageHero';
import { Contact } from '@/components/sections/Contact';
import { Locations } from '@/components/sections/Locations';
import { contact, doctor } from '@/data/site';

export default function ContactPage() {
  return (
    <>
      <SeoHead
        title="Contact"
        description={`Contact ${doctor.name} — call or message ${contact.phone} on WhatsApp. Consultations at three clinic locations.`}
      />

      <PageHero
        eyebrow="Contact"
        title="Contact the clinic"
        description={`Call ${contact.phone}, message us on WhatsApp, or request an appointment online.`}
        crumbs={[{ label: 'Contact' }]}
      />

      <Contact tone="white" />
      <Locations tone="gray" />
    </>
  );
}
