import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAssignmentById, getSubmissionForStudent } from "@/lib/satAssignments";
import { getStudentAccessLevel } from "@/lib/users";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "sat") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const accessLevel = await getStudentAccessLevel(session.email);
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
