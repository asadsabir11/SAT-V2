import { NextRequest, NextResponse } from "next/server";
import { findByField } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  const student = await findByField("leads-student.json", "studentEmail", email);
  const diagnostic = await findByField("diagnostics.json", "email", email);
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
  return NextResponse.json({ student, diagnostic });
}
