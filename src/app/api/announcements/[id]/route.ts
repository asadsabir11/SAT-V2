import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteAnnouncement } from "@/lib/announcements";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteAnnouncement(id);
  return NextResponse.json({ ok: true });
}
