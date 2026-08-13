import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Container } from './Container';

interface SectionProps {
  id?: string;
  className?: string;
  containerClassName?: string;
  /** Rocket alternates plain white and gray-50 down the page. */
  tone?: 'white' | 'gray';
  children: ReactNode;
  ariaLabelledBy?: string;
  ariaLabel?: string;
}

const toneStyles: Record<NonNullable<SectionProps['tone']>, string> = {
  white: 'bg-white',
  gray: 'bg-gray-50',
};

/** Matches the Rocket section shell: `py-16 lg:py-24` + max-w-7xl container. */
export function Section({
  id,
  className,
  containerClassName,
  tone = 'white',
  children,
  ariaLabelledBy,
  ariaLabel,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabel}
      className={cn('scroll-mt-24 py-16 lg:py-24', toneStyles[tone], className)}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

interface SectionHeadingProps {
  /** Small uppercase blue kicker above the title. */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  id?: string;
  className?: string;
  as?: 'h1' | 'h2';
}

/**
 * The Rocket section header:
 *   <p class="text-blue-700 text-sm font-semibold uppercase tracking-widest mb-2">
 *   <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
 *   <p class="text-gray-500 max-w-xl mx-auto">
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  className,
  as: Tag = 'h2',
}: SectionHeadingProps) {
  return (
    <div className={cn('mb-12 text-center', className)}>
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-700">
          {eyebrow}
        </p>
      ) : null}

      <Tag id={id} className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
        {title}
      </Tag>

      {description ? <p className="mx-auto max-w-xl text-gray-500">{description}</p> : null}
    </div>
  );
}
