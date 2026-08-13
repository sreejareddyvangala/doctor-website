import { Section, SectionHeading } from '@/components/Section';
import { treatmentProcess } from '@/data/content';

/** Numbered treatment steps, styled with the Rocket card language. */
export function TreatmentProcess() {
  return (
    <Section tone="gray" ariaLabelledBy="process-heading">
      <SectionHeading
        id="process-heading"
        eyebrow="Treatment Process"
        title="What to expect, step by step"
        description="A clear path from the first consultation through to recovery, so you know what happens at each stage."
      />

      <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {treatmentProcess.map((step) => {
          const Icon = step.icon;

          return (
            <li key={step.step}>
              <article className="h-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-lg">
                <div className="mb-4 flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700"
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                    Step {step.step}
                  </span>
                </div>

                <h3 className="mb-2 text-lg font-bold text-gray-900">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{step.description}</p>
              </article>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
