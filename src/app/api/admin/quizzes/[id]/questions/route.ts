import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ensureSatQuizTables } from "@/lib/satQuizzes";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSatQuizTables();
  const { id } = await params;
  const { question_text, options, correct_answer, explanation, order_index } = await req.json();
  if (!question_text?.trim() || !options || !correct_answer) {
    return NextResponse.json({ error: "question_text, options, and correct_answer are required" }, { status: 400 });
  }
  const [question] = await sql`
    INSERT INTO quiz_set_questions (quiz_id, question_text, options, correct_answer, explanation, order_index)
    VALUES (${id}, ${question_text.trim()}, ${JSON.stringify(options)}, ${correct_answer}, ${explanation ?? ""}, ${order_index ?? 0})
    RETURNING *
  `;
  return NextResponse.json({ question });
}
