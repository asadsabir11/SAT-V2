import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { findByField } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "founder") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const email = request.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const student = await findByField("leads-student.json", "studentEmail", email);
  const diagnostic = await findByField("diagnostics.json", "email", email);
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
  return NextResponse.json({ student, diagnostic });
}
