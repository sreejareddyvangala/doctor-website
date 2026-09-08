import type { MockCity } from '../types.ts';

/** Illustrative sample data for Pune. See `hyderabad.ts` for the caveats. */
export const pune: MockCity = {
  name: 'Pune',
  aliases: ['poona', 'pune city', 'pimpri chinchwad'],
  areas: [
    {
      id: 'hinjewadi',
      name: 'Hinjewadi',
      zone: 'West Pune',
      traits: ['IT parks', 'Young workforce', 'Rapid growth'],
      population: 72, footfall: 80, affluence: 68, youngProfessionals: 96, families: 50, students: 40, growth: 92,
      competition: { fitness: 45, food: 62, education: 40, healthcare: 45, retail: 50, beauty: 42, services: 55 },
    },
    {
      id: 'baner',
      name: 'Baner',
      zone: 'West Pune',
      traits: ['Affluent young', 'Cafes and pubs', 'Dense'],
      population: 78, footfall: 82, affluence: 85, youngProfessionals: 90, families: 60, students: 40, growth: 70,
      competition: { fitness: 72, food: 90, education: 50, healthcare: 60, retail: 68, beauty: 75, services: 70 },
    },
    {
      id: 'kothrud',
      name: 'Kothrud',
      zone: 'West-Central Pune',
      traits: ['Established families', 'Education hub', 'Dense residential'],
      population: 88, footfall: 78, affluence: 72, youngProfessionals: 55, families: 85, students: 80, growth: 30,
      competition: { fitness: 58, food: 70, education: 85, healthcare: 75, retail: 75, beauty: 62, services: 55 },
    },
    {
      id: 'wakad',
      name: 'Wakad',
      zone: 'West Pune',
      traits: ['Young families', 'New towers', 'Commuters'],
      population: 82, footfall: 65, affluence: 68, youngProfessionals: 85, families: 78, students: 40, growth: 85,
      competition: { fitness: 48, food: 60, education: 55, healthcare: 52, retail: 58, beauty: 48, services: 45 },
    },
    {
      id: 'viman-nagar',
      name: 'Viman Nagar',
      zone: 'East Pune',
      traits: ['Affluent', 'Airport adjacent', 'Cafe strip'],
      population: 62, footfall: 78, affluence: 88, youngProfessionals: 88, families: 50, students: 55, growth: 45,
      competition: { fitness: 68, food: 88, education: 48, healthcare: 58, retail: 72, beauty: 72, services: 65 },
    },
    {
      id: 'kharadi',
      name: 'Kharadi',
      zone: 'East Pune',
      traits: ['IT hub', 'High-rise rentals', 'Growing'],
      population: 70, footfall: 75, affluence: 75, youngProfessionals: 94, families: 52, students: 35, growth: 90,
      competition: { fitness: 50, food: 65, education: 42, healthcare: 48, retail: 52, beauty: 50, services: 58 },
    },
    {
      id: 'hadapsar',
      name: 'Hadapsar',
      zone: 'South-East Pune',
      traits: ['Township living', 'IT and families', 'Dense'],
      population: 90, footfall: 78, affluence: 62, youngProfessionals: 80, families: 78, students: 50, growth: 62,
      competition: { fitness: 52, food: 68, education: 62, healthcare: 62, retail: 70, beauty: 55, services: 55 },
    },
    {
      id: 'aundh',
      name: 'Aundh',
      zone: 'North-West Pune',
      traits: ['Established affluent', 'Families', 'Leafy streets'],
      population: 70, footfall: 70, affluence: 84, youngProfessionals: 68, families: 80, students: 45, growth: 35,
      competition: { fitness: 62, food: 78, education: 62, healthcare: 70, retail: 72, beauty: 70, services: 60 },
    },
  ],
};
