import { contact } from '@/data/site';

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

interface LegalBodyProps {
  sections: LegalSection[];
  contactHeading: string;
  contactText: string;
}

/** Shared prose layout for the Privacy Policy and Terms pages. */
export function LegalBody({ sections, contactHeading, contactText }: LegalBodyProps) {
  return (
    <div className="mx-auto max-w-prose">
      {sections.map((section) => (
        <section key={section.heading} className="mb-9 last:mb-0">
          <h2 className=" text-xl font-bold text-gray-900">{section.heading}</h2>
          <div className="mt-3 space-y-3.5">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-[0.95rem] leading-relaxed text-gray-600">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ))}

      <div className="mt-12 rounded-2xl border border-gray-100 bg-blue-50 p-6 sm:p-7">
        <h2 className=" text-lg font-bold text-gray-900">{contactHeading}</h2>
        <p className="mt-2.5 text-[0.95rem] leading-relaxed text-gray-600">{contactText}</p>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={contact.phoneHref}
            className="inline-flex items-center rounded-full bg-blue-700 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-800"
          >
            {contact.phone}
          </a>
          <a
            href={contact.emailHref}
            className="inline-flex items-center rounded-full border-2 border-blue-700 px-6 py-3 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50"
          >
            {contact.email}
          </a>
        </div>
      </div>
    </div>
  );
}
