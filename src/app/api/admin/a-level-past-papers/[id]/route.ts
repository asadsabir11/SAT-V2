import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateALevelPaper, publishALevelPaper, unpublishALevelPaper, deleteALevelPaper } from "@/lib/aLevelPastPapers";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  if (body.action === "publish") { await publishALevelPaper(id); return NextResponse.json({ ok: true }); }
  if (body.action === "unpublish") { await unpublishALevelPaper(id); return NextResponse.json({ ok: true }); }
  await updateALevelPaper(id, {
    title: body.title,
    description: body.description,
    session: body.session,
    paper_type: body.paper_type,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteALevelPaper(id);
  return NextResponse.json({ ok: true });
}
