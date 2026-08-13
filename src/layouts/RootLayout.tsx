import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ScrollRestoration } from '@/components/ScrollRestoration';
import { FloatingWhatsApp } from '@/components/WhatsAppButton';

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <ScrollRestoration />
      <Header />

      {/*
        Offset for the fixed header. Tied to --header-h (72px) so it can never
        drift from the header's real height — a mismatch hides the top of the
        first section behind the bar.
      */}
      <main id="main-content" className="flex-1 pt-[var(--header-h)]">
        <Outlet />
      </main>

      <FloatingWhatsApp />
      <Footer />
    </div>
  );
}
