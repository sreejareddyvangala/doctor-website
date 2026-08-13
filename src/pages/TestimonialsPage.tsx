import { SeoHead } from '@/components/SeoHead';
import { PageHero } from '@/components/PageHero';
import { Testimonials } from '@/components/sections/Testimonials';

export default function TestimonialsPage() {
  return (
    <>
      <SeoHead
        title="Testimonials"
        description="Patient feedback about consultations, treatment and follow-up care."
      />

      <PageHero
        eyebrow="Testimonials"
        title="Patient feedback"
        description="Placeholder entries below are clearly marked and awaiting genuine, consented patient reviews."
        crumbs={[{ label: 'Testimonials' }]}
      />

      <Testimonials tone="white" />
    </>
  );
}
