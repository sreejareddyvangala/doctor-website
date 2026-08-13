import { Section, SectionHeading } from '@/components/Section';
import { whyChoose } from '@/data/content';
import { doctor } from '@/data/site';

/** Why-choose cards, styled with the Rocket card language. */
export function WhyChoose() {
  return (
    <Section tone="white" ariaLabelledBy="why-heading">
      <SectionHeading
        id="why-heading"
        eyebrow="Why Choose"
        title={`Why patients choose ${doctor.shortName}`}
        description="The principles that shape how care is delivered — from the first consultation through to long-term follow-up."
      />

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {whyChoose.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.title}>
              <article className="h-full rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-lg">
                <span
                  aria-hidden="true"
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700"
                >
                  <Icon className="h-6 w-6" />
                </span>

                <h3 className="mb-2 font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{item.description}</p>
              </article>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
