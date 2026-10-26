import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getALevelSubmissionsForAssignment } from "@/lib/aLevelAssignments";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const submissions = await getALevelSubmissionsForAssignment(id);
  return NextResponse.json({ submissions });
}
