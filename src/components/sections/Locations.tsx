import { Section, SectionHeading } from '@/components/Section';
import { locations } from '@/data/locations';
import { contact } from '@/data/site';
import { IconExternal } from '@/components/icons';

interface LocationsProps {
  headingLevel?: 'h1' | 'h2';
  tone?: 'white' | 'gray';
}

/**
 * Rocket location card: `bg-blue-50 rounded-2xl p-6 text-center border border-blue-100`.
 * Exactly three clinics — full names, exact timings and fees, and the supplied
 * Google Maps links. No addresses are shown because none were provided.
 */
export function Locations({ headingLevel = 'h2', tone = 'white' }: LocationsProps) {
  return (
    <Section id="locations" tone={tone} ariaLabelledBy="locations-heading">
      <SectionHeading
        as={headingLevel}
        id="locations-heading"
        eyebrow="Where to Find Us"
        title="Our Locations"
        description="Visit Dr. S. Kranthi Reddy at any of our clinic locations for expert orthopaedic care."
      />

      <ul className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
        {locations.map((clinic) => (
          <li key={clinic.id} className="h-full">
            <article className="flex h-full flex-col rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center transition-shadow duration-200 hover:shadow-md">
              <div aria-hidden="true" className="mb-3 text-4xl">
                🏥
              </div>

              {/* Reserved name area so TIMINGS starts at the same height on
                  every card. Columns are narrowest between sm and lg, where the
                  longest clinic name needs more lines, so the reserve grows there. */}
              <h3 className="mb-4 flex min-h-[3.25rem] items-center justify-center text-lg font-bold leading-snug text-gray-900 sm:min-h-[6.5rem] lg:min-h-[3.25rem]">
                {clinic.name}
              </h3>

              {/* flex-1 absorbs the difference between one and two timing lines,
                  so the divider, fee and both buttons align across all cards. */}
              <div className="mb-4 flex-1 text-left">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Timings
                </p>
                {clinic.timings.map((timing) => (
                  <p key={timing} className="text-sm leading-relaxed text-gray-700">
                    {timing}
                  </p>
                ))}
              </div>

              <div className="border-t border-blue-200 pt-4 text-left">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Consultation Fee
                </p>
                <p className="text-base font-bold text-gray-900">{clinic.fee}</p>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <a
                  href={contact.phoneHref}
                  className="inline-block rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-green-600"
                >
                  Call Now
                </a>

                <a
                  href={clinic.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition-colors duration-150 hover:bg-blue-100"
                >
                  <IconExternal className="h-4 w-4" />
                  View on Google Maps
                  <span className="sr-only"> — {clinic.name} (opens in a new tab)</span>
                </a>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}
