import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/users";
import { sql } from "@/lib/db";
import { isValidEmail, passwordStrengthError } from "@/lib/validators";

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

  const { name, email, password } = await req.json();
  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  const pwError = passwordStrengthError(password);
  if (pwError) {
    return NextResponse.json({ error: `Password: ${pwError}` }, { status: 400 });
  }

  const existing = await findUserByEmail(email.trim());
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  await createUser(email.trim(), password, "teacher", name.trim());
  const teacher = await findUserByEmail(email.trim());
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
