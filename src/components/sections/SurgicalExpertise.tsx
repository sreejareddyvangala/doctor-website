import { Section, SectionHeading } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import { surgicalExpertise } from '@/data/content';

export function SurgicalExpertise() {
  return (
    <Section tone="gray" ariaLabelledBy="expertise-heading">
      <SectionHeading
        id="expertise-heading"
        eyebrow="Surgical Expertise"
        title={
          <>
            Focus areas of <span className="text-blue-700">surgical practice</span>
          </>
        }
        description="Areas of orthopedic surgery that form the core of the practice, spanning planned joint replacement and urgent trauma care."
      />

      <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:gap-6">
        {surgicalExpertise.map((area, index) => (
          <li key={area.title}>
            <Reveal className="h-full">
              <article className="group relative h-full overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300  hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:p-7">
                {/* Left accent rail that fills in on hover */}
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-gradient-to-b from-blue-700 to-green-500 transition-transform duration-300  group-hover:scale-y-100"
                />

                <div className="flex items-baseline gap-3">
                  <span
                    aria-hidden="true"
                    className=" text-2xl font-extrabold text-blue-100 transition-colors duration-300 group-hover:text-gray-400"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-[1.08rem] font-bold leading-snug text-gray-900">{area.title}</h3>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-gray-600">{area.description}</p>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
