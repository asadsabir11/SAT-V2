import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

export async function DELETE() {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  // Delete all student leads, diagnostics, users, and quiz results — keeps webinar/partner/contact leads
  await Promise.all([
    sql`DELETE FROM sat_records WHERE collection = 'leads-student'`,
    sql`DELETE FROM sat_records WHERE collection = 'diagnostics'`,
    sql`DELETE FROM sat_records WHERE collection = 'quiz_results'`,
    sql`DELETE FROM users WHERE role = 'student'`,
  ]);

  return NextResponse.json({ ok: true });
}
