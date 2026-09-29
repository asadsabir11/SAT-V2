import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPublishedAssignments, getSubmissionForStudent } from "@/lib/amnaShamimaAssignments";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "amna-shamima") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const assignments = await getPublishedAssignments();
  const withSubmissions = await Promise.all(
    assignments.map(async (a) => ({ ...a, my_submission: await getSubmissionForStudent(a.id, session.email) }))
  );
  return NextResponse.json({ assignments: withSubmissions });
}
