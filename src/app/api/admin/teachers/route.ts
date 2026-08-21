import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/users";
import { createResetToken } from "@/lib/passwordReset";
import { sendTeacherAccountWelcome } from "@/lib/email";
import { sql } from "@/lib/db";
import { isValidEmail } from "@/lib/validators";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const teachers = await sql`SELECT id, name, email, created_at FROM users WHERE role = 'teacher' ORDER BY created_at DESC`;
  return NextResponse.json({ teachers });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email } = await req.json();
  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  const existing = await findUserByEmail(email.trim());
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  // Throwaway password — never shared with anyone. The teacher sets their
  // real one via the emailed reset link, matching how parent accounts work.
  const throwawayPassword = crypto.randomBytes(24).toString("hex");
  await createUser(email.trim(), throwawayPassword, "teacher", name.trim());
  const teacher = await findUserByEmail(email.trim());

  const token = await createResetToken(email.trim());
  const setupUrl = `https://academy.thedigitaltutor.net/reset-password?token=${token}&role=teacher`;
  await sendTeacherAccountWelcome({ email: email.trim(), name: name.trim(), setupUrl }).catch(console.error);

  return NextResponse.json({ teacher });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await sql`DELETE FROM users WHERE id = ${id} AND role = 'teacher'`;
  return NextResponse.json({ ok: true });
}
