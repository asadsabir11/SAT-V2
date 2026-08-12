import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getQuizById,
  updateQuizMeta,
  setQuizQuestions,
  publishQuiz,
  unpublishQuiz,
  deleteQuiz,
  getBestAttempt,
} from "@/lib/olevel-quiz";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const quiz = await getQuizById(id);
  if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.role === "founder") {
    return NextResponse.json({ quiz });
  }

  if (session.role !== "student" || !quiz.is_published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const bestScore = await getBestAttempt(id, session.email);
  const questions = quiz.questions.map(({ correct: _c, explanation: _e, ...q }) => q);
  return NextResponse.json({ quiz: { ...quiz, questions }, best_score: bestScore });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  if (body.action === "publish") { await publishQuiz(id); return NextResponse.json({ ok: true }); }
  if (body.action === "unpublish") { await unpublishQuiz(id); return NextResponse.json({ ok: true }); }
  if (body.questions !== undefined) { await setQuizQuestions(id, body.questions); return NextResponse.json({ ok: true }); }
  if (body.title !== undefined) {
    await updateQuizMeta(id, body.title, body.description ?? "", body.time_limit_minutes ?? 0);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteQuiz(id);
  return NextResponse.json({ ok: true });
}
