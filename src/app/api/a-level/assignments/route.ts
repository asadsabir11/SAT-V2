import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPublishedALevelAssignments, getALevelSubmissionForStudent } from "@/lib/aLevelAssignments";
import { getALevelAccessLevel } from "@/lib/aLevelAccess";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "a-level") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const accessLevel = await getALevelAccessLevel(session.email);
  if (accessLevel !== "unlocked") {
    return NextResponse.json({ assignments: [], access_level: accessLevel });
  }
  const assignments = await getPublishedALevelAssignments();
  const withSubmissions = await Promise.all(
    assignments.map(async (a) => ({ ...a, my_submission: await getALevelSubmissionForStudent(a.id, session.email) }))
  );
  return NextResponse.json({ assignments: withSubmissions, access_level: accessLevel });
}
