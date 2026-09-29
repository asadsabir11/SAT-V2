import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAssignmentById, getSubmissionForStudent } from "@/lib/punjab9thAssignments";
import { getPunjab9thAccessLevel } from "@/lib/punjab9thAccess";

// The list itself is server-rendered directly from the lib inside each
// subject's /portal/[subject]/assignments page (same pattern as that
// subject's Lectures/Quizzes sub-pages) — this route only serves the
// individual detail/submit page, which needs client-side interactivity.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "punjab-9th") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const accessLevel = await getPunjab9thAccessLevel(session.email);
  if (accessLevel !== "unlocked") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { id } = await params;
  const assignment = await getAssignmentById(id);
  if (!assignment || !assignment.is_published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const my_submission = await getSubmissionForStudent(id, session.email);
  return NextResponse.json({ assignment, my_submission });
}
