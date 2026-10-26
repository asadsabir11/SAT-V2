import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listALevelStudentsWithAccess, grantALevelAccess, revokeALevelAccess } from "@/lib/aLevelAccess";
import { findUserByEmailAndProgram } from "@/lib/users";
import { sendALevelAccessGranted } from "@/lib/email";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const students = await listALevelStudentsWithAccess();
  return NextResponse.json({ students });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, email, notes } = await req.json();
  if (!action || !email) {
    return NextResponse.json({ error: "action and email are required" }, { status: 400 });
  }

  if (action === "grant") {
    const student = await findUserByEmailAndProgram(email, "a-level");
    await grantALevelAccess(email, session.email, notes);
    await sendALevelAccessGranted({ email, name: student?.name ?? "there" }).catch(console.error);
    return NextResponse.json({ ok: true });
  }
  if (action === "revoke") {
    await revokeALevelAccess(email);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
