import { Section, SectionHeading } from '@/components/Section';
import { testimonials } from '@/data/content';
import { IconStar } from '@/components/icons';

interface TestimonialsProps {
  headingLevel?: 'h1' | 'h2';
  tone?: 'white' | 'gray';
}

/** Rocket testimonials: 4-up grid of white cards with a five-star row. */
export function Testimonials({ headingLevel = 'h2', tone = 'gray' }: TestimonialsProps) {
  return (
    <Section id="testimonials" tone={tone} ariaLabelledBy="testimonials-heading">
      <SectionHeading
        as={headingLevel}
        id="testimonials-heading"
        eyebrow="Patient Stories"
        title="What Our Patients Say"
        description="Hear from patients who have experienced compassionate, expert care from Dr. S. Kranthi Reddy."
      />

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((testimonial) => (
          <li key={testimonial.id} className="h-full">
            <figure className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-3 flex" role="img" aria-label="Rated 5 out of 5">
                {Array.from({ length: 5 }, (_, index) => (
                  <IconStar key={index} className="h-4 w-4 text-yellow-400" />
                ))}
              </div>

              <blockquote className="mb-4 flex-1 text-sm italic leading-relaxed text-gray-600">
                “{testimonial.quote}”
              </blockquote>

              <figcaption className="text-sm font-semibold text-gray-900">
                — {testimonial.attribution}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
