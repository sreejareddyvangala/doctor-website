import { SeoHead } from '@/components/SeoHead';
import { PageHero } from '@/components/PageHero';
import { Section } from '@/components/Section';
import { LegalBody, type LegalSection } from '@/components/LegalBody';
import { contact } from '@/data/site';

const sections: LegalSection[] = [
  {
    heading: 'Acceptance of terms',
    paragraphs: [
      'By using this website you agree to these terms. If you do not agree with them, please do not use the site.',
    ],
  },
  {
    heading: 'Information is general, not medical advice',
    paragraphs: [
      'All content on this website — including descriptions of conditions, services, treatments and recovery — is provided for general awareness only. It is not medical advice, a diagnosis, or a treatment recommendation for any individual.',
      'Nothing on this website creates a doctor–patient relationship. Always consult a qualified clinician about your own condition before making any decision about treatment.',
    ],
  },
  {
    heading: 'No guaranteed outcomes',
    paragraphs: [
      'Results of orthopedic treatment vary between individuals and depend on many factors, including the nature of the condition, general health and rehabilitation. No specific outcome, recovery timeline or success rate is promised or implied anywhere on this website.',
    ],
  },
  {
    heading: 'Emergencies',
    paragraphs: [
      'This website is not monitored for emergencies, and the appointment form must not be used to report one. If you have a serious injury or urgent medical problem, seek immediate medical attention at the nearest hospital.',
    ],
  },
  {
    heading: 'Appointment requests',
    paragraphs: [
      'Submitting the appointment form sends a request only — it does not confirm a booking. An appointment is confirmed only when the clinic contacts you directly. Consultation timings and fees shown on this website may change without notice; please call to confirm before travelling.',
    ],
  },
  {
    heading: 'Accuracy of content',
    paragraphs: [
      'Reasonable care is taken to keep the information on this website accurate and current, but no warranty is given that it is complete, accurate or up to date at any given time.',
    ],
  },
  {
    heading: 'External links',
    paragraphs: [
      'This website links to Google Maps for clinic directions. We are not responsible for the content, availability or practices of third-party websites.',
    ],
  },
  {
    heading: 'Intellectual property',
    paragraphs: [
      'The content, design and images on this website are the property of their respective owners and may not be reproduced without permission.',
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <SeoHead
        title="Terms & Conditions"
        description="Terms governing the use of this website, including the general nature of its medical information."
      />

      <PageHero
        eyebrow="Legal"
        title="Terms & Conditions"
        description="The terms that govern your use of this website."
        crumbs={[{ label: 'Terms & Conditions' }]}
      />

      <Section tone="white">
        <LegalBody
          sections={sections}
          contactHeading="Questions about these terms"
          contactText={`For any question about these terms, call ${contact.phone} or email ${contact.email}.`}
        />
      </Section>
    </>
  );
}
