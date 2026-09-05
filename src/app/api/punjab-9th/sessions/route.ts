import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getActivePunjab9thSessionsForGroup } from "@/lib/punjab9thSessions";
import { findByField } from "@/lib/storage";

interface Punjab9thLead { studentEmail?: string; studyGroup: string; }

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "punjab-9th") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // The account itself doesn't store which group the student registered
  // for — that lives on their original lead record, looked up by the same
  // email they registered and logged in with.
  const lead = await findByField<Punjab9thLead>("leads-punjab-9th.json", "studentEmail", session.email);
  if (!lead) {
    return NextResponse.json({ sessions: [], studyGroup: null });
  }

  const sessions = await getActivePunjab9thSessionsForGroup(lead.studyGroup);
  return NextResponse.json({ sessions, studyGroup: lead.studyGroup });
}
