import { NextRequest, NextResponse } from "next/server";
import { getQuizById, submitAttempt } from "@/lib/quiz";
import { saveAssessment, saveQuestionResults, inferSkillFromTopic, ensureAnalyticsTables } from "@/lib/analytics";
import { sql } from "@/lib/db";


export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { studentEmail, studentName, answers } = await request.json();
    if (!studentEmail || !answers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const quiz = await getQuizById(id);
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    const result = await submitAttempt(id, studentEmail, studentName ?? "", answers, quiz.questions);

    // Track analytics (fire-and-forget — don't fail the response if analytics errors)
    try {
      await ensureAnalyticsTables();
      const userRows = await sql`SELECT id FROM users WHERE email = ${studentEmail} LIMIT 1`;
      const studentId = (userRows[0] as { id: string } | undefined)?.id;
      if (studentId) {
        const assessmentId = await saveAssessment(
          studentId, "quiz", id,
          result.totalScore, result.rwScore, result.mathScore
        );
        const qResults = quiz.questions.map(q => ({
          skillId: inferSkillFromTopic(q.topic ?? ""),
          isCorrect: answers[q.id] === q.correct,
        }));
        await saveQuestionResults(assessmentId, qResults);
      }
    } catch (analyticsErr) {
      console.error("Analytics save failed (non-fatal):", analyticsErr);
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Quiz submit error", error);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
