import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  hasCompletedLecture,
  getLectureQuiz,
  saveQuizResult,
  getBestScore,
} from "@/lib/lecture-quiz";
import { saveAssessment, saveQuestionResults, ensureAnalyticsTables } from "@/lib/analytics";
import { sql } from "@/lib/db";


type Params = { params: Promise<{ id: string }> };

// GET — fetch quiz for student
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const [completed, questions, bestScore] = await Promise.all([
    hasCompletedLecture(id, session.email),
    getLectureQuiz(id),
    getBestScore(id, session.email),
  ]);

  if (!completed) {
    return NextResponse.json({ completed_lecture: false, questions: [], best_score: bestScore });
  }

  if (!questions) {
    return NextResponse.json({ completed_lecture: true, questions: null, best_score: bestScore });
  }

  // Strip answers before sending to client
  const clientQuestions = questions.map(({ answer: _a, ...q }) => q);
  return NextResponse.json({ completed_lecture: true, questions: clientQuestions, best_score: bestScore });
}

// POST — submit answers
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const completed = await hasCompletedLecture(id, session.email);
  if (!completed) return NextResponse.json({ error: "Complete the lecture first" }, { status: 403 });

  const questions = await getLectureQuiz(id);
  if (!questions) return NextResponse.json({ error: "No quiz found" }, { status: 404 });

  const { answers } = await req.json() as { answers: Record<string, string> };

  const results = questions.map(q => ({
    id: q.id,
    correct: answers[q.id] === q.answer,
    correctAnswer: q.answer,
    userAnswer: answers[q.id] ?? null,
  }));

  const score = results.filter(r => r.correct).length;
  await saveQuizResult(id, session.email, score, questions.length);

  // Track analytics (non-fatal)
  try {
    await ensureAnalyticsTables();
    const userRows = await sql`SELECT id FROM users WHERE email = ${session.email} LIMIT 1`;
    const studentId = (userRows[0] as { id: string } | undefined)?.id;
    if (studentId) {
      const pct = Math.round((score / questions.length) * 100);
      const assessmentId = await saveAssessment(studentId, "lecture_quiz", id, pct);
      await saveQuestionResults(assessmentId, results.map(r => ({ skillId: null, isCorrect: r.correct })));
    }
  } catch (err) {
    console.error("Analytics save failed (non-fatal):", err);
  }

  return NextResponse.json({ score, total: questions.length, results });
}
