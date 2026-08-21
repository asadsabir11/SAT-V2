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
  // The JWT carries program directly now (set at login/registration), which
  // is unambiguous even when this email also has an account in the other
  // program. Older tokens (issued before this field existed, up to 7 days)
  // won't have it, so fall back to the DB lookup for those.
  const [program, accessLevel] = await Promise.all([
    session.program ? Promise.resolve(session.program) : getUserProgram(email),
    getStudentAccessLevel(email),
  ]);

  if (program === "o-level") {
    // The lead record only exists for accounts created through the public
    // registration form. Accounts an admin creates directly (scholarships,
    // manually-approved applications) have no lead row, so fall back to a
    // minimal profile built from the account itself — otherwise the
    // dashboard treats a real, fully-provisioned student as having "no
    // profile yet" and shows the bare Get Started screen instead of their
    // subjects/lectures/quizzes.
    const lead = await findByField("leads-o-level.json", "studentEmail", email);
    const student = lead ?? { studentName: session.name, country: "", subject: "" };
    return NextResponse.json({ program, student, name: session.name, access_level: accessLevel });
  }

  // Same fallback as O-Level above — accounts created directly by an admin
  // (scholarships, etc.) have no leads-student.json row, so without this the
  // dashboard would show the "no profile yet" screen for a fully valid,
  // provisioned student.
  const [lead, diagnostic] = await Promise.all([
    findByField("leads-student.json", "studentEmail", email),
    findByField("diagnostics.json", "email", email),
  ]);
  const student = lead ?? { studentName: session.name, country: "", packageType: "" };

  return NextResponse.json({ program, student, diagnostic, name: session.name, access_level: accessLevel });
}
