import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAssignmentById, getSubmissionById, gradeSubmission } from "@/lib/amnaShamimaAssignments";
import { createNotification } from "@/lib/notifications";
import { sql } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; subId: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, subId } = await params;
  const { marks, feedback } = await req.json();
  if (typeof marks !== "number" || marks < 0) {
    return NextResponse.json({ error: "A valid marks value is required" }, { status: 400 });
  }

  await gradeSubmission(subId, marks, feedback?.trim() || null, session.email);

  const [assignment, submission] = await Promise.all([getAssignmentById(id), getSubmissionById(subId)]);
  if (assignment && submission) {
    const userRows = await sql`SELECT id FROM users WHERE email = ${submission.student_email} LIMIT 1`;
    const studentUserId = (userRows[0] as { id: string } | undefined)?.id ?? null;
    await createNotification({
      type: "assignment",
      title: `Your assignment "${assignment.title}" was graded`,
      body: `${marks}${assignment.max_marks ? `/${assignment.max_marks}` : ""}${feedback?.trim() ? ` — ${feedback.trim()}` : ""}`,
      link: `/amna-shamima/portal/assignments/${id}`,
      program: "amna-shamima",
      studentUserId,
    }).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}
