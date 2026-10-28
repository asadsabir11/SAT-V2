import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getALevelAccessMap } from "@/lib/aLevelAccess";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "a-level") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const access = await getALevelAccessMap(session.email);
  const subject = req.nextUrl.searchParams.get("subject");
  const access_level = subject ? (access[subject] ?? "free") : undefined;
  return NextResponse.json({ access, access_level });
}
