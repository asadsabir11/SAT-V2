import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/auth";
import { createUser, findUserByEmailAndProgram } from "@/lib/users";
import { linkParentToStudent, listParentLinks, deleteParentLink } from "@/lib/parent-system";
import { createResetToken } from "@/lib/passwordReset";
import { sendParentAccountWelcome } from "@/lib/email";
import { sql } from "@/lib/db";


export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Optional — the SAT and O-Level admin parent-account pages are separate
  // modules, each only wanting its own program's students and links.
  const program = new URL(req.url).searchParams.get("program");

  const [allLinks, allStudents] = await Promise.all([
    listParentLinks(),
    sql`SELECT id, name, email, program FROM users WHERE role = 'student' ORDER BY name`,
  ]);

  const links = program ? allLinks.filter((l) => l.student_program === program) : allLinks;
  const students = program ? allStudents.filter((s) => s.program === program) : allStudents;

  return NextResponse.json({ links, students });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { studentId, parentEmail, parentName } = await req.json();
  if (!studentId || !parentEmail || !parentName) {
    return NextResponse.json({ error: "studentId, parentEmail and parentName are required" }, { status: 400 });
  }

  const studentRows = await sql`SELECT name, program FROM users WHERE id = ${studentId} AND role = 'student'`;
  const student = studentRows[0] as { name: string; program: "sat" | "o-level" } | undefined;
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  // Find or create the parent user — scoped to the STUDENT's program, same
  // as students themselves: the same email can hold a separate SAT parent
  // account and O-Level parent account (e.g. one child in each program),
  // each seeing only that program's child via parent_student_links.
  // New accounts get a throwaway password — never shared with anyone — and
  // the parent sets their real one via the emailed link below, so no one
  // ever has to relay a password by hand.
  let parent = await findUserByEmailAndProgram(parentEmail, student.program);
  let isNewParent = false;
  if (!parent) {
    const throwawayPassword = crypto.randomBytes(24).toString("hex");
    const newId = await createUser(parentEmail, throwawayPassword, "parent", parentName, student.program);
    parent = { id: newId, email: parentEmail, name: parentName, role: "parent", program: student.program };
    isNewParent = true;
  } else if (parent.role !== "parent") {
    return NextResponse.json({ error: "This email is already registered with a different role for this program" }, { status: 409 });
  }

  await linkParentToStudent(parent.id, studentId);

  if (isNewParent) {
    const token = await createResetToken(parentEmail);
    const setupUrl = `https://academy.thedigitaltutor.net/reset-password?token=${token}&role=parent`;
    sendParentAccountWelcome({ email: parentEmail, name: parentName, studentName: student.name, setupUrl }).catch(console.error);
  }

  return NextResponse.json({ ok: true, parentId: parent.id, emailed: isNewParent });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await deleteParentLink(id);
  return NextResponse.json({ ok: true });
}
