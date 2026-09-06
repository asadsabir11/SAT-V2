import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { readData } from "@/lib/storage";

interface AmnaShamimaLead {
  id: string;
  studentName: string;
  studentEmail: string;
  whatsapp: string;
  city: string | null;
  createdAt: string;
}

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const leads = await readData<AmnaShamimaLead>("leads-amna-shamima.json");
  return NextResponse.json({ leads: leads.slice().reverse() });
}
