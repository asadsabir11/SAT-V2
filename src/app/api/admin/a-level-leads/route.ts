import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { readData } from "@/lib/storage";

interface ALevelLead {
  id: string;
  studentName: string;
  studentEmail?: string;
  parentName: string;
  parentWhatsapp: string;
  parentEmail?: string | null;
  city: string;
  schoolOrQualification: string;
  preferredClassTime: string;
  deviceAvailable: string | null;
  howHeard: string | null;
  createdAt: string;
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const leads = await readData<ALevelLead>("leads-a-level.json");
  return NextResponse.json({ leads: leads.slice().reverse() });
}
