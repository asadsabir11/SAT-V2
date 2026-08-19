import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteByField } from "@/lib/storage";
import { deleteParentsForStudent } from "@/lib/parent-system";
import { sql } from "@/lib/db";


type Params = { params: Promise<{ email: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { email } = await params;
  const decoded = decodeURIComponent(email).toLowerCase().trim();

  // Scoped to program = 'sat' — this route is only ever called from the SAT
  // admin dashboard, and without this a same-email O-Level account (dual-
  // program students share an email across two separate rows) would get
  // deleted right along with it.
  const studentRows = await sql`SELECT id FROM users WHERE email = ${decoded} AND role = 'student' AND program = 'sat'`;
  for (const row of studentRows as { id: string }[]) {
    await deleteParentsForStudent(row.id);
  }

  await Promise.all([
    deleteByField("leads-student.json", "studentEmail", decoded),
    deleteByField("diagnostics.json", "email", decoded),
    sql`DELETE FROM users WHERE email = ${decoded} AND role = 'student' AND program = 'sat'`,
  ]);

  return NextResponse.json({ ok: true });
}
