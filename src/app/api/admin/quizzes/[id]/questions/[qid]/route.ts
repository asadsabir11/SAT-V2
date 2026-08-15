import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ensureSatQuizTables } from "@/lib/satQuizzes";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; qid: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSatQuizTables();
  const { qid } = await params;
  const { question_text, options, correct_answer, explanation } = await req.json();
  const [question] = await sql`
    UPDATE quiz_set_questions
    SET question_text = ${question_text}, options = ${JSON.stringify(options)}, correct_answer = ${correct_answer}, explanation = ${explanation ?? ""}
    WHERE id = ${qid} RETURNING *
  `;
  return NextResponse.json({ question });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; qid: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSatQuizTables();
  const { qid } = await params;
  await sql`DELETE FROM quiz_set_questions WHERE id = ${qid}`;
  return NextResponse.json({ ok: true });
}
