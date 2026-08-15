import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-fallback-secret-change-in-production"
);

export const AUTH_COOKIE = "sat_auth";

export type SessionUser = {
  id: string;
  email: string;
  role: "student" | "founder" | "parent" | "teacher";
  name: string;
};

export async function createToken(user: SessionUser): Promise<string> {
  // Founder and teacher sessions carry admin-dashboard power — keep them
  // short. Matches the 24h cookie maxAge set at login so the JWT can't
  // outlive the cookie.
  const isStaff = user.role === "founder" || user.role === "teacher";
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(isStaff ? "24h" : "7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}
