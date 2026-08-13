import { Link } from 'react-router-dom';

import { Container } from '@/components/Container';
import { doctor } from '@/data/site';
import { cn } from '@/utils/cn';

interface AboutProps {
  /** Home renders this as an h2 section; the About page renders it as h1. */
  headingLevel?: 'h1' | 'h2';
  tone?: 'white' | 'gray';
}

/** Rocket about: portrait left, copy right, two blue-50 stat tiles, blue CTA. */
export function About({ headingLevel: Heading = 'h2', tone = 'white' }: AboutProps) {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className={cn('scroll-mt-24 py-16 lg:py-24', tone === 'gray' ? 'bg-gray-50' : 'bg-white')}
    >
      <Container>
        <div className="flex flex-col items-center gap-12 lg:flex-row">
          {/* Portrait — the site's single doctor photograph. */}
          <div className="flex-shrink-0">
            <div className="relative h-80 w-64 overflow-hidden rounded-2xl shadow-xl sm:h-96 sm:w-72">
              <img
                src={doctor.photo}
                srcSet={doctor.photoSrcSet}
                sizes="(max-width: 640px) 256px, 288px"
                alt={doctor.photoAlt}
                width={doctor.photoWidth}
                height={doctor.photoHeight}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            </div>
          </div>

          {/* Copy */}
          <div className="flex-1">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-700">
              About
            </p>

            <Heading id="about-heading" className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              {doctor.name}
            </Heading>

            <p className="mb-4 font-semibold text-blue-700">{doctor.designation}</p>

            <p className="mb-4 leading-relaxed text-gray-600">
              {doctor.name} is a highly experienced Consultant Trauma &amp; Arthroplasty Surgeon
              with over 15 years of dedicated practice. He specialises in joint replacement
              surgeries, complex trauma management, and arthroscopic procedures.
            </p>

            <p className="mb-6 leading-relaxed text-gray-600">
              With a patient-centred approach and a commitment to excellence, Dr. Reddy has treated
              over 10,000 patients, helping them regain mobility and improve their quality of life.
              He is known for his precision, compassion, and dedication to achieving the best
              possible outcomes for his patients.
            </p>

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-blue-50 p-4 text-center">
                <p className="text-3xl font-bold text-blue-700">15+</p>
                <p className="mt-1 text-sm text-gray-600">Years of Experience</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-4 text-center">
                <p className="text-3xl font-bold text-blue-700">10,000+</p>
                <p className="mt-1 text-sm text-gray-600">Patients Treated</p>
              </div>
            </div>

            <Link
              to="/appointment"
              className="inline-block rounded-lg bg-blue-700 px-8 py-3 font-semibold text-white transition-colors duration-150 hover:bg-blue-800"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
