import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getALevelAccessLevel } from "@/lib/aLevelAccess";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "a-level") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const access_level = await getALevelAccessLevel(session.email);
  return NextResponse.json({ access_level });
}
