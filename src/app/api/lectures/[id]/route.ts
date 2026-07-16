import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getLectureById, updateLecture, publishLecture, unpublishLecture, deleteLecture } from "@/lib/lectures";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const lecture = await getLectureById(id);
  if (!lecture) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!lecture.is_published && session.role !== "founder") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ lecture });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  if (body.action === "publish")   { await publishLecture(id);   return NextResponse.json({ ok: true }); }
  if (body.action === "unpublish") { await unpublishLecture(id); return NextResponse.json({ ok: true }); }
  if (body.title !== undefined) {
    await updateLecture(id, body.title, body.description ?? "");
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteLecture(id);
  return NextResponse.json({ ok: true });
}
