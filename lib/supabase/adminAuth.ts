import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export async function requirePractitioner(
  supabase: SupabaseClient,
  router: AppRouterInstance
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    router.replace("/admin/login");
    return null;
  }
  if (user.app_metadata?.role !== "practitioner") {
    await supabase.auth.signOut();
    router.replace("/admin/login?error=access");
    return null;
  }
  return user;
}
