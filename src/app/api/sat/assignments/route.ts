import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPublishedAssignments, getSubmissionForStudent } from "@/lib/satAssignments";
import { getStudentAccessLevel } from "@/lib/users";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "sat") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const accessLevel = await getStudentAccessLevel(session.email);
  if (accessLevel !== "unlocked") {
    return NextResponse.json({ assignments: [], access_level: accessLevel });
  }
  const assignments = await getPublishedAssignments();
  const withSubmissions = await Promise.all(
    assignments.map(async (a) => ({ ...a, my_submission: await getSubmissionForStudent(a.id, session.email) }))
  );
  return NextResponse.json({ assignments: withSubmissions, access_level: accessLevel });
}
