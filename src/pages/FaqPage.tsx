import { SeoHead } from '@/components/SeoHead';
import { PageHero } from '@/components/PageHero';
import { FaqSection } from '@/components/sections/FaqSection';

export default function FaqPage() {
  return (
    <>
      <SeoHead
        title="FAQ"
        description="Answers to common questions about orthopedic consultations, treatment and recovery."
      />

      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="General information about orthopedic consultations, treatment and recovery. Not a substitute for individual medical advice."
        crumbs={[{ label: 'FAQ' }]}
      />

      <FaqSection tone="white" />
    </>
  );
}
