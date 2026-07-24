import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteByField } from "@/lib/storage";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.POSTGRES_URL!);

type Params = { params: Promise<{ email: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { email } = await params;
  const decoded = decodeURIComponent(email);

  await Promise.all([
    deleteByField("leads-student", "studentEmail", decoded),
    deleteByField("diagnostics", "email", decoded),
    sql`DELETE FROM users WHERE email = ${decoded.toLowerCase().trim()} AND role = 'student'`,
  ]);

  return NextResponse.json({ ok: true });
}
