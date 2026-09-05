import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listPunjab9thStudentsWithAccess, grantPunjab9thAccess, revokePunjab9thAccess } from "@/lib/punjab9thAccess";
import { findUserByEmailAndProgram } from "@/lib/users";
import { sendPunjab9thAccessGranted } from "@/lib/email";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const students = await listPunjab9thStudentsWithAccess();
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
    const student = await findUserByEmailAndProgram(email, "punjab-9th");
    await grantPunjab9thAccess(email, session.email, notes);
    await sendPunjab9thAccessGranted({ email, name: student?.name ?? "there" }).catch(console.error);
    return NextResponse.json({ ok: true });
  }
  if (action === "revoke") {
    await revokePunjab9thAccess(email);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
