import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllPunjab9thSessions, createPunjab9thSession, type Punjab9thStudyGroup } from "@/lib/punjab9thSessions";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sessions = await getAllPunjab9thSessions();
  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { subject, studyGroup, title, meetingLink, scheduledAt, isActive } = body;
  if (!subject?.trim() || !studyGroup || !title?.trim() || !meetingLink?.trim() || !scheduledAt) {
    return NextResponse.json({ error: "subject, studyGroup, title, meetingLink and scheduledAt are required" }, { status: 400 });
  }
  if (!["Biology", "Computer Science", "Both"].includes(studyGroup)) {
    return NextResponse.json({ error: "Invalid studyGroup" }, { status: 400 });
  }

  const id = await createPunjab9thSession({
    subject: subject.trim(),
    study_group: studyGroup as Punjab9thStudyGroup,
    title: title.trim(),
    meeting_link: meetingLink.trim(),
    scheduled_at: scheduledAt,
    is_active: isActive !== false,
    created_by: session.email,
  });
  return NextResponse.json({ ok: true, id });
}
