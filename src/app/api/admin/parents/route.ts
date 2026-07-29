import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/users";
import { linkParentToStudent, listParentLinks, deleteParentLink } from "@/lib/parent-system";
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

  const { studentId, parentEmail, parentName, password } = await req.json();
  if (!studentId || !parentEmail || !parentName || !password) {
    return NextResponse.json({ error: "studentId, parentEmail, parentName and password are required" }, { status: 400 });
  }

  // Find or create parent user
  let parent = await findUserByEmail(parentEmail);
  if (!parent) {
    const newId = await createUser(parentEmail, password, "parent", parentName);
    parent = { id: newId, email: parentEmail, name: parentName, role: "parent" };
  } else if (parent.role !== "parent") {
    return NextResponse.json({ error: "This email is already registered with a different role" }, { status: 409 });
  }

  await linkParentToStudent(parent.id, studentId);
  return NextResponse.json({ ok: true, parentId: parent.id });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await deleteParentLink(id);
  return NextResponse.json({ ok: true });
}
