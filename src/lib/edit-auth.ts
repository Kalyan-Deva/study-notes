import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { createSupabaseAdmin } from "./supabase/admin";
import { serviceRoleConfigured } from "./supabase/config";

// Cookie holding the raw edit token. httpOnly so client JS can't read it; the
// server re-validates it against edit_tokens on every write.
export const EDIT_COOKIE = "lex_edit";

export const TOKEN_TTL_HOURS = 24;

export function hashToken(token: string): string {
  return createHash("sha256").update(token.trim()).digest("hex");
}

// A fresh high-entropy token (url-safe). Only the hash is stored; the raw value
// is emailed to the requester.
export function generateToken(): string {
  return randomBytes(24).toString("base64url");
}

export type EditSession = {
  canEdit: boolean;
  email: string | null;
  expiresAt: string | null;
};

const NONE: EditSession = { canEdit: false, email: null, expiresAt: null };

/** Look up a raw token: returns the session if it's approved and unexpired. */
export async function validateToken(rawToken: string): Promise<EditSession> {
  if (!serviceRoleConfigured || !rawToken) return NONE;
  const admin = createSupabaseAdmin();
  const { data } = await admin
    .from("edit_tokens")
    .select("email,expires_at,status")
    .eq("token_hash", hashToken(rawToken))
    .eq("status", "approved")
    .maybeSingle();
  if (!data || !data.expires_at) return NONE;
  if (new Date(data.expires_at).getTime() <= Date.now()) return NONE;
  return { canEdit: true, email: data.email, expiresAt: data.expires_at };
}

/** Current edit session from the request cookie (server components & routes). */
export async function getEditSession(): Promise<EditSession> {
  if (!serviceRoleConfigured) return NONE;
  const raw = (await cookies()).get(EDIT_COOKIE)?.value;
  if (!raw) return NONE;
  return validateToken(raw);
}
