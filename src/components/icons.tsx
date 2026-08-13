import type { SVGProps } from 'react';

/**
 * Outline icons matching the Rocket site's inline SVGs exactly: 24×24 viewBox,
 * `fill="none"`, `stroke="currentColor"`, round caps, stroke-width 2.
 * Kept local so the icon language stays identical to the live site.
 */
type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <g strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
        {children}
      </g>
    </svg>
  );
}

export const IconChevronDown = (props: IconProps) => (
  <Icon {...props}>
    <path d="M19 9l-7 7-7-7" />
  </Icon>
);

export const IconChevronRight = (props: IconProps) => (
  <Icon {...props}>
    <path d="M9 5l7 7-7 7" />
  </Icon>
);

export const IconPhone = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </Icon>
);

export const IconCalendar = (props: IconProps) => (
  <Icon {...props}>
    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </Icon>
);

export const IconMenu = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Icon>
);

export const IconClose = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 18L18 6M6 6l12 12" />
  </Icon>
);

export const IconMail = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </Icon>
);

export const IconLocation = (props: IconProps) => (
  <Icon {...props}>
    <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </Icon>
);

export const IconExternal = (props: IconProps) => (
  <Icon {...props}>
    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </Icon>
);

export const IconCheck = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 13l4 4L19 7" />
  </Icon>
);

export const IconCheckCircle = (props: IconProps) => (
  <Icon {...props}>
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </Icon>
);

export const IconClock = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </Icon>
);

export const IconArrowLeft = (props: IconProps) => (
  <Icon {...props}>
    <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </Icon>
);

/** WhatsApp brand glyph — solid, so it reads clearly at small sizes. */
export const IconWhatsApp = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

/** Solid five-point star, matching the Rocket testimonial rating row. */
export const IconStar = (props: IconProps) => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.161c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.363 1.118l1.286 3.957c.3.921-.755 1.688-1.539 1.118l-3.366-2.446a1 1 0 00-1.176 0l-3.366 2.446c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.062 9.384c-.783-.57-.38-1.81.588-1.81h4.16a1 1 0 00.951-.69l1.286-3.957z" />
  </svg>
);
