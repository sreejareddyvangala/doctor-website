/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /**
         * The Rocket site's signature deep navy, used for the H1, the primary
         * "Book Appointment" button and the hero stat figures.
         * Everything else uses Tailwind's default blue / green / gray scales,
         * exactly as the Rocket build does.
         */
        navy: {
          DEFAULT: '#1a2e5a',
          dark: '#142348',
        },
      },
    },
  },
  plugins: [],
};
