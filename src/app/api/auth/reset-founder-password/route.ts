import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/users";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.POSTGRES_URL!);

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  const adminSecret = (process.env.ADMIN_SECRET ?? "").trim();
  if (!secret || !adminSecret || secret !== adminSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, password } = await request.json();
  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "email and password (8+ chars) required" }, { status: 400 });
  }

  const user = await findUserByEmail(email);
  if (!user || user.role !== "founder") {
    return NextResponse.json({ error: "Founder account not found" }, { status: 404 });
  }

  const hash = await bcrypt.hash(password, 10);
  await sql`UPDATE users SET password_hash = ${hash} WHERE email = ${email.toLowerCase().trim()}`;
  return NextResponse.json({ ok: true, message: `Password updated for ${email}` });
}
