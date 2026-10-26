import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getALevelAssignmentById, getALevelSubmissionForStudent } from "@/lib/aLevelAssignments";
import { getALevelAccessLevel } from "@/lib/aLevelAccess";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "a-level") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const accessLevel = await getALevelAccessLevel(session.email);
  if (accessLevel !== "unlocked") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { id } = await params;
  const assignment = await getALevelAssignmentById(id);
  if (!assignment || !assignment.is_published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const my_submission = await getALevelSubmissionForStudent(id, session.email);
  return NextResponse.json({ assignment, my_submission });
}
