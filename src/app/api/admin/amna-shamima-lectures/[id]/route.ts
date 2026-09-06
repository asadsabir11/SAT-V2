import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateAmnaShamimaLecture, publishAmnaShamimaLecture, unpublishAmnaShamimaLecture, deleteAmnaShamimaLecture } from "@/lib/amnaShamimaLectures";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  if (body.action === "publish") {
    await publishAmnaShamimaLecture(id);
    return NextResponse.json({ ok: true });
  }
  if (body.action === "unpublish") {
    await unpublishAmnaShamimaLecture(id);
    return NextResponse.json({ ok: true });
  }
  if (typeof body.title === "string") {
    await updateAmnaShamimaLecture(id, body.title, body.description ?? "");
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteAmnaShamimaLecture(id);
  return NextResponse.json({ ok: true });
}
