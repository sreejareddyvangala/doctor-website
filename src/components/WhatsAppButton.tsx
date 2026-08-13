import { whatsapp, whatsappHref } from '@/data/site';
import { cn } from '@/utils/cn';
import { IconWhatsApp } from '@/components/icons';

type Size = 'sm' | 'md';

interface WhatsAppButtonProps {
  /** Visible button text. */
  label?: string;
  /** Overrides the default pre-filled enquiry message. */
  message?: string;
  size?: Size;
  /** Stretch to the width of the parent — used inside cards. */
  fullWidth?: boolean;
  className?: string;
}

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
  className,
}: WhatsAppButtonProps) {
  // Guard against an unconfigured number rather than rendering a dead link.
  if (!whatsapp.number) return null;

  return (
    <a
      href={whatsappHref(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 font-semibold text-white transition-colors duration-150 hover:bg-green-600',
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
