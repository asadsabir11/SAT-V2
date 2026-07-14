import { NextRequest, NextResponse } from "next/server";
import { getQuizById, submitAttempt } from "@/lib/quiz";

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

    // Also save to sat_records for dashboard compatibility
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Quiz submit error", error);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
