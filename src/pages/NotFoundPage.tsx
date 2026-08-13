import { Link } from 'react-router-dom';
import { TbArrowLeft, TbCalendarEvent } from 'react-icons/tb';

import { SeoHead } from '@/components/SeoHead';
import { Container } from '@/components/Container';
import { serviceLinks } from '@/data/services';

export default function NotFoundPage() {
  return (
    <>
      <SeoHead title="Page not found" description="The page you are looking for does not exist." />

      <section className="bg-gradient-to-b from-blue-50 to-white py-20 sm:py-28">
        <Container>
          <div className="mx-auto max-w-xl text-center">
            <p className=" text-6xl font-extrabold text-blue-700 sm:text-7xl">
              404
            </p>

            <h1 className="mt-5  text-2xl font-bold sm:text-3xl">Page not found</h1>

            <p className="mt-4 text-base leading-relaxed text-gray-600">
              The page you are looking for does not exist or may have moved.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-700 px-7 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-blue-800"
              >
                <TbArrowLeft aria-hidden="true" className="h-4 w-4" />
                Back to Home
              </Link>

              <Link
                to="/appointment"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-green-500 px-7 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-green-700 transition-colors hover:bg-green-500 hover:text-white"
              >
                <TbCalendarEvent aria-hidden="true" className="h-4 w-4" />
                Book Appointment
              </Link>
            </div>

            <div className="mt-12 border-t border-gray-100 pt-8">
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-gray-500">
                Browse services
              </h2>

              <ul className="mt-5 flex flex-wrap justify-center gap-2.5">
                {serviceLinks.map((service) => (
                  <li key={service.slug}>
                    <Link
                      to={service.href}
                      className="inline-flex rounded-full border border-gray-100 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-700"
                    >
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
