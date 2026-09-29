import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAssignmentById, getSubmissionForStudent } from "@/lib/oLevelAssignments";
import { getOLevelSubjectAccess } from "@/lib/olevelAccess";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "o-level") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const assignment = await getAssignmentById(id);
  if (!assignment || !assignment.is_published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Same 404 as "doesn't exist" for a locked subject — never reveals that a
  // locked subject even has an assignment.
  const access = await getOLevelSubjectAccess(session.email, assignment.category);
  if (access !== "unlocked") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const my_submission = await getSubmissionForStudent(id, session.email);
  return NextResponse.json({ assignment, my_submission });
}
