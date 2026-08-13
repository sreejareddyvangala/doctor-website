import { Link } from 'react-router-dom';
import { TbMessageQuestion } from 'react-icons/tb';

import { Section, SectionHeading } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import { Accordion } from '@/components/Accordion';
import { faqs } from '@/data/content';
import { contact } from '@/data/site';

interface FaqSectionProps {
  headingLevel?: 'h1' | 'h2';
  tone?: 'white' | 'gray';
}

export function FaqSection({ headingLevel = 'h2', tone = 'gray' }: FaqSectionProps) {
  return (
    <Section id="faq" tone={tone} ariaLabelledBy="faq-heading">
      <SectionHeading
        as={headingLevel}
        id="faq-heading"
        eyebrow="FAQ"
        title={
          <>
            Frequently asked <span className="text-blue-700">questions</span>
          </>
        }
        description="General information about orthopedic consultations and treatment. These answers are not a substitute for individual medical advice."
      />

      <div className="mx-auto mt-12 max-w-3xl">
        <Reveal>
          <Accordion items={faqs} />
        </Reveal>

        <Reveal>
          <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-7 text-center shadow-sm sm:p-9">
            <span
              aria-hidden="true"
              className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-700"
            >
              <TbMessageQuestion className="h-6 w-6" />
            </span>

            <h3 className="mt-5  text-xl font-bold text-gray-900">
              Still have a question?
            </h3>
            <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-gray-600">
              For anything specific to your condition, the best next step is a consultation. Call the
              clinic or request an appointment online.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/appointment"
                className="inline-flex items-center justify-center rounded-full bg-blue-700 px-7 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors duration-200 hover:bg-blue-800"
              >
                Book Appointment
              </Link>
              <a
                href={contact.phoneHref}
                className="inline-flex items-center justify-center rounded-full border-2 border-green-500 px-7 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-green-700 transition-colors duration-200 hover:bg-green-500 hover:text-white"
              >
                Call {contact.phone}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
