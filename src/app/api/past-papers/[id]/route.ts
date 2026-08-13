import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPaperById, updatePaper, publishPaper, unpublishPaper, deletePaper } from "@/lib/past-papers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const paper = await getPaperById(id);
  if (!paper) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.role === "founder") return NextResponse.json({ paper });
  if (session.role !== "student" || !paper.is_published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ paper });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  if (body.action === "publish") { await publishPaper(id); return NextResponse.json({ ok: true }); }
  if (body.action === "unpublish") { await unpublishPaper(id); return NextResponse.json({ ok: true }); }
  await updatePaper(id, body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deletePaper(id);
  return NextResponse.json({ ok: true });
}
