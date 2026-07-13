import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, verifyPassword } from "@/lib/users";
import { createToken, AUTH_COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();
    if (!email || !password || !role) {
      return NextResponse.json({ error: "Email, password, and role are required" }, { status: 400 });
    }

    // Both students and founders are stored in the users table
    const user = await findUserByEmail(email);
    if (!user || user.role !== role) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
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
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
