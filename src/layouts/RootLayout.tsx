import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ScrollRestoration } from '@/components/ScrollRestoration';

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <ScrollRestoration />
      <Header />

      {/* Offset for the fixed header. */}
      <main id="main-content" className="flex-1 pt-18 lg:pt-20">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
