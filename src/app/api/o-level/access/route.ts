import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOLevelAccessMap } from "@/lib/olevelAccess";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const access = await getOLevelAccessMap(session.email);
  return NextResponse.json({ access });
}
