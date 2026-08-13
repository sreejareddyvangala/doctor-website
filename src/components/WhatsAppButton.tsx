import { whatsapp, whatsappHref } from '@/data/site';
import { cn } from '@/utils/cn';
import { IconWhatsApp } from '@/components/icons';

type Size = 'sm' | 'md';

interface WhatsAppButtonProps {
  /** Visible button text. Doubles as the accessible name when `iconOnly`. */
  label?: string;
  /** Overrides the default pre-filled enquiry message. */
  message?: string;
  size?: Size;
  /** Stretch to the width of the parent — used inside cards. */
  fullWidth?: boolean;
  /**
   * Render just the WhatsApp glyph, with `label` moved to aria-label + title.
   * Used in the footer so the button stays compact next to "Call Us".
   */
  iconOnly?: boolean;
  className?: string;
}

/** Shared green treatment, identical in both modes. */
const BUTTON_BASE =
  'inline-flex items-center justify-center rounded-lg bg-green-500 font-semibold text-white transition-colors duration-150 hover:bg-green-600';

/**
 * Plain "click to chat" WhatsApp link (wa.me).
 *
 * Deliberately NOT the WhatsApp Business Platform — there is no API call, no
 * credential and no token here. wa.me opens the native app on mobile and
 * WhatsApp Web on desktop, so a single link covers both.
 *
 * Styling reuses the site's existing green-500 button treatment so it sits
 * alongside "Call Now" without introducing anything new.
 */
export function WhatsAppButton({
  label = 'Chat on WhatsApp',
  message,
  size = 'md',
  fullWidth = false,
  iconOnly = false,
  className,
}: WhatsAppButtonProps) {
  // Guard against an unconfigured number rather than rendering a dead link.
  if (!whatsapp.number) return null;

  const href = whatsappHref(message);

  if (iconOnly) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        title={label}
        // px-3 with a 20px glyph matches the height of the adjacent text
        // button without making a label-less button unnecessarily wide.
        className={cn(BUTTON_BASE, 'px-3 py-2 text-sm', className)}
      >
        <IconWhatsApp className="h-5 w-5 shrink-0" />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        BUTTON_BASE,
        'gap-2',
        size === 'sm' ? 'px-4 py-2 text-sm' : 'px-5 py-2 text-sm',
        fullWidth && 'w-full',
        className,
      )}
    >
      <IconWhatsApp className="h-4 w-4 shrink-0" />
      {label}
      <span className="sr-only"> (opens WhatsApp in a new tab)</span>
    </a>
  );
}

/**
 * Sticky click-to-chat button, rendered once in RootLayout so it stays
 * visible on every page while scrolling.
 *
 * Reads the same number and message from site.ts as WhatsAppButton — the
 * number is never repeated here.
 *
 * Placement notes:
 *  - bottom-right, clear of the header's mobile menu (which opens downward
 *    from the top) and of the footer's own actions.
 *  - z-40 sits under the header (z-50) and the appointment modal (z-80), so
 *    it can never float above a dialog.
 *  - `env(safe-area-inset-bottom)` keeps it above the iOS home indicator.
 *  - Icon-only on phones to stay out of the way; the label appears from sm up.
 */
export function FloatingWhatsApp({ message }: { message?: string }) {
  if (!whatsapp.number) return null;

  return (
    <a
      href={whatsappHref(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
      style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))' }}
      className="fixed right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-colors duration-150 hover:bg-green-600"
    >
      <IconWhatsApp className="h-7 w-7 shrink-0" />
    </a>
  );
}
