import { createBrowserClient } from "@supabase/ssr";

// Database type is validated at runtime via RLS; using untyped client avoids
// complex generic coupling while keeping our own domain types in lib/supabase/types.ts
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!
  );
}
