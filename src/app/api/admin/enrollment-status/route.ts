import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getEnrollmentStatuses, setEnrollmentStatus, type EnrollmentProgram, type EnrollmentStatus } from "@/lib/enrollmentStatus";

const PROGRAMS: EnrollmentProgram[] = ["sat", "o-level", "punjab-9th"];

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const statuses = await getEnrollmentStatuses();
  return NextResponse.json({ statuses });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { program, status } = await req.json();
  if (!PROGRAMS.includes(program) || (status !== "open" && status !== "full")) {
    return NextResponse.json({ error: "A valid program and status are required" }, { status: 400 });
  }
  await setEnrollmentStatus(program as EnrollmentProgram, status as EnrollmentStatus, session.email);
  return NextResponse.json({ ok: true });
}
