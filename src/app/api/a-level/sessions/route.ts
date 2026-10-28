import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getActiveALevelSessions } from "@/lib/aLevelSessions";
import { getALevelAccessMap } from "@/lib/aLevelAccess";

// Live classes aren't content-locked per volume like lectures/quizzes/past
// papers/assignments are — a single scheduled session can cover either
// volume's syllabus, so any one unlocked subject is enough to join. Full
// per-volume locking here would add complexity without matching how the
// teacher actually runs classes.
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "a-level") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const accessMap = await getALevelAccessMap(session.email);
  const hasAnyAccess = Object.values(accessMap).some((s) => s === "unlocked");
  if (!hasAnyAccess) {
    return NextResponse.json({ sessions: [], access: "free" });
  }
  const sessions = await getActiveALevelSessions();
  return NextResponse.json({ sessions, access: "unlocked" });
}
