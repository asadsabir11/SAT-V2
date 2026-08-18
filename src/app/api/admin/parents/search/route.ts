import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { findAllByFieldCI } from "@/lib/storage";
import { findUserByEmailAndProgram } from "@/lib/users";

// Registration forms collect a "parent email" field, but only as plain lead
// data — no account or link exists yet at that point. This looks that lead
// data up by parent email and resolves each match back to the student's
// real account, so the admin doesn't have to hunt through a long dropdown
// to find the right child.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = new URL(req.url).searchParams;
  const parentEmail = params.get("parentEmail")?.trim();
  const program = params.get("program");
  if (!parentEmail || (program !== "sat" && program !== "o-level")) {
    return NextResponse.json({ error: "parentEmail and a valid program are required" }, { status: 400 });
  }

  const collection = program === "sat" ? "leads-student.json" : "leads-o-level.json";
  const leads = await findAllByFieldCI<{ studentEmail?: string }>(collection, "parentEmail", parentEmail);

  const seen = new Set<string>();
  const students = [];
  for (const lead of leads) {
    const studentEmail = lead.studentEmail?.trim().toLowerCase();
    if (!studentEmail || seen.has(studentEmail)) continue;
    seen.add(studentEmail);
    const student = await findUserByEmailAndProgram(studentEmail, program);
    if (student) students.push({ id: student.id, name: student.name, email: student.email });
  }

  return NextResponse.json({ students });
}
