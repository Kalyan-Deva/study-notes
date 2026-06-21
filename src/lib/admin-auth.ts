import "server-only";
import { createSupabaseServer } from "./supabase/server";
import { ADMIN_EMAIL } from "./supabase/config";

// The admin is the signed-in Supabase user whose email matches ADMIN_EMAIL.
// Returns the user when they're the admin, otherwise null.
export async function getAdminUser() {
  if (!ADMIN_EMAIL) return null;
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return null;
  }
  return user;
}
