import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ensureParentTables } from "@/lib/parent-system";
import { ensureAnalyticsTables } from "@/lib/analytics";
import { ensureTables as ensureQuizTables } from "@/lib/quiz";

export async function DELETE() {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await Promise.all([ensureParentTables(), ensureAnalyticsTables(), ensureQuizTables()]);

  // Delete all student leads, diagnostics, users, and quiz results — keeps webinar/partner/contact leads
  // Note: leads/diagnostics are saved under "leads-student.json"/"diagnostics.json"
  // (the .json suffix is part of the literal collection key, not a real file);
  // quiz attempts live in their own quiz_attempts table, not sat_records.
  await Promise.all([
    sql`DELETE FROM sat_records WHERE collection = 'leads-student.json'`,
    sql`DELETE FROM sat_records WHERE collection = 'diagnostics.json'`,
    sql`DELETE FROM quiz_attempts`,
    sql`DELETE FROM users WHERE role = 'student'`,
  ]);

  // Clean up per-student records now orphaned by the user deletes, so real
  // metrics start from a clean slate.
  await Promise.all([
    sql`DELETE FROM parent_student_links WHERE student_id NOT IN (SELECT id FROM users)`,
    sql`DELETE FROM parent_reports WHERE student_id NOT IN (SELECT id FROM users)`,
    sql`DELETE FROM homework_submissions WHERE student_id NOT IN (SELECT id FROM users)`,
    sql`DELETE FROM session_attendance WHERE student_id NOT IN (SELECT id FROM users)`,
    sql`DELETE FROM assessments WHERE student_id NOT IN (SELECT id FROM users)`,
    sql`DELETE FROM ai_tutor_sessions WHERE student_id NOT IN (SELECT id FROM users)`,
  ]);
  // Parent accounts left with no linked student are test parents — remove them.
  await sql`
    DELETE FROM users
    WHERE role = 'parent'
      AND id NOT IN (SELECT parent_user_id FROM parent_student_links)
  `;

  return NextResponse.json({ ok: true });
}
