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
  designation: 'CONSULTANT TRAUMA & ARTHROPLASTY SURGEON',
  designationTitleCase: 'Consultant Trauma & Arthroplasty Surgeon',
  experience: '15+ Years of Experience',
  patients: '10,000+ Patients Treated',
  /** The one doctor photograph used across the whole site. */
  photo: doctorPhoto,
  photoWidth: 1000,
  photoHeight: 1333,
  /** 600w variant so phones don't download the full-size portrait. */
  photoSrcSet: `${doctorPhotoSmall} 600w, ${doctorPhoto} 1000w`,
  photoAlt:
    'Portrait of Dr. S. Kranthi Reddy, Consultant Trauma and Arthroplasty Surgeon, in a white coat with a stethoscope',
} as const;

export const contact = {
  phone: '9666243447',
  phoneDisplay: '96662 43447',
  phoneHref: 'tel:9666243447',
  email: 'drkranthiorthocare@gmail.com',
  emailHref: 'mailto:drkranthiorthocare@gmail.com',
} as const;

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
