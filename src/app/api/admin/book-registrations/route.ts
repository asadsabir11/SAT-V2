import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listBookRegistrations, type BookCodeProgram } from "@/lib/bookCodes";

const VALID_PROGRAMS: BookCodeProgram[] = ["o-level", "punjab-9th", "a-level"];

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const programParam = req.nextUrl.searchParams.get("program");
  const program = VALID_PROGRAMS.includes(programParam as BookCodeProgram) ? (programParam as BookCodeProgram) : undefined;
  const registrations = await listBookRegistrations(program);
  return NextResponse.json({ registrations });
}
