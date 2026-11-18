import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getActivePunjab10thSessionsForGroup } from "@/lib/punjab10thSessions";
import { findByField } from "@/lib/storage";

interface Punjab10thLead { studentEmail?: string; studyGroup: string; }

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "punjab-10th") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // The account itself doesn't store which group the student registered
  // for — that lives on their original lead record, looked up by the same
  // email they registered and logged in with.
  const lead = await findByField<Punjab10thLead>("leads-punjab-10th.json", "studentEmail", session.email);
  if (!lead) {
    return NextResponse.json({ sessions: [], studyGroup: null });
  }

  const sessions = await getActivePunjab10thSessionsForGroup(lead.studyGroup);
  return NextResponse.json({ sessions, studyGroup: lead.studyGroup });
}
