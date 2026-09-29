import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAssignmentById, upsertSubmission } from "@/lib/amnaShamimaAssignments";

// Late submissions are allowed, same as Google Classroom's "Turn in" after
// the due date — the server just flags is_late rather than rejecting the
// request. There's no cutoff here at all; if that's ever wanted, it belongs
// here as an additional check.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "amna-shamima") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const assignment = await getAssignmentById(id);
  if (!assignment || !assignment.is_published) {
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
