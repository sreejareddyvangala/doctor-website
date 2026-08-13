import { Section, SectionHeading } from '@/components/Section';
import { conditions } from '@/data/content';
import { IconCheck } from '@/components/icons';

/** Conditions treated, styled with the Rocket card language. */
export function Conditions() {
  return (
    <Section tone="white" ariaLabelledBy="conditions-heading">
      <SectionHeading
        id="conditions-heading"
        eyebrow="Conditions We Treat"
        title="Common orthopaedic conditions"
        description="If any of these sound familiar, an orthopaedic assessment can help identify the cause and the options available. This list is for general awareness and is not a diagnosis."
      />

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {conditions.map((condition) => (
          <li key={condition.name}>
            <article className="flex h-full gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-lg">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700"
              >
                <IconCheck className="h-5 w-5" />
              </span>

              <div>
                <h3 className="mb-2 font-bold text-gray-900">{condition.name}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{condition.description}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}
