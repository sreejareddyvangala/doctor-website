/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL. Safe to expose — protected by RLS. */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon/publishable key. Safe to expose — protected by RLS. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
