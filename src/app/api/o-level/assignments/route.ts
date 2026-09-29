import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPublishedAssignments, getSubmissionForStudent } from "@/lib/oLevelAssignments";
import { getOLevelAccessMap } from "@/lib/olevelAccess";

// Locked subjects are hidden entirely — filtered out here in JS rather than
// in SQL (mirrors how getOLevelAccessMap's other callers already do
// subject-scoping), so a locked subject's assignments never even reach the
// client, not just visually blurred like O-Level lectures.
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "o-level") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [assignments, access] = await Promise.all([
    getPublishedAssignments(),
    getOLevelAccessMap(session.email),
  ]);
  const unlocked = assignments.filter((a) => access[a.category] === "unlocked");
  const withSubmissions = await Promise.all(
    unlocked.map(async (a) => ({ ...a, my_submission: await getSubmissionForStudent(a.id, session.email) }))
  );
  const unlockedSubjects = Object.keys(access).filter((s) => access[s] === "unlocked");
  return NextResponse.json({ assignments: withSubmissions, unlockedSubjects });
}
