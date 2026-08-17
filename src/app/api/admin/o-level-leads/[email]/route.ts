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
  const decoded = decodeURIComponent(email).toLowerCase().trim();

  await Promise.all([
    deleteByField("leads-o-level.json", "studentEmail", decoded),
    sql`DELETE FROM users WHERE email = ${decoded} AND role = 'student' AND program = 'o-level'`,
    sql`DELETE FROM olevel_subject_access WHERE email = ${decoded}`,
  ]);

  return NextResponse.json({ ok: true });
}
