/**
 * Pre-fetches OpenStreetMap data so users never wait for a city's first
 * download. Each new city costs three upstream requests; cities already in
 * the cache are skipped instantly.
 *
 *   npm run osm:warm                      # the cities in AREA_OSM_SUGGESTED_CITIES
 *   npm run osm:warm -- Hyderabad Pune    # specific cities
 *
 * Reads `.env` / `.env.local` like the standalone server does.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createAreaDataSource } from '../area-analysis/data-sources/index.ts';
import { loadEnvFiles } from '../env-files.ts';
import { readServerEnv } from '../env.ts';
import { consoleLogger } from '../logger.ts';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const env = readServerEnv({ ...(await loadEnvFiles(rootDir, ['.env', '.env.local'])), ...process.env });

if (env.dataSource !== 'osm') {
  console.log(`AREA_DATA_SOURCE is "${env.dataSource}", not "osm"; nothing to warm.`);
  process.exit(0);
}

const cities = process.argv.slice(2).length > 0 ? process.argv.slice(2) : env.osm.suggestedCities;
const source = createAreaDataSource(env, { logger: consoleLogger });

console.log(`Warming the OpenStreetMap cache in ${env.osm.cacheDir} for: ${cities.join(', ')}`);

let failures = 0;
for (const city of cities) {
  const started = Date.now();
  try {
    const result = await source.getCityAreas(city);
    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    console.log(
      result
        ? `${city}: ${result.areas.length} localities ready (${seconds} s)`
        : `${city}: not found in OpenStreetMap`,
    );
  } catch (error) {
    failures += 1;
    console.error(`${city}: failed - ${error instanceof Error ? error.message : String(error)}`);
  }
}

process.exit(failures > 0 ? 1 : 0);
