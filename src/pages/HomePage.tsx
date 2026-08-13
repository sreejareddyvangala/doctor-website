import { SeoHead } from '@/components/SeoHead';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Services } from '@/components/sections/Services';
import { Locations } from '@/components/sections/Locations';
import { Testimonials } from '@/components/sections/Testimonials';
import { AppointmentSection } from '@/components/sections/AppointmentSection';
import { Contact } from '@/components/sections/Contact';

/**
 * Section order matches the live Rocket site exactly:
 * Home → About → Services → Locations → Testimonials → Appointment → Contact,
 * alternating white / gray-50 backgrounds.
 *
 * The additional content sections (qualifications, conditions, treatment
 * process, FAQ, gallery) live on their own routes — /about, /services, /faq
 * and /gallery — so the home page stays faithful to Rocket.
 */
export default function HomePage() {
  return (
    <>
      <SeoHead />

      <Hero />
      <About tone="white" />
      <Services tone="gray" />
      <Locations tone="white" />
      <Testimonials tone="gray" />
      <AppointmentSection tone="white" />
      <Contact tone="gray" />
    </>
  );
}
