import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteByField } from "@/lib/storage";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteByField("leads-punjab-9th.json", "id", id);
  return NextResponse.json({ ok: true });
}
