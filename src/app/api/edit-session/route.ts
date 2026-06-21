import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { EDIT_COOKIE, validateToken } from "@/lib/edit-auth";

// Exchange a token for an httpOnly edit-session cookie (valid until the token expires).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  if (!token) {
    return NextResponse.json({ error: "Enter a token." }, { status: 400 });
  }

  const session = await validateToken(token);
  if (!session.canEdit || !session.expiresAt) {
    return NextResponse.json(
      { error: "That token is invalid or expired." },
      { status: 401 },
    );
  }

  const maxAge = Math.max(
    0,
    Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000),
  );
  (await cookies()).set(EDIT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return NextResponse.json({ ok: true, expiresAt: session.expiresAt });
}

// Lock editing (sign out of the edit session).
export async function DELETE() {
  (await cookies()).delete(EDIT_COOKIE);
  return NextResponse.json({ ok: true });
}
