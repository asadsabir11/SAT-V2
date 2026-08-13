import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { findByField } from "@/lib/storage";
import { getStudentAccessLevel, getUserProgram } from "@/lib/users";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.email;
  const [program, accessLevel] = await Promise.all([
    getUserProgram(email),
    getStudentAccessLevel(email),
  ]);

  if (program === "o-level") {
    const student = await findByField("leads-o-level.json", "studentEmail", email);
    return NextResponse.json({ program, student, name: session.name, access_level: accessLevel });
  }

  const [student, diagnostic] = await Promise.all([
    findByField("leads-student.json", "studentEmail", email),
    findByField("diagnostics.json", "email", email),
  ]);

  return NextResponse.json({ program, student, diagnostic, name: session.name, access_level: accessLevel });
}
