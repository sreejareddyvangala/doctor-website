/**
 * Small JSON cache: in-memory, optionally mirrored to a directory so results
 * survive restarts. A city's OpenStreetMap data changes slowly, so caching for
 * days is both accurate enough and the main way this source respects the
 * public servers' usage limits.
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { Logger } from '../../../logger.ts';

interface CacheEntry<T> {
  savedAt: number;
  expiresAt: number;
  value: T;
}

export interface JsonCache {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttlMs: number): Promise<void>;
  /** Values of every unexpired entry, most recently saved first. */
  values<T>(): Promise<T[]>;
}

export interface JsonCacheOptions {
  /** Directory for on-disk persistence. Omit for an in-memory cache. */
  dir?: string;
  logger?: Pick<Logger, 'warn'>;
  now?: () => number;
}

export function createJsonCache(options: JsonCacheOptions = {}): JsonCache {
  const memory = new Map<string, CacheEntry<unknown>>();
  const now = options.now ?? Date.now;
  const dir = options.dir ? path.resolve(options.dir) : undefined;

  const fileFor = (key: string) => path.join(dir ?? '', `${key.replace(/[^a-z0-9]+/gi, '-')}.json`);

  const isLive = (entry: CacheEntry<unknown> | undefined): entry is CacheEntry<unknown> =>
    entry !== undefined && entry.expiresAt > now();

  async function readFromDisk(key: string): Promise<CacheEntry<unknown> | undefined> {
    if (!dir) return undefined;
    try {
      const entry = JSON.parse(await readFile(fileFor(key), 'utf8')) as CacheEntry<unknown>;
      return isLive(entry) ? entry : undefined;
    } catch {
      return undefined;
    }
  }

  return {
    async get<T>(key: string): Promise<T | undefined> {
      const inMemory = memory.get(key);
      if (isLive(inMemory)) return inMemory.value as T;
      memory.delete(key);

      const onDisk = await readFromDisk(key);
      if (onDisk) memory.set(key, onDisk);
      return onDisk?.value as T | undefined;
    },

    async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
      const entry: CacheEntry<T> = { savedAt: now(), expiresAt: now() + ttlMs, value };
      memory.set(key, entry);
      if (!dir) return;
      try {
        await mkdir(dir, { recursive: true });
        await writeFile(fileFor(key), JSON.stringify(entry), 'utf8');
      } catch (error) {
        // The cache is best-effort; a read-only disk must not break analyses.
        options.logger?.warn(`[osm] could not persist cache entry "${key}": ${String(error)}`);
      }
    },

    async values<T>(): Promise<T[]> {
      const entries = new Map<string, CacheEntry<unknown>>();
      if (dir) {
        let names: string[] = [];
        try {
          names = await readdir(dir);
        } catch {
          names = [];
        }
        for (const name of names) {
          if (!name.endsWith('.json')) continue;
          const key = name.slice(0, -'.json'.length);
          const entry = await readFromDisk(key);
          if (entry) entries.set(key, entry);
        }
      }
      for (const [key, entry] of memory) {
        if (isLive(entry)) entries.set(key.replace(/[^a-z0-9]+/gi, '-'), entry);
      }
      return [...entries.values()]
        .sort((a, b) => b.savedAt - a.savedAt)
        .map((entry) => entry.value as T);
    },
  };
}
