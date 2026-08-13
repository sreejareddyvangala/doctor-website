import { Section, SectionHeading } from '@/components/Section';
import { ServiceCard } from '@/components/ServiceCard';
import { services } from '@/data/services';

interface ServicesProps {
  headingLevel?: 'h1' | 'h2';
  tone?: 'white' | 'gray';
}

/**
 * Rocket services grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`
 * — 1 column on mobile, 2 on tablet, 3 × 2 on desktop.
 */
export function Services({ headingLevel = 'h2', tone = 'gray' }: ServicesProps) {
  return (
    <Section id="services" tone={tone} ariaLabelledBy="services-heading">
      <SectionHeading
        as={headingLevel}
        id="services-heading"
        eyebrow="What We Offer"
        title="Our Services"
        description="Comprehensive orthopaedic care with expertise in joint replacement, trauma, and minimally invasive procedures."
      />

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => (
          <li key={service.slug} className="h-full">
            <ServiceCard service={service} eager={index < 3} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
