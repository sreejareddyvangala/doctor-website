/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL. Safe to expose — protected by RLS. */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon/publishable key. Safe to expose — protected by RLS. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /**
   * Base URL of the area-analysis API. Defaults to `/api/area-analysis` on
   * the same origin; set only when the API is hosted elsewhere.
   */
  readonly VITE_AREA_ANALYSIS_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
