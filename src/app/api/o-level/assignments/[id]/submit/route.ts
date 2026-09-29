import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAssignmentById, upsertSubmission, getSubmissionForStudent, unsubmitAssignment } from "@/lib/oLevelAssignments";
import { getOLevelSubjectAccess } from "@/lib/olevelAccess";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "o-level") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const assignment = await getAssignmentById(id);
  if (!assignment || !assignment.is_published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const access = await getOLevelSubjectAccess(session.email, assignment.category);
  if (access !== "unlocked") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { file_url } = await req.json();
  if (!file_url?.trim()) {
    return NextResponse.json({ error: "A file is required" }, { status: 400 });
  }

  const isLate = assignment.due_at ? Date.now() > new Date(assignment.due_at).getTime() : false;
  await upsertSubmission({
    assignment_id: id,
    student_email: session.email,
    student_name: session.name,
    file_url: file_url.trim(),
    is_late: isLate,
  });
  return NextResponse.json({ ok: true, is_late: isLate });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "o-level") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await getSubmissionForStudent(id, session.email);
  if (!existing) return NextResponse.json({ error: "Nothing to unsubmit" }, { status: 404 });
  if (existing.marks !== null) {
    return NextResponse.json({ error: "This has already been graded — ask your teacher to change it." }, { status: 400 });
  }
  await unsubmitAssignment(id, session.email);
  return NextResponse.json({ ok: true });
}
