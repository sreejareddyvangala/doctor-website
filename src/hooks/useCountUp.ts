import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/utils/scroll';

interface UseCountUpOptions {
  duration?: number;
  /** Only start counting once the element scrolls into view. */
  start?: boolean;
}

/** Ease-out cubic — fast at first, gentle landing on the final number. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function useCountUp(target: number, { duration = 1600, start = true }: UseCountUpOptions = {}) {
  const [value, setValue] = useState(start ? 0 : target);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!start) return;

    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    const began = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / duration);
      setValue(Math.round(easeOut(progress) * target));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, start]);

  return value;
}

/**
 * Fires once when the element first enters the viewport — used to trigger
 * count-ups and reveal animations only when they are actually visible.
 */
export function useInView<T extends HTMLElement>(rootMargin = '-80px') {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || inView) return;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return { ref, inView };
}
