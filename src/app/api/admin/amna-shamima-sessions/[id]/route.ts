import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateAmnaShamimaSession, deleteAmnaShamimaSession } from "@/lib/amnaShamimaSessions";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  await updateAmnaShamimaSession(id, body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteAmnaShamimaSession(id);
  return NextResponse.json({ ok: true });
}
