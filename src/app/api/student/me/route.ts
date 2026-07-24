import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { findByField } from "@/lib/storage";
import { getStudentAccessLevel } from "@/lib/users";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.email;
  const [student, diagnostic, accessLevel] = await Promise.all([
    findByField("leads-student.json", "studentEmail", email),
    findByField("diagnostics.json", "email", email),
    getStudentAccessLevel(email),
  ]);

  return NextResponse.json({ student, diagnostic, name: session.name, access_level: accessLevel });
}
