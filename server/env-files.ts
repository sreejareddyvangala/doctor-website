import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseEnv } from 'node:util';

/**
 * Reads `.env`-style files in order; later files win and missing files are
 * skipped. Callers merge real environment variables over the result so the
 * process environment always has the final say.
 */
export async function loadEnvFiles(
  rootDir: string,
  names: string[],
): Promise<Record<string, string | undefined>> {
  let merged: Record<string, string | undefined> = {};
  for (const name of names) {
    try {
      merged = { ...merged, ...parseEnv(await readFile(path.join(rootDir, name), 'utf8')) };
    } catch {
      // Optional file.
    }
  }
  return merged;
}
