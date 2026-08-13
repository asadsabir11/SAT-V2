import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ensureSatQuizTables } from "@/lib/satQuizzes";
import { saveAssessment, saveQuestionResults, inferSkillFromTopic, ensureAnalyticsTables } from "@/lib/analytics";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "student") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSatQuizTables();
  const { id } = await params;
  const { answers } = await req.json(); // { [questionId]: "A" | "B" | "C" | "D" }

  const [quiz] = await sql`SELECT subject FROM quiz_sets WHERE id = ${id}`;
  const questions = await sql`
    SELECT id, correct_answer, explanation FROM quiz_set_questions WHERE quiz_id = ${id}
  `;

  let score = 0;
  const results: Record<string, { correct: boolean; correct_answer: string; explanation: string }> = {};
  const qResults: { skillId: string | null; isCorrect: boolean }[] = [];

  for (const q of questions) {
    const selected = (answers as Record<string, string>)[q.id as string];
    const correct = selected === q.correct_answer;
    if (correct) score++;
    results[q.id as string] = {
      correct,
      correct_answer: q.correct_answer as string,
      explanation: (q.explanation as string) ?? "",
    };
    qResults.push({ skillId: inferSkillFromTopic(quiz?.subject ?? ""), isCorrect: correct });
  }

  await sql`
    INSERT INTO quiz_set_attempts (quiz_id, student_id, student_name, score, total, answers, completed_at)
    VALUES (${id}, ${String(session.id)}, ${session.name ?? ""}, ${score}, ${questions.length}, ${JSON.stringify(answers)}, NOW())
  `;

  // Track analytics (non-fatal)
  try {
    await ensureAnalyticsTables();
    const assessmentId = await saveAssessment(String(session.id), "quiz", id, score, undefined, undefined);
    await saveQuestionResults(assessmentId, qResults);
  } catch (err) {
    console.error("Analytics save failed (non-fatal):", err);
  }

  return NextResponse.json({ score, total: questions.length, results });
}
