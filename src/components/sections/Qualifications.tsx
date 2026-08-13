import { TbSchool, TbMapPin } from 'react-icons/tb';

import { Section, SectionHeading } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import { qualifications } from '@/data/content';

export function Qualifications() {
  return (
    <Section tone="white" ariaLabelledBy="qualifications-heading">
      <SectionHeading
        id="qualifications-heading"
        eyebrow="Qualifications"
        title={
          <>
            Training and <span className="text-blue-700">medical education</span>
          </>
        }
        description="Formal qualifications in orthopedics and arthroplasty, listed from the most recent."
      />

      <ol className="relative mt-14 space-y-5 lg:space-y-0">
        {/* Vertical spine — desktop only */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-2 hidden h-[calc(100%-1rem)] w-px -translate-x-1/2 bg-gradient-to-b from-brand-200 via-brand-100 to-care-200 lg:block"
        />

        {qualifications.map((item, index) => {
          const onLeft = index % 2 === 0;

          return (
            <li key={item.degree} className="relative lg:grid lg:grid-cols-2 lg:gap-12">
              {/* Node on the spine */}
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-8 hidden h-3.5 w-3.5 -translate-x-1/2 rounded-full border-[3px] border-white bg-blue-700 shadow-[0_0_0_4px_rgba(15,108,189,0.14)] lg:block"
              />

              <Reveal
                className={
                  onLeft ? 'lg:col-start-1 lg:pb-10 lg:pr-4' : 'lg:col-start-2 lg:pb-10 lg:pl-4'
                }
              >
                <article
                  className={`group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300  hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:p-7 ${
                    onLeft ? 'lg:text-right' : ''
                  }`}
                >
                  <div
                    className={`flex items-center gap-3 ${onLeft ? 'lg:flex-row-reverse' : ''}`}
                  >
                    <span
                      aria-hidden="true"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700 transition-colors duration-300 group-hover:bg-blue-700 group-hover:text-white"
                    >
                      <TbSchool className="h-5 w-5" />
                    </span>

                    <h3 className=" text-lg font-bold leading-snug text-gray-900">
                      {item.degree}
                    </h3>
                  </div>

                  {item.institution ? (
                    <p className="mt-4 text-[0.95rem] font-semibold leading-snug text-gray-600">
                      {item.institution}
                    </p>
                  ) : null}

                  <p
                    className={`mt-2 flex items-center gap-1.5 text-sm text-gray-500 ${
                      onLeft ? 'lg:flex-row-reverse' : ''
                    }`}
                  >
                    <TbMapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-green-500" />
                    {item.location}
                  </p>
                </article>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
