import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getLectureQuiz, saveLectureQuiz, deleteLectureQuiz, type LectureQuizQuestion } from "@/lib/lecture-quiz";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const questions = await getLectureQuiz(id);
  return NextResponse.json({ questions: questions ?? [] });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteLectureQuiz(id);
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { questions } = await req.json() as { questions: LectureQuizQuestion[] };

  if (!Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: "Questions array required" }, { status: 400 });
  }

  for (const q of questions) {
    if (!q.question?.trim() || !Array.isArray(q.options) || q.options.length !== 4 || !q.answer) {
      return NextResponse.json({ error: "Each question needs text, 4 options, and an answer" }, { status: 400 });
    }
  }

  await saveLectureQuiz(id, questions);
  return NextResponse.json({ ok: true });
}
