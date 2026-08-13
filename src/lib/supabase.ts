import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase browser client.
 *
 * Only the anon (publishable) key belongs here. It is safe to ship because
 * Row Level Security decides what it can reach — see
 * `supabase/migrations/20260813000002_rls.sql`.
 *
 * The service-role key must NEVER appear in this file, in any `VITE_`
 * variable, or anywhere else in `src/`. Anything requiring it runs in a
 * Supabase Edge Function.
 */

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * False until `.env.local` is filled in. The site is built to run without a
 * database (Phases 1–2 shipped that way), so nothing here may throw at
 * import time — features check this flag and degrade gracefully instead.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  client = createClient(url as string, anonKey as string, {
    auth: {
      // Needed for the receptionist dashboard in Phase 5.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
} else if (import.meta.env.DEV) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. ' +
      'Database features are disabled — copy .env.example to .env.local to enable them.',
  );
}

export const supabase = client;

/**
 * Use where a client is required. Throws a clear message rather than letting
 * a null slip through into a query.
 */
export function requireSupabase(): SupabaseClient {
  if (!client) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.',
    );
  }
  return client;
}
