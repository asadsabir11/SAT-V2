import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { readData } from "@/lib/storage";

interface Punjab10thLead {
  id: string;
  studentName: string;
  studentEmail?: string;
  parentName: string;
  parentWhatsapp: string;
  parentEmail?: string | null;
  city: string;
  punjabBoard: string;
  schoolName: string | null;
  studyGroup: string;
  teachingMedium: string;
  preferredClassTime: string;
  deviceAvailable: string | null;
  howHeard: string | null;
  createdAt: string;
}

// Read-only listing for now — this module is phase 1 (online classes only,
// no accounts/dashboard yet), so there's no status workflow here, matching
// how O-Level's own "leads" admin view (as opposed to its full
// applications table) is view + delete only.
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const leads = await readData<Punjab10thLead>("leads-punjab-10th.json");
  return NextResponse.json({ leads: leads.slice().reverse() });
}
