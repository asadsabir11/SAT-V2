import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteByField } from "@/lib/storage";
import { sql } from "@/lib/db";


type Params = { params: Promise<{ email: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { email } = await params;
  const decoded = decodeURIComponent(email);

  await Promise.all([
    deleteByField("leads-student.json", "studentEmail", decoded),
    deleteByField("diagnostics.json", "email", decoded),
    sql`DELETE FROM users WHERE email = ${decoded.toLowerCase().trim()} AND role = 'student'`,
  ]);

  return NextResponse.json({ ok: true });
}
