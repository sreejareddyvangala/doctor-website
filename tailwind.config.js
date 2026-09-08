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
      keyframes: {
        /* Entrance for Area Finder result cards. Disabled by the global reduced-motion rule. */
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out both',
      },
    },
  },
  plugins: [],
};
