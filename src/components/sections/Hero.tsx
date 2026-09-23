import { Link } from 'react-router-dom';

import { Container } from '@/components/Container';
import { contact, doctor } from '@/data/site';
import { IconCalendar, IconPhone } from '@/components/icons';

/**
 * Rocket hero: green→teal→blue gradient wash, copy left / portrait right,
 * navy H1, green designation, two stat figures split by a hairline rule.
 */
export function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className="scroll-mt-24 bg-gradient-to-br from-green-50 via-teal-50 to-blue-50"
    >
      <Container className="py-16 lg:py-24">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
          {/* Copy */}
          <div className="flex-1 text-center lg:text-left">
            <h1
              id="hero-heading"
              className="mb-3 text-4xl font-bold leading-tight text-navy sm:text-5xl lg:text-6xl"
            >
              {doctor.name}
            </h1>

            <p className="mb-8 text-sm font-semibold uppercase tracking-widest text-green-600">
              {doctor.designationTitleCase}
            </p>

            <div className="mb-8 flex flex-wrap justify-center gap-6 lg:justify-start">
              <div className="text-center">
                <p className="text-3xl font-bold text-navy">15+</p>
                <p className="text-sm text-gray-500">Years of Experience</p>
              </div>

              <div className="hidden w-px bg-gray-300 sm:block" />

              <div className="text-center">
                <p className="text-3xl font-bold text-navy">10,000+</p>
                <p className="text-sm text-gray-500">Patients Treated</p>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                to="/appointment"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-8 py-3 font-bold text-white shadow-lg transition-colors duration-150 hover:bg-navy-dark"
              >
                <IconCalendar className="h-5 w-5" />
                Book Appointment
              </Link>

              <a
                href={contact.phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-8 py-3 font-bold text-white shadow-lg transition-colors duration-150 hover:bg-green-600"
              >
                <IconPhone className="h-5 w-5" />
                Call Now
              </a>
            </div>
          </div>

          {/* Portrait — the site's single doctor photograph. */}
          <div className="flex-shrink-0">
            <div className="relative h-80 w-64 overflow-hidden rounded-2xl border-4 border-white shadow-2xl sm:h-96 sm:w-72 lg:h-[420px] lg:w-80">
              <img
                src={doctor.photo}
                srcSet={doctor.photoSrcSet}
                sizes="(max-width: 640px) 256px, (max-width: 1024px) 288px, 320px"
                alt={doctor.photoAlt}
                width={doctor.photoWidth}
                height={doctor.photoHeight}
                loading="eager"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
