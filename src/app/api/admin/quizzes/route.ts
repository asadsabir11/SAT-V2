import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ensureSatQuizTables } from "@/lib/satQuizzes";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSatQuizTables();
  const quizzes = await sql`
    SELECT q.*,
      COUNT(DISTINCT qq.id)::int AS question_count,
      COUNT(DISTINCT qa.id)::int AS attempt_count
    FROM quiz_sets q
    LEFT JOIN quiz_set_questions qq ON qq.quiz_id = q.id
    LEFT JOIN quiz_set_attempts qa ON qa.quiz_id = q.id AND qa.completed_at IS NOT NULL
    GROUP BY q.id
    ORDER BY q.created_at DESC
  `;
  return NextResponse.json({ quizzes });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSatQuizTables();
  const { title, description, subject, category, time_limit_minutes } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  const [quiz] = await sql`
    INSERT INTO quiz_sets (title, description, subject, category, time_limit_minutes, created_by)
    VALUES (${title.trim()}, ${description ?? ""}, ${subject ?? "general"}, ${category ?? "math"}, ${time_limit_minutes ?? null}, ${session.id})
    RETURNING *
  `;
  return NextResponse.json({ quiz });
}
