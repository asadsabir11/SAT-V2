import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getALevelQuizById, submitALevelAttempt } from "@/lib/aLevelQuiz";
import { getALevelAccessLevel } from "@/lib/aLevelAccess";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "a-level") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const quiz = await getALevelQuizById(id);
  if (!quiz || !quiz.is_published) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (quiz.questions.length === 0) return NextResponse.json({ error: "This quiz has no questions yet" }, { status: 400 });

  const access = await getALevelAccessLevel(session.email);
  if (access !== "unlocked") {
    return NextResponse.json({ error: "Access denied. Unlock full access to submit this quiz." }, { status: 403 });
  }

  const { answers } = await req.json() as { answers: Record<string, number> };
  const result = await submitALevelAttempt(id, session.email, session.name, answers ?? {}, quiz.questions);

  return NextResponse.json(result);
}
