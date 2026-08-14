import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listApplications } from "@/lib/olevelApplications";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const applications = await listApplications();
  return NextResponse.json({ applications });
}
