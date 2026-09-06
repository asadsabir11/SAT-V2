import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getPunjab9thQuizById,
  updatePunjab9thQuizMeta,
  setPunjab9thQuizQuestions,
  publishPunjab9thQuiz,
  unpublishPunjab9thQuiz,
  deletePunjab9thQuiz,
  getPunjab9thBestAttempt,
} from "@/lib/punjab9thQuiz";
import { getPunjab9thAccessLevel } from "@/lib/punjab9thAccess";
import { createNotification } from "@/lib/notifications";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const quiz = await getPunjab9thQuizById(id);
  if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.role === "founder" || session.role === "teacher") {
    return NextResponse.json({ quiz });
  }

  if (session.role !== "student" || session.program !== "punjab-9th" || !quiz.is_published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const access = await getPunjab9thAccessLevel(session.email);
  if (access !== "unlocked") {
    return NextResponse.json({ error: "Access denied. Unlock full access to take this quiz.", access }, { status: 403 });
  }

  const bestScore = await getPunjab9thBestAttempt(id, session.email);
  const questions = quiz.questions.map(({ correct: _c, explanation: _e, ...q }) => q);
  return NextResponse.json({ quiz: { ...quiz, questions }, best_score: bestScore });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  if (body.action === "publish") {
    await publishPunjab9thQuiz(id);
    const quiz = await getPunjab9thQuizById(id);
    if (quiz) {
      await createNotification({
        type: "quiz",
        title: `New quiz: ${quiz.title}`,
        link: "/punjab-board-9th-class/portal",
        program: "punjab-9th",
        subject: quiz.subject,
      }).catch(console.error);
    }
    return NextResponse.json({ ok: true });
  }
  if (body.action === "unpublish") { await unpublishPunjab9thQuiz(id); return NextResponse.json({ ok: true }); }
  if (body.questions !== undefined) { await setPunjab9thQuizQuestions(id, body.questions); return NextResponse.json({ ok: true }); }
  if (body.title !== undefined) {
    await updatePunjab9thQuizMeta(id, body.title, body.description ?? "", body.time_limit_minutes ?? 0);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deletePunjab9thQuiz(id);
  return NextResponse.json({ ok: true });
}
