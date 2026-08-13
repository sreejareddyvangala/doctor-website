import { useId, useState } from 'react';
import { cn } from '@/utils/cn';
import { IconChevronDown } from '@/components/icons';

export interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  /** Index open on first render. Pass null to start fully collapsed. */
  defaultOpen?: number | null;
  className?: string;
}

/**
 * Single-open accordion built on native buttons, so keyboard and screen-reader
 * behaviour comes for free (Enter/Space toggle, aria-expanded state).
 * Styled with the Rocket card language: rounded-2xl, gray-100 border, shadow-sm.
 */
export function Accordion({ items, defaultOpen = 0, className }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen);
  const baseId = useId();

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

        return (
          <div
            key={item.question}
            className={cn(
              'overflow-hidden rounded-2xl border bg-white transition-shadow duration-200',
              isOpen ? 'border-blue-200 shadow-sm' : 'border-gray-100 hover:shadow-sm',
            )}
          >
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
              >
                <span
                  className={cn(
                    'font-semibold transition-colors duration-150',
                    isOpen ? 'text-blue-700' : 'text-gray-900',
                  )}
                >
                  {item.question}
                </span>

                <IconChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 transition-transform duration-200',
                    isOpen ? 'rotate-180 text-blue-700' : 'text-gray-400',
                  )}
                />
              </button>
            </h3>

            {isOpen ? (
              <div id={panelId} role="region" aria-labelledby={buttonId}>
                <p className="px-5 pb-5 text-sm leading-relaxed text-gray-600 sm:px-6">
                  {item.answer}
                </p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
