import { SeoHead } from '@/components/SeoHead';
import { PageHero } from '@/components/PageHero';
import { About } from '@/components/sections/About';
import { Qualifications } from '@/components/sections/Qualifications';
import { SurgicalExpertise } from '@/components/sections/SurgicalExpertise';
import { WhyChoose } from '@/components/sections/WhyChoose';
import { doctor } from '@/data/site';

export default function AboutPage() {
  return (
    <>
      <SeoHead
        title="About the Doctor"
        description={`About ${doctor.name}, ${doctor.designationTitleCase} — ${doctor.experience.toLowerCase()} and ${doctor.patients.toLowerCase()}.`}
      />

      <PageHero
        eyebrow="About"
        title={doctor.name}
        description={`${doctor.designationTitleCase} · ${doctor.experience} · ${doctor.patients}`}
        crumbs={[{ label: 'About' }]}
      />

      <About tone="white" />
      <Qualifications />
      <SurgicalExpertise />
      <WhyChoose />
    </>
  );
}
