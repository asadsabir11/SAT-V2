import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listPunjab10thStudentsWithAccess, grantPunjab10thAccess, revokePunjab10thAccess } from "@/lib/punjab10thAccess";
import { findUserByEmailAndProgram } from "@/lib/users";
import { sendPunjab10thAccessGranted } from "@/lib/email";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const students = await listPunjab10thStudentsWithAccess();
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
    const student = await findUserByEmailAndProgram(email, "punjab-10th");
    await grantPunjab10thAccess(email, session.email, notes);
    await sendPunjab10thAccessGranted({ email, name: student?.name ?? "there" }).catch(console.error);
    return NextResponse.json({ ok: true });
  }
  if (action === "revoke") {
    await revokePunjab10thAccess(email);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
