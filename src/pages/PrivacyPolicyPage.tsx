import { SeoHead } from '@/components/SeoHead';
import { PageHero } from '@/components/PageHero';
import { Section } from '@/components/Section';
import { LegalBody, type LegalSection } from '@/components/LegalBody';
import { contact } from '@/data/site';

const sections: LegalSection[] = [
  {
    heading: 'Overview',
    paragraphs: [
      'This policy explains how information submitted through this website is handled. It applies to this website only, and not to any separate systems used by the clinics listed here.',
    ],
  },
  {
    heading: 'Information collected',
    paragraphs: [
      'If you complete the appointment request form, you may provide your name, phone number, email address, preferred clinic, preferred date and time, and a short description of your reason for visiting.',
      'This website does not currently store appointment requests in a database, and does not transmit them to a server. The form provides an on-screen confirmation only. Details you enter remain in your browser for the duration of your visit and are cleared when the form is reset or the page is closed.',
    ],
  },
  {
    heading: 'How information is used',
    paragraphs: [
      'Information you provide is used solely to respond to your enquiry and to arrange a consultation. It is not sold, rented, or shared for marketing purposes.',
    ],
  },
  {
    heading: 'Medical information',
    paragraphs: [
      'Please do not submit detailed medical history, test results or sensitive health information through this website. A brief reason for your visit is sufficient. Detailed clinical information is best discussed directly during your consultation.',
    ],
  },
  {
    heading: 'Cookies and analytics',
    paragraphs: [
      'This website does not set advertising or tracking cookies, and does not run third-party analytics.',
    ],
  },
  {
    heading: 'External links',
    paragraphs: [
      'Clinic location links open Google Maps in a new tab. Once you follow such a link you are subject to the privacy practices of that third-party service, which are outside our control.',
    ],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [
      'This policy may be updated as the website develops — for example, if appointment requests are later handled by a booking system. Any material change will be reflected on this page.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <SeoHead
        title="Privacy Policy"
        description="How information submitted through this website is collected, used and protected."
      />

      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description="How information submitted through this website is handled."
        crumbs={[{ label: 'Privacy Policy' }]}
      />

      <Section tone="white">
        <LegalBody
          sections={sections}
          contactHeading="Questions about this policy"
          contactText={`For any question about how your information is handled, call ${contact.phone} or email ${contact.email}.`}
        />
      </Section>
    </>
  );
}
