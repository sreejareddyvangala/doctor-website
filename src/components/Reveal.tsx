import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * Plain layout wrapper.
 *
 * The Rocket site uses no scroll-reveal animation — only hover/colour
 * transitions — so this deliberately renders a bare <div>. Kept as a component
 * so section markup stays readable and a reveal could be reintroduced in one
 * place if ever wanted.
 */
export function Reveal({ children, className }: RevealProps) {
  return <div className={className}>{children}</div>;
}
