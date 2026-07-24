import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, verifyPassword } from "@/lib/users";
import { createToken, AUTH_COOKIE } from "@/lib/auth";

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function getRateLimit(ip: string): { blocked: boolean } {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { blocked: false };
  }
  entry.count++;
  return { blocked: entry.count > MAX_ATTEMPTS };
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (getRateLimit(ip).blocked) {
      return NextResponse.json({ error: "Too many login attempts. Try again in 15 minutes." }, { status: 429 });
    }

    const { email, password, role } = await request.json();
    if (!email || !password || !role) {
      return NextResponse.json({ error: "Email, password, and role are required" }, { status: 400 });
    }

    // Both students and founders are stored in the users table
    const user = await findUserByEmail(email);
    if (!user || user.role !== role) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    if (!["student", "founder", "parent"].includes(user.role)) {
      return NextResponse.json({ error: "Invalid account type" }, { status: 401 });
    }
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    const res = NextResponse.json({ ok: true, role: user.role });
    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: user.role === "founder" ? 60 * 60 * 24 : 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
