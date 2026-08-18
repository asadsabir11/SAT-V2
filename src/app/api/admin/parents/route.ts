import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/users";
import { linkParentToStudent, listParentLinks, deleteParentLink } from "@/lib/parent-system";
import { createResetToken } from "@/lib/passwordReset";
import { sendParentAccountWelcome } from "@/lib/email";
import { sql } from "@/lib/db";


export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const links = await listParentLinks();
  // Also list all students for the link creation form
  const students = await sql`SELECT id, name, email FROM users WHERE role = 'student' ORDER BY name`;
  return NextResponse.json({ links, students });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { studentId, parentEmail, parentName } = await req.json();
  if (!studentId || !parentEmail || !parentName) {
    return NextResponse.json({ error: "studentId, parentEmail and parentName are required" }, { status: 400 });
  }

  // Find or create parent user. New accounts get a throwaway password —
  // never shared with anyone — and the parent sets their real one via the
  // emailed link below, so no one ever has to relay a password by hand.
  let parent = await findUserByEmail(parentEmail);
  let isNewParent = false;
  if (!parent) {
    const throwawayPassword = crypto.randomBytes(24).toString("hex");
    const newId = await createUser(parentEmail, throwawayPassword, "parent", parentName);
    parent = { id: newId, email: parentEmail, name: parentName, role: "parent" };
    isNewParent = true;
  } else if (parent.role !== "parent") {
    return NextResponse.json({ error: "This email is already registered with a different role" }, { status: 409 });
  }

  await linkParentToStudent(parent.id, studentId);

  if (isNewParent) {
    const studentRows = await sql`SELECT name FROM users WHERE id = ${studentId}`;
    const studentName = (studentRows[0] as { name: string } | undefined)?.name ?? "your child";
    const token = await createResetToken(parentEmail);
    const setupUrl = `https://academy.thedigitaltutor.net/reset-password?token=${token}&role=parent`;
    sendParentAccountWelcome({ email: parentEmail, name: parentName, studentName, setupUrl }).catch(console.error);
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
