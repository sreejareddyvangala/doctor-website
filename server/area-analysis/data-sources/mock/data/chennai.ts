import type { MockCity } from '../types.ts';

/** Illustrative sample data for Chennai. See `hyderabad.ts` for the caveats. */
export const chennai: MockCity = {
  name: 'Chennai',
  aliases: ['madras', 'chennai city'],
  areas: [
    {
      id: 'anna-nagar',
      name: 'Anna Nagar',
      zone: 'North-West Chennai',
      traits: ['Affluent families', 'Planned layout', 'Schools'],
      population: 80, footfall: 75, affluence: 88, youngProfessionals: 62, families: 88, students: 55, growth: 35,
      competition: { fitness: 65, food: 78, education: 72, healthcare: 80, retail: 80, beauty: 72, services: 62 },
    },
    {
      id: 'adyar',
      name: 'Adyar',
      zone: 'South Chennai',
      traits: ['Affluent', 'Established', 'Campus nearby'],
      population: 65, footfall: 70, affluence: 90, youngProfessionals: 58, families: 70, students: 75, growth: 30,
      competition: { fitness: 60, food: 75, education: 60, healthcare: 70, retail: 68, beauty: 70, services: 58 },
    },
    {
      id: 'velachery',
      name: 'Velachery',
      zone: 'South Chennai',
      traits: ['IT commuters', 'Malls', 'Dense residential'],
      population: 90, footfall: 85, affluence: 68, youngProfessionals: 82, families: 78, students: 55, growth: 55,
      competition: { fitness: 60, food: 75, education: 65, healthcare: 68, retail: 82, beauty: 62, services: 60 },
    },
    {
      id: 'sholinganallur',
      name: 'Sholinganallur (OMR)',
      zone: 'South-East Chennai',
      traits: ['IT corridor', 'High-rise rentals', 'Young workforce'],
      population: 78, footfall: 80, affluence: 75, youngProfessionals: 95, families: 55, students: 45, growth: 88,
      competition: { fitness: 48, food: 60, education: 45, healthcare: 48, retail: 55, beauty: 45, services: 52 },
    },
    {
      id: 't-nagar',
      name: 'T. Nagar',
      zone: 'Central Chennai',
      traits: ['Retail heart of the city', 'Massive footfall', 'Saturated'],
      population: 75, footfall: 99, affluence: 65, youngProfessionals: 55, families: 65, students: 50, growth: 15,
      competition: { fitness: 55, food: 85, education: 55, healthcare: 70, retail: 99, beauty: 75, services: 70 },
    },
    {
      id: 'porur',
      name: 'Porur',
      zone: 'West Chennai',
      traits: ['Growing', 'IT parks', 'Families'],
      population: 80, footfall: 68, affluence: 62, youngProfessionals: 78, families: 78, students: 45, growth: 80,
      competition: { fitness: 40, food: 52, education: 55, healthcare: 55, retail: 58, beauty: 42, services: 45 },
    },
    {
      id: 'tambaram',
      name: 'Tambaram',
      zone: 'South-West Chennai',
      traits: ['Dense', 'Affordable', 'Colleges and rail hub'],
      population: 88, footfall: 80, affluence: 45, youngProfessionals: 55, families: 80, students: 80, growth: 55,
      competition: { fitness: 32, food: 55, education: 68, healthcare: 60, retail: 70, beauty: 40, services: 38 },
    },
    {
      id: 'nungambakkam',
      name: 'Nungambakkam',
      zone: 'Central Chennai',
      traits: ['Corporate offices', 'Colleges', 'Upscale'],
      population: 55, footfall: 88, affluence: 85, youngProfessionals: 75, families: 45, students: 80, growth: 25,
      competition: { fitness: 62, food: 88, education: 60, healthcare: 72, retail: 78, beauty: 78, services: 72 },
    },
  ],
};
