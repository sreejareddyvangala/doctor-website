// A single doctor portrait is used site-wide (white coat with stethoscope).
import doctorPhoto from '@/assets/doctor-about.jpg';
import doctorPhotoSmall from '@/assets/doctor-about-sm.jpg';

/**
 * Single source of truth for doctor identity and contact details.
 * The name is "Dr. S. Kranthi Reddy" everywhere — no middle name.
 */
export const doctor = {
  name: 'Dr. S. Kranthi Reddy',
  shortName: 'Dr. Kranthi Reddy',
  designation: 'CONSULTANT TRAUMA, ARTHROPLASTY & ARTHROSCOPY SURGEON',
  designationTitleCase: 'Consultant Trauma, Arthroplasty & Arthroscopy Surgeon',
  experience: '15+ Years of Experience',
  patients: '10,000+ Patients Treated',
  /** The one doctor photograph used across the whole site. */
  photo: doctorPhoto,
  photoWidth: 448,
  photoHeight: 601,
  /** 300w variant so phones do not download the full-size portrait. */
  photoSrcSet: `${doctorPhotoSmall} 300w, ${doctorPhoto} 448w`,
  photoAlt:
    'Portrait of Dr. S. Kranthi Reddy, Consultant Trauma and Arthroplasty Surgeon, in navy surgical scrubs',
} as const;

export const contact = {
  phone: '9666243447',
  phoneDisplay: '96662 43447',
  phoneHref: 'tel:9666243447',
  /**
   * Retained for the Privacy Policy and Terms pages only — those need a written
   * contact route. It is deliberately NOT shown in Contact Us or the Footer.
   */
  email: 'drkranthiorthocare@gmail.com',
  emailHref: 'mailto:drkranthiorthocare@gmail.com',
} as const;

/**
 * Clinic WhatsApp configuration — the single place this number is defined.
 *
 * `number` must be in international format, digits only and no leading "+",
 * because that is what wa.me requires. It is the same clinic line as
 * `contact.phone` with India's 91 country code prefixed.
 *
 * NOTE: this is the plain "click to chat" link only. It is unrelated to the
 * WhatsApp Business Platform (Cloud API), which will need its own credentials
 * in environment variables and its own phone number in a later phase.
 */
export const whatsapp = {
  number: '919666243447',
  display: '9666243447',
  defaultMessage:
    'Hello, I would like to enquire about an appointment with Dr. Kranthi.',
} as const;

/** Builds a wa.me deep link, optionally overriding the pre-filled message. */
export const whatsappHref = (message: string = whatsapp.defaultMessage): string =>
  `https://wa.me/${whatsapp.number}?text=${encodeURIComponent(message)}`;

export const seo = {
  title: 'Dr. S. Kranthi Reddy | Consultant Trauma & Arthroplasty Surgeon',
  description:
    'Dr. S. Kranthi Reddy, Consultant Trauma & Arthroplasty Surgeon with 15+ years of experience and 10,000+ patients treated.',
} as const;

/**
 * Section ids used by both the scrollspy and the smooth-scroll navigation.
 * Order matters — the scrollspy walks this list top to bottom.
 */
export const SECTION_IDS = [
  'home',
  'about',
  'services',
  'locations',
  'testimonials',
  'contact',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export interface NavItem {
  label: string;
  sectionId: SectionId;
  /** Route to fall back to when the section is not on the current page. */
  href: string;
}

export const navItems: NavItem[] = [
  { label: 'Home', sectionId: 'home', href: '/#home' },
  { label: 'About', sectionId: 'about', href: '/#about' },
  { label: 'Services', sectionId: 'services', href: '/#services' },
  { label: 'Locations', sectionId: 'locations', href: '/#locations' },
  { label: 'Testimonials', sectionId: 'testimonials', href: '/#testimonials' },
  { label: 'Contact', sectionId: 'contact', href: '/#contact' },
];

export const footerQuickLinks = [
  { label: 'Home', href: '/#home' },
  { label: 'About', href: '/#about' },
  { label: 'Services', href: '/#services' },
  { label: 'Locations', href: '/#locations' },
  { label: 'Testimonials', href: '/#testimonials' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/#contact' },
  { label: 'Book Appointment', href: '/appointment' },
] as const;
