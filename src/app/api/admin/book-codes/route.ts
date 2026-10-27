import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateBookCodes, listBookCodes, type BookCodeProgram } from "@/lib/bookCodes";

const VALID_PROGRAMS: BookCodeProgram[] = ["o-level", "punjab-9th", "a-level"];

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const programParam = req.nextUrl.searchParams.get("program");
  const program = VALID_PROGRAMS.includes(programParam as BookCodeProgram) ? (programParam as BookCodeProgram) : undefined;
  const codes = await listBookCodes(program);
  return NextResponse.json({ codes });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const program = body?.program;
  const subject = typeof body?.subject === "string" && body.subject.trim() ? body.subject.trim() : null;
  const count = Number(body?.count);
  const batchLabel = typeof body?.batchLabel === "string" ? body.batchLabel.trim() : "";

  if (!VALID_PROGRAMS.includes(program)) {
    return NextResponse.json({ error: "Invalid program" }, { status: 400 });
  }
  if (program === "o-level" && !subject) {
    return NextResponse.json({ error: "Subject is required for O Level codes" }, { status: 400 });
  }
  if (!Number.isInteger(count) || count < 1 || count > 2000) {
    return NextResponse.json({ error: "Count must be between 1 and 2000" }, { status: 400 });
  }
  if (!batchLabel) {
    return NextResponse.json({ error: "Batch label is required" }, { status: 400 });
  }

  const codes = await generateBookCodes({ program, subject, count, batchLabel, createdBy: session.email });
  return NextResponse.json({ ok: true, codes });
}
