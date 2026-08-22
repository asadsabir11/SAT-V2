import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listChallansForStudent } from "@/lib/challans";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const challans = await listChallansForStudent(session.id);
  return NextResponse.json({ challans });
}
