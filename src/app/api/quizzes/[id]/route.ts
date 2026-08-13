import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ensureSatQuizTables } from "@/lib/satQuizzes";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "student") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSatQuizTables();
  const { id } = await params;
  const [quiz] = await sql`SELECT id, title, description, subject, time_limit_minutes FROM quiz_sets WHERE id = ${id} AND is_published = TRUE`;
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  // Return questions without correct_answer — revealed only after submission
  const questions = await sql`
    SELECT id, question_text, options, order_index
    FROM quiz_set_questions WHERE quiz_id = ${id} ORDER BY order_index, created_at
  `;
  return NextResponse.json({ quiz, questions });
}
