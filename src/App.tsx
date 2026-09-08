import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { APP as AREA_FINDER } from '@/features/area-finder/config';
import { RootLayout } from '@/layouts/RootLayout';
import HomePage from '@/pages/HomePage';

/* Home ships in the main bundle; every other route is split out. */
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ServicesPage = lazy(() => import('@/pages/ServicesPage'));
const ServiceDetailPage = lazy(() => import('@/pages/ServiceDetailPage'));
const AppointmentPage = lazy(() => import('@/pages/AppointmentPage'));
const GalleryPage = lazy(() => import('@/pages/GalleryPage'));
const TestimonialsPage = lazy(() => import('@/pages/TestimonialsPage'));
const FaqPage = lazy(() => import('@/pages/FaqPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

/* The Area Finder is a standalone tool with its own shell, outside the clinic layout. */
const AreaFinderPage = lazy(() => import('@/features/area-finder/AreaFinderPage'));

function RouteFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center" role="status" aria-live="polite">
      <span className="sr-only">Loading page…</span>
      <span
        aria-hidden="true"
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-gray-100 border-t-blue-700"
      />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path={AREA_FINDER.route}
        element={
          <Suspense fallback={<RouteFallback />}>
            <AreaFinderPage />
          </Suspense>
        }
      />

      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />

        <Route
          path="/*"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="about" element={<AboutPage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="services/:slug" element={<ServiceDetailPage />} />
                <Route path="appointment" element={<AppointmentPage />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="testimonials" element={<TestimonialsPage />} />
                <Route path="faq" element={<FaqPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="terms-and-conditions" element={<TermsPage />} />
                <Route path="home" element={<Navigate to="/" replace />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
