import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getQuizById, submitAttempt } from "@/lib/olevel-quiz";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const quiz = await getQuizById(id);
  if (!quiz || !quiz.is_published) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (quiz.questions.length === 0) return NextResponse.json({ error: "This quiz has no questions yet" }, { status: 400 });

  const { answers } = await req.json() as { answers: Record<string, number> };
  const result = await submitAttempt(id, session.email, session.name, answers ?? {}, quiz.questions);

  return NextResponse.json(result);
}
