export interface ClinicLocation {
  id: string;
  /** Full clinic name, used everywhere the clinic is named. */
  name: string;
  /** Compact label used where the Rocket card design has little room. */
  shortName: string;
  /** Each timing line renders as its own row on the card. */
  timings: string[];
  fee: string;
  mapsUrl: string;
}

/**
 * EXACTLY three clinic locations. No addresses are listed because none were
 * supplied — directions are handled entirely by the official Google Maps links.
 */
export const locations: ClinicLocation[] = [
  {
    id: 'goutami',
    name: "Dr. Goutami's Children's Clinic & Ortho Care",
    shortName: 'Gouthami',
    timings: ['9:30 AM – 10:30 AM (Prior Booking)', '7:30 PM – 9:30 PM'],
    fee: '₹500',
    mapsUrl: 'https://maps.app.goo.gl/FyazeYKyYKhwHjCo7',
  },
  {
    id: 'regain',
    name: 'Regain Bone and Joint Care Centre',
    shortName: 'Regain',
    timings: ['11:00 AM – 2:00 PM'],
    fee: '₹500',
    mapsUrl: 'https://maps.app.goo.gl/Kez14oSyQC5ixbwu6',
  },
  {
    id: 'archana',
    name: 'Archana Hospital',
    shortName: 'Archana',
    timings: ['5:30 PM – 7:30 PM'],
    fee: '₹600',
    mapsUrl: 'https://maps.app.goo.gl/EbhVKrnGaTcmH9kTA',
  },
];

/** Exact clinic names, used to populate the appointment form's location select. */
export const locationNames = locations.map((location) => location.name);
