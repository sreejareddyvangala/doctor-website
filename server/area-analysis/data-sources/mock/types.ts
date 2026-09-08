import type { AreaSignals } from '../types.ts';

export interface MockCity {
  /** Canonical display name. */
  name: string;
  /** Other spellings users type, matched after `normalizeCityName`. */
  aliases: string[];
  areas: AreaSignals[];
}
