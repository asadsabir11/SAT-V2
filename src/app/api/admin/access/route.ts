import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listStudentsWithAccess, grantAccess, revokeAccess } from "@/lib/users";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const students = await listStudentsWithAccess();
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
    await grantAccess(email, session.email, notes);
    return NextResponse.json({ ok: true });
  }
  if (action === "revoke") {
    await revokeAccess(email);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
