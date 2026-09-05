import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updatePunjab9thSession, deletePunjab9thSession, type Punjab9thStudyGroup } from "@/lib/punjab9thSessions";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  if (body.studyGroup && !["Biology", "Computer Science", "Both"].includes(body.studyGroup)) {
    return NextResponse.json({ error: "Invalid studyGroup" }, { status: 400 });
  }
  await updatePunjab9thSession(id, {
    subject: body.subject?.trim(),
    study_group: body.studyGroup as Punjab9thStudyGroup | undefined,
    title: body.title?.trim(),
    meeting_link: body.meetingLink?.trim(),
    scheduled_at: body.scheduledAt,
    is_active: body.isActive,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deletePunjab9thSession(id);
  return NextResponse.json({ ok: true });
}
