import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAttendanceForSession, upsertAttendance } from "@/lib/parent-system";
import { sql } from "@/lib/db";


export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessionId = new URL(req.url).searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  const attendance = await getAttendanceForSession(sessionId);
  return NextResponse.json({ attendance });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId, records } = await req.json() as {
    sessionId: string;
    records: { studentId: string; status: "present" | "late" | "absent" }[];
  };

  if (!sessionId || !Array.isArray(records)) {
    return NextResponse.json({ error: "sessionId and records required" }, { status: 400 });
  }

  await Promise.all(records.map(r => upsertAttendance(r.studentId, sessionId, r.status)));
  return NextResponse.json({ ok: true });
}

// List all live sessions for the selector
export async function OPTIONS() {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sessions = await sql`SELECT id, title, scheduled_at FROM live_sessions ORDER BY scheduled_at DESC LIMIT 50`;
  return NextResponse.json({ sessions });
}
