import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { navItems, SECTION_IDS, contact, doctor, logoSrc, type NavItem } from '@/data/site';
import { serviceLinks } from '@/data/services';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { scrollToSection } from '@/utils/scroll';
import { cn } from '@/utils/cn';
import { IconCalendar, IconChevronDown, IconMenu, IconPhone, IconClose } from '@/components/icons';

/** Grace period so the pointer can travel from trigger to dropdown panel. */
const DROPDOWN_CLOSE_DELAY = 140;

/** Rocket's nav button styling — shared by every top-level item. */
const NAV_BASE = 'px-4 py-2 text-sm font-medium rounded transition-colors duration-150';
const NAV_IDLE = 'text-gray-700 hover:text-blue-700';
const NAV_ACTIVE = 'text-blue-700 border-b-2 border-blue-700';

export function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isHome = pathname === '/';
  const isDesktop = useIsDesktop();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const closeTimer = useRef<number>();
  const servicesGroupRef = useRef<HTMLDivElement>(null);

  const activeSection = useScrollSpy(SECTION_IDS, isHome);

  /* Rocket only transitions the shadow on scroll — the bar stays solid white. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
    setMobileServicesOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setServicesOpen(false);
      setMobileOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (!isDesktop) setServicesOpen(false);
  }, [isDesktop]);

  const openDropdown = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    setServicesOpen(true);
  }, []);

  const scheduleCloseDropdown = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setServicesOpen(false), DROPDOWN_CLOSE_DELAY);
  }, []);

  /**
   * Section links scroll smoothly when the section is on the current page, and
   * otherwise route home first, then scroll once Home has mounted.
   */
  const goToSection = useCallback(
    (sectionId: string) => {
      setMobileOpen(false);
      setServicesOpen(false);
      setMobileServicesOpen(false);

      if (isHome && scrollToSection(sectionId)) {
        window.history.replaceState(null, '', `/#${sectionId}`);
        return;
      }

      navigate('/', { state: { scrollTo: sectionId } });
    },
    [isHome, navigate],
  );

  const handleServicesBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!servicesGroupRef.current?.contains(event.relatedTarget as Node | null)) {
      setServicesOpen(false);
    }
  };

  const isActive = (item: NavItem) => isHome && activeSection === item.sectionId;

  return (
    <header
      data-site-header
      style={{ height: 72 }}
      className={cn(
        'fixed left-0 right-0 top-0 z-50 bg-white transition-shadow duration-200',
        scrolled && 'shadow-md',
      )}
    >
      <div className="flex h-full w-full items-center justify-between px-4 sm:px-6">
        {/* Branding */}
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 focus:outline-none"
        >
          <img
            src={logoSrc}
            alt=""
            aria-hidden="true"
            width={1536}
            height={1024}
            decoding="async"
            className="h-11 w-11 flex-shrink-0 object-cover sm:h-12 sm:w-12"
          />
          <span className="flex flex-col items-start">
            <span className="text-lg font-bold leading-tight text-blue-700">{doctor.name}</span>
            <span className="text-xs font-medium leading-tight text-gray-500">
              Trauma &amp; Arthroplasty Surgeon
            </span>
          </span>
        </Link>

        {/* ---------------- Desktop navigation ---------------- */}
        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = isActive(item);

            if (item.sectionId === 'services') {
              return (
                <div
                  key={item.label}
                  ref={servicesGroupRef}
                  className="relative"
                  onMouseEnter={openDropdown}
                  onMouseLeave={scheduleCloseDropdown}
                  onBlur={handleServicesBlur}
                >
                  <button
                    type="button"
                    aria-expanded={servicesOpen}
                    aria-haspopup="true"
                    aria-current={active ? 'true' : undefined}
                    onClick={() => goToSection(item.sectionId)}
                    className={cn(
                      NAV_BASE,
                      'flex items-center gap-1',
                      active ? NAV_ACTIVE : NAV_IDLE,
                    )}
                  >
                    {item.label}
                    <IconChevronDown
                      className={cn(
                        'h-3 w-3 transition-transform duration-150',
                        servicesOpen && 'rotate-180',
                      )}
                    />
                  </button>

                  {servicesOpen ? (
                    /* pt-2 keeps a hover bridge between trigger and panel */
                    <div className="absolute left-1/2 top-full w-64 -translate-x-1/2 pt-2">
                      <ul className="overflow-hidden rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
                        {serviceLinks.map((service) => (
                          <li key={service.slug}>
                            <Link
                              to={service.href}
                              onClick={() => setServicesOpen(false)}
                              className="block px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700"
                            >
                              {service.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                aria-current={active ? 'true' : undefined}
                onClick={() => goToSection(item.sectionId)}
                className={cn(NAV_BASE, active ? NAV_ACTIVE : NAV_IDLE)}
              >
                {item.label}
              </button>
            );
          })}

          <a
            href={contact.phoneHref}
            className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-green-600"
          >
            <IconPhone className="h-4 w-4" />
            Call Now
          </a>

          <Link
            to="/appointment"
            className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-navy-dark"
          >
            <IconCalendar className="h-4 w-4" />
            Book Appointment
          </Link>
        </nav>

        {/* ---------------- Mobile toggle ---------------- */}
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? 'Close menu' : 'Toggle menu'}
          className="rounded p-2 text-gray-700 hover:text-blue-700 focus:outline-none md:hidden"
        >
          {mobileOpen ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
        </button>
      </div>

      {/* ---------------- Mobile menu ---------------- */}
      {mobileOpen ? (
        <div
          id="mobile-menu"
          className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-gray-100 bg-white shadow-lg md:hidden"
        >
          <nav aria-label="Mobile navigation" className="container-page py-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item);

                if (item.sectionId === 'services') {
                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        onClick={() => setMobileServicesOpen((open) => !open)}
                        aria-expanded={mobileServicesOpen}
                        aria-controls="mobile-services"
                        className={cn(
                          'flex w-full items-center justify-between rounded px-4 py-3 text-left text-sm font-medium transition-colors duration-150',
                          active ? 'text-blue-700' : 'text-gray-700 hover:text-blue-700',
                        )}
                      >
                        Services
                        <IconChevronDown
                          className={cn(
                            'h-3.5 w-3.5 transition-transform duration-150',
                            mobileServicesOpen && 'rotate-180',
                          )}
                        />
                      </button>

                      {mobileServicesOpen ? (
                        <ul id="mobile-services" className="mb-1 space-y-0.5 pl-4">
                          {serviceLinks.map((service) => (
                            <li key={service.slug}>
                              <Link
                                to={service.href}
                                className="block border-l-2 border-gray-100 py-2.5 pl-4 text-sm text-gray-600 transition-colors duration-150 hover:border-blue-700 hover:text-blue-700"
                              >
                                {service.title}
                              </Link>
                            </li>
                          ))}
                          <li>
                            <button
                              type="button"
                              onClick={() => goToSection('services')}
                              className="block w-full border-l-2 border-gray-100 py-2.5 pl-4 text-left text-sm font-semibold text-blue-700 transition-colors duration-150 hover:border-blue-700"
                            >
                              View all services
                            </button>
                          </li>
                        </ul>
                      ) : null}
                    </li>
                  );
                }

                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      aria-current={active ? 'true' : undefined}
                      onClick={() => goToSection(item.sectionId)}
                      className={cn(
                        'block w-full rounded px-4 py-3 text-left text-sm font-medium transition-colors duration-150',
                        active ? 'text-blue-700' : 'text-gray-700 hover:text-blue-700',
                      )}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
              <a
                href={contact.phoneHref}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-500 px-4 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-green-600"
              >
                <IconPhone className="h-4 w-4" />
                Call Now
              </a>
              <Link
                to="/appointment"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-navy-dark"
              >
                <IconCalendar className="h-4 w-4" />
                Book Appointment
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
