import { Link } from 'react-router-dom';
import type { Service } from '@/data/services';

interface ServiceCardProps {
  service: Service;
  /** Skip lazy-loading for cards likely to be above the fold. */
  eager?: boolean;
}

/**
 * The Rocket service card, class for class:
 *   group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200
 *   overflow-hidden text-left cursor-pointer border border-gray-100 hover:border-blue-200
 *
 * Rocket used a <button>; we use a <Link> so the whole card is a real navigable
 * link (keyboard focus + Enter for free) while looking identical. There is no
 * "Learn More" — just image, title and description, and the entire card is the
 * click target.
 */
export function ServiceCard({ service, eager = false }: ServiceCardProps) {
  return (
    <Link
      to={`/services/${service.slug}`}
      aria-label={`${service.title} — view treatment details`}
      className="group block cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={service.image}
          alt={service.imageAlt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-5">
        <h3 className="mb-2 text-lg font-bold text-gray-900 transition-colors duration-150 group-hover:text-blue-700">
          {service.title}
        </h3>
        <p className="text-sm leading-relaxed text-gray-500">{service.description}</p>
      </div>
    </Link>
  );
}
