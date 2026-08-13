import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Container } from '@/components/Container';
import { contact, doctor, navItems } from '@/data/site';
import { serviceLinks } from '@/data/services';
import { scrollToSection } from '@/utils/scroll';
import { IconMail, IconPhone } from '@/components/icons';

/** Rocket footer: bg-gray-900, 4-column grid, blue-400 designation, gray-400 body. */
export function Footer() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const year = new Date().getFullYear();

  const goToSection = (sectionId: string) => {
    if (pathname === '/' && scrollToSection(sectionId)) {
      window.history.replaceState(null, '', `/#${sectionId}`);
      return;
    }
    navigate('/', { state: { scrollTo: sectionId } });
  };

  return (
    <footer className="bg-gray-900 py-12 text-white">
      <Container>
        <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Identity + contact */}
          <div className="lg:col-span-2">
            <h3 className="mb-1 text-xl font-bold text-white">{doctor.name}</h3>
            <p className="mb-3 text-sm font-medium text-blue-400">{doctor.designation}</p>
            <p className="mb-4 text-sm leading-relaxed text-gray-400">
              Providing expert orthopaedic care with 15+ years of experience and over 10,000
              patients treated.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href={contact.phoneHref}
                className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-green-600"
              >
                <IconPhone className="h-4 w-4" />
                {contact.phone}
              </a>

              <a
                href={contact.emailHref}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-5 py-2 text-sm font-semibold text-gray-300 transition-colors duration-150 hover:border-blue-400 hover:text-white"
              >
                <IconMail className="h-4 w-4" />
                <span className="break-all">{contact.email}</span>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <nav aria-labelledby="footer-links">
            <h4
              id="footer-links"
              className="mb-4 text-sm font-semibold uppercase tracking-wide text-white"
            >
              Quick Links
            </h4>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => goToSection(item.sectionId)}
                    className="text-sm capitalize text-gray-400 transition-colors duration-150 hover:text-white"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li>
                <Link
                  to="/appointment"
                  className="text-sm capitalize text-gray-400 transition-colors duration-150 hover:text-white"
                >
                  Book Appointment
                </Link>
              </li>
            </ul>
          </nav>

          {/* Services */}
          <nav aria-labelledby="footer-services">
            <h4
              id="footer-services"
              className="mb-4 text-sm font-semibold uppercase tracking-wide text-white"
            >
              Services
            </h4>
            <ul className="space-y-2">
              {serviceLinks.map((service) => (
                <li key={service.slug}>
                  <Link
                    to={service.href}
                    className="text-left text-sm text-gray-400 transition-colors duration-150 hover:text-white"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-400">
            © {year} {doctor.name}. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              to="/privacy-policy"
              className="text-sm text-gray-400 transition-colors duration-150 hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-and-conditions"
              className="text-sm text-gray-400 transition-colors duration-150 hover:text-white"
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
