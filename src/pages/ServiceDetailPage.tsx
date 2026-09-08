import { Link, Navigate, useParams } from 'react-router-dom';

import { SeoHead } from '@/components/SeoHead';
import { PageHero } from '@/components/PageHero';
import { Section, SectionHeading } from '@/components/Section';
import { Container } from '@/components/Container';
import { Accordion } from '@/components/Accordion';
import { getServiceBySlug, services } from '@/data/services';
import { contact, doctor } from '@/data/site';
import { IconCalendar, IconCheck, IconPhone } from '@/components/icons';

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const service = getServiceBySlug(slug);

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  const related = services.filter((item) => item.slug !== service.slug).slice(0, 3);

  return (
    <>
      <SeoHead
        title={service.title}
        description={`${service.description} Provided by ${doctor.name}, ${doctor.designationTitleCase}.`}
      />

      <PageHero
        eyebrow="Service"
        title={service.title}
        description={service.description}
        crumbs={[{ label: 'Services', to: '/services' }, { label: service.title }]}
      />

      {/* ---------------- Introduction ---------------- */}
      <Section tone="white">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Overview</h2>
            <p className="mt-4 leading-relaxed text-gray-600">{service.intro}</p>

            <h3 className="mt-10 text-xl font-bold text-gray-900">What the treatment is</h3>
            <div className="mt-4 space-y-4 leading-relaxed text-gray-600">
              {service.whatItIs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:sticky lg:top-24">
            <img
              src={service.image}
              alt={service.imageAlt}
              loading="eager"
              decoding="async"
              className="aspect-[4/3] w-full object-cover object-center"
            />

            <div className="space-y-3 p-6">
              <p className="text-sm leading-relaxed text-gray-500">
                Treatment is planned individually after consultation, examination and imaging.
              </p>

              <Link
                to="/appointment"
                state={{ reason: service.title }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-6 py-3 font-semibold text-white transition-colors duration-150 hover:bg-navy-dark"
              >
                <IconCalendar className="h-5 w-5" />
                Book Appointment
              </Link>

              <a
                href={contact.phoneHref}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-6 py-3 font-semibold text-white transition-colors duration-150 hover:bg-green-600"
              >
                <IconPhone className="h-5 w-5" />
                Call Now
              </a>
            </div>
          </div>
        </div>
      </Section>

      {/* ---------------- When considered / approach ---------------- */}
      <Section tone="gray">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="h-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-gray-900">When it may be considered</h2>
            <ul className="mt-5 space-y-3">
              {service.whenConsidered.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-relaxed text-gray-600"
                >
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="h-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-gray-900">General treatment approach</h2>
            <ol className="mt-5 space-y-4">
              {service.approach.map((item, index) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white"
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-gray-600">{item}</span>
                </li>
              ))}
            </ol>
          </article>
        </div>
      </Section>

      {/* ---------------- Recovery ---------------- */}
      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Recovery and follow-up</h2>

          <ul className="mt-6 space-y-4">
            {service.recovery.map((item) => (
              <li
                key={item.slice(0, 40)}
                className="rounded-xl border-l-4 border-green-400 bg-gray-50 px-5 py-4 text-sm leading-relaxed text-gray-600"
              >
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-6 rounded-xl bg-blue-50 px-5 py-4 text-sm leading-relaxed text-gray-600">
            Recovery varies between individuals. The information above is general and is not a
            prediction of any particular outcome — your own plan and expected timeline are discussed
            with you directly.
          </p>
        </div>
      </Section>

      {/* ---------------- Service FAQ ---------------- */}
      <Section tone="gray" ariaLabelledBy={`${service.slug}-faq-heading`}>
        <SectionHeading
          id={`${service.slug}-faq-heading`}
          eyebrow="Questions"
          title={`${service.title} questions`}
        />

        <div className="mx-auto max-w-3xl">
          <Accordion items={service.faqs} />
        </div>
      </Section>

      {/* ---------------- Book appointment CTA ---------------- */}
      <section aria-labelledby={`${service.slug}-cta`} className="bg-white py-16 lg:py-20">
        <Container>
          <div className="rounded-2xl bg-navy px-6 py-12 text-center sm:px-12">
            <h2 id={`${service.slug}-cta`} className="text-2xl font-bold text-white sm:text-3xl">
              Considering {service.title.toLowerCase()}?
            </h2>

            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-blue-100">
              Book a consultation with {doctor.name} to have your condition assessed and your
              options explained.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/appointment"
                state={{ reason: service.title }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3 font-bold text-navy transition-colors duration-150 hover:bg-blue-50"
              >
                <IconCalendar className="h-5 w-5" />
                Book Appointment
              </Link>

              <a
                href={contact.phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-8 py-3 font-bold text-white transition-colors duration-150 hover:bg-green-600"
              >
                <IconPhone className="h-5 w-5" />
                Call {contact.phone}
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------- Other services ---------------- */}
      <Section tone="gray" ariaLabelledBy="related-heading">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 id="related-heading" className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Other services
          </h2>

          <Link
            to="/services"
            className="text-sm font-semibold text-blue-700 transition-colors hover:text-blue-800"
          >
            View all services →
          </Link>
        </div>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => (
            <li key={item.slug}>
              <Link
                to={`/services/${item.slug}`}
                className="group flex h-full items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-lg"
              >
                <img
                  src={item.image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />

                <span className="min-w-0">
                  <span className="block font-bold leading-snug text-gray-900 transition-colors group-hover:text-blue-700">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">View treatment details</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
