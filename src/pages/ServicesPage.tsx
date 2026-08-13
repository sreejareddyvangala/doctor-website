import { SeoHead } from '@/components/SeoHead';
import { PageHero } from '@/components/PageHero';
import { Services } from '@/components/sections/Services';
import { Conditions } from '@/components/sections/Conditions';
import { TreatmentProcess } from '@/components/sections/TreatmentProcess';
import { doctor } from '@/data/site';

export default function ServicesPage() {
  return (
    <>
      <SeoHead
        title="Services"
        description={`Orthopedic services by ${doctor.name} — knee replacement, hip replacement, arthroscopy, trauma care, pelvic surgery and complex trauma surgery.`}
      />

      <PageHero
        eyebrow="Services"
        title="Orthopedic services"
        description="Six areas of orthopedic treatment, from planned joint replacement through to urgent trauma care. Select any service to open its full details."
        crumbs={[{ label: 'Services' }]}
      />

      <Services tone="white" />
      <Conditions />
      <TreatmentProcess />
    </>
  );
}
