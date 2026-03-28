import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme";
export const JWT_SECRET = new TextEncoder().encode(ADMIN_PASSWORD);
export const COOKIE_NAME = "sp_session";

export async function createSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function verifySession(): Promise<boolean> {
  const cookie = (await cookies()).get(COOKIE_NAME);
  if (!cookie) return false;
  try {
    await jwtVerify(cookie.value, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function destroySession() {
  (await cookies()).delete(COOKIE_NAME);
}
