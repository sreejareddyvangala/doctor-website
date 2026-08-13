import { Link } from 'react-router-dom';

import { Section, SectionHeading } from '@/components/Section';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { contact, doctor } from '@/data/site';
import { locations } from '@/data/locations';
import { IconCalendar, IconLocation, IconPhone, IconWhatsApp } from '@/components/icons';

interface ContactProps {
  headingLevel?: 'h1' | 'h2';
  tone?: 'white' | 'gray';
}

/** Rocket contact: white cards with a blue-100 circular icon, centred. */
export function Contact({ headingLevel = 'h2', tone = 'gray' }: ContactProps) {
  return (
    <Section id="contact" tone={tone} ariaLabelledBy="contact-heading">
      <SectionHeading
        as={headingLevel}
        id="contact-heading"
        eyebrow="Get in Touch"
        title="Contact Us"
      />

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* Phone */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
          <span
            aria-hidden="true"
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700"
          >
            <IconPhone className="h-6 w-6" />
          </span>
          <h3 className="mb-1 font-bold text-gray-900">Phone</h3>
          <p className="mb-3 text-sm text-gray-500">{doctor.name}</p>
          <a
            href={contact.phoneHref}
            className="inline-block rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-green-600"
          >
            Call Now: {contact.phone}
          </a>
        </div>

        {/* WhatsApp */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
          <span
            aria-hidden="true"
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700"
          >
            <IconWhatsApp className="h-6 w-6" />
          </span>
          <h3 className="mb-1 font-bold text-gray-900">WhatsApp</h3>
          <p className="mb-3 text-sm text-gray-500">Message us directly</p>
          <WhatsAppButton />
        </div>

        {/* Locations */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
          <span
            aria-hidden="true"
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700"
          >
            <IconLocation className="h-6 w-6" />
          </span>
          <h3 className="mb-1 font-bold text-gray-900">Locations</h3>
          <ul className="space-y-2 text-sm text-gray-500">
            {locations.map((clinic) => (
              <li key={clinic.id}>
                <a
                  href={clinic.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 transition-colors duration-150 hover:text-blue-800 hover:underline"
                >
                  {clinic.name}
                  <span className="sr-only"> — view on Google Maps (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Book */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
          <span
            aria-hidden="true"
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700"
          >
            <IconCalendar className="h-6 w-6" />
          </span>
          <h3 className="mb-1 font-bold text-gray-900">Book Appointment</h3>
          <p className="mb-3 text-sm text-gray-500">Schedule your consultation today</p>
          <Link
            to="/appointment"
            className="inline-block rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-800"
          >
            Book Now
          </Link>
        </div>
      </div>
    </Section>
  );
}
