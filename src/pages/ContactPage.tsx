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
        description={`Contact ${doctor.name} — call ${contact.phone} or email ${contact.email}. Consultations at three clinic locations.`}
      />

      <PageHero
        eyebrow="Contact"
        title="Contact the clinic"
        description={`Call ${contact.phone}, email ${contact.email}, or request an appointment online.`}
        crumbs={[{ label: 'Contact' }]}
      />

      <Contact tone="white" />
      <Locations tone="gray" />
    </>
  );
}
