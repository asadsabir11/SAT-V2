import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPublishedALevelPapers } from "@/lib/aLevelPastPapers";
import { getALevelAccessLevel } from "@/lib/aLevelAccess";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "a-level") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const access = await getALevelAccessLevel(session.email);
  if (access !== "unlocked") {
    return NextResponse.json({ papers: [], access });
  }
  const papers = await getPublishedALevelPapers();
  return NextResponse.json({ papers, access });
}
