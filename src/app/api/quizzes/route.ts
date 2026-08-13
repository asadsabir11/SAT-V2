import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ensureSatQuizTables } from "@/lib/satQuizzes";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSatQuizTables();
  const quizzes = await sql`
    SELECT
      q.id, q.title, q.description, q.subject, q.category, q.time_limit_minutes,
      COUNT(DISTINCT qq.id)::int AS question_count,
      (SELECT score FROM quiz_set_attempts WHERE quiz_id = q.id AND student_id::text = ${String(session.id)} AND completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 1) AS last_score,
      (SELECT total FROM quiz_set_attempts WHERE quiz_id = q.id AND student_id::text = ${String(session.id)} AND completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 1) AS last_total,
      (SELECT completed_at FROM quiz_set_attempts WHERE quiz_id = q.id AND student_id::text = ${String(session.id)} AND completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 1) AS last_attempt_at
    FROM quiz_sets q
    LEFT JOIN quiz_set_questions qq ON qq.quiz_id = q.id
    WHERE q.is_published = TRUE
    GROUP BY q.id
    ORDER BY q.created_at DESC
  `;
  return NextResponse.json({ quizzes });
}
