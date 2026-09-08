import type { MockCity } from '../types.ts';
import { bengaluru } from './bengaluru.ts';
import { chennai } from './chennai.ts';
import { hyderabad } from './hyderabad.ts';
import { mumbai } from './mumbai.ts';
import { pune } from './pune.ts';

/** Cities in the sample dataset, in the order the UI suggests them. */
export const MOCK_CITIES: readonly MockCity[] = [hyderabad, bengaluru, mumbai, chennai, pune];
