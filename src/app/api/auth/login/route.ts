import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, verifyPassword } from "@/lib/users";
import { createToken, AUTH_COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();
    if (!email || !password || !role) {
      return NextResponse.json({ error: "Email, password, and role are required" }, { status: 400 });
    }

    // Founder login — credentials stored in env vars
    if (role === "founder") {
      const founderEmail = process.env.FOUNDER_EMAIL;
      const founderPassword = process.env.FOUNDER_PASSWORD;
      if (!founderEmail || !founderPassword) {
        return NextResponse.json({ error: "Founder account not configured" }, { status: 500 });
      }
      if (
        email.toLowerCase().trim() !== founderEmail.toLowerCase() ||
        password !== founderPassword
      ) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }
      const token = await createToken({
        id: "founder",
        email: founderEmail,
        role: "founder",
        name: process.env.FOUNDER_NAME ?? "Ibrahim Malick",
      });
      const res = NextResponse.json({ ok: true, role: "founder" });
      res.cookies.set(AUTH_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return res;
    }

    // Student login
    const user = await findUserByEmail(email);
    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    const token = await createToken({
      id: user.id,
      email: user.email,
      role: "student",
      name: user.name,
    });
    const res = NextResponse.json({ ok: true, role: "student" });
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
