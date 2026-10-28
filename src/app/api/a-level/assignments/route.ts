import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPublishedALevelAssignments, getALevelSubmissionForStudent } from "@/lib/aLevelAssignments";
import { getALevelAccessMap } from "@/lib/aLevelAccess";

// Locked subjects are hidden entirely — mirrors O-Level's assignments route
// (filtered in JS against the access map, not blurred client-side).
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "a-level") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [assignments, access] = await Promise.all([
    getPublishedALevelAssignments(),
    getALevelAccessMap(session.email),
  ]);
  const unlocked = assignments.filter((a) => access[a.category] === "unlocked");
  const withSubmissions = await Promise.all(
    unlocked.map(async (a) => ({ ...a, my_submission: await getALevelSubmissionForStudent(a.id, session.email) }))
  );
  const unlockedSubjects = Object.keys(access).filter((s) => access[s] === "unlocked");
  return NextResponse.json({ assignments: withSubmissions, unlockedSubjects });
}
