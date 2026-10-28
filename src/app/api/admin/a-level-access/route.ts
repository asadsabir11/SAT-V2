import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listALevelAccessRequests, grantALevelAccess, revokeALevelAccess } from "@/lib/aLevelAccess";
import { ALEVEL_LECTURE_CATEGORIES } from "@/lib/lectures";
import { findUserByEmailAndProgram } from "@/lib/users";
import { sendALevelAccessGranted } from "@/lib/email";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const requests = await listALevelAccessRequests();
  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, email, subject, notes } = await req.json();
  if (!action || !email || !subject || !ALEVEL_LECTURE_CATEGORIES.includes(subject)) {
    return NextResponse.json({ error: "action, email and a valid subject are required" }, { status: 400 });
  }

  if (action === "grant") {
    const student = await findUserByEmailAndProgram(email, "a-level");
    await grantALevelAccess(email, subject, session.email, notes);
    await sendALevelAccessGranted({ email, name: student?.name ?? "there" }).catch(console.error);
    return NextResponse.json({ ok: true });
  }
  if (action === "revoke") {
    await revokeALevelAccess(email, subject);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
