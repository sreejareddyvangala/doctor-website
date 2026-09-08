import { Link } from 'react-router-dom';

import { APP } from '../config';

export function BrandMark() {
  return (
    <Link
      to={APP.route}
      className="flex items-center gap-3 rounded-lg"
      aria-label={`${APP.name} home`}
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        aria-hidden="true"
        focusable="false"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="af-brand-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1a2e5a" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        <rect width="36" height="36" rx="10" fill="url(#af-brand-gradient)" />
        <circle cx="18" cy="18" r="10" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="2" />
        <circle cx="18" cy="18" r="5" fill="none" stroke="#fff" strokeWidth="2" />
        <circle cx="18" cy="18" r="1.75" fill="#fff" />
        <path
          d="M18 8a10 10 0 0 1 10 10"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      <span className="flex flex-col leading-tight">
        <span className="text-base font-bold tracking-tight text-navy">{APP.name}</span>
        <span className="hidden text-xs text-gray-500 sm:block">{APP.tagline}</span>
      </span>
    </Link>
  );
}
