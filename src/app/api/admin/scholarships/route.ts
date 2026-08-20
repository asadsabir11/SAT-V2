import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listScholarshipApplications } from "@/lib/scholarships";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const applications = await listScholarshipApplications();
  return NextResponse.json({ applications });
}
