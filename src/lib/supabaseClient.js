import { createClient } from "@supabase/supabase-js";

let cached;

export function getSupabaseBrowserClient() {
  if (cached) return cached;

  const url = import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_URL and SUPABASE_ANON_KEY).",
    );
  }

  cached = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return cached;
}
