import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPunjab10thQuizById, submitPunjab10thAttempt } from "@/lib/punjab10thQuiz";
import { getPunjab10thAccessLevel } from "@/lib/punjab10thAccess";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "punjab-10th") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const quiz = await getPunjab10thQuizById(id);
  if (!quiz || !quiz.is_published) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (quiz.questions.length === 0) return NextResponse.json({ error: "This quiz has no questions yet" }, { status: 400 });

  const access = await getPunjab10thAccessLevel(session.email);
  if (access !== "unlocked") {
    return NextResponse.json({ error: "Access denied. Unlock full access to submit this quiz." }, { status: 403 });
  }

  const { answers } = await req.json() as { answers: Record<string, number> };
  const result = await submitPunjab10thAttempt(id, session.email, session.name, answers ?? {}, quiz.questions);

  return NextResponse.json(result);
}
