import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getALevelQuizById,
  updateALevelQuizMeta,
  setALevelQuizQuestions,
  publishALevelQuiz,
  unpublishALevelQuiz,
  deleteALevelQuiz,
  getALevelBestAttempt,
} from "@/lib/aLevelQuiz";
import { getALevelSubjectAccess } from "@/lib/aLevelAccess";
import { createNotification } from "@/lib/notifications";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const quiz = await getALevelQuizById(id);
  if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.role === "founder" || session.role === "teacher") {
    return NextResponse.json({ quiz });
  }

  if (session.role !== "student" || session.program !== "a-level" || !quiz.is_published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const access = await getALevelSubjectAccess(session.email, quiz.subject);
  if (access !== "unlocked") {
    return NextResponse.json({ error: "Access denied. Unlock this subject to take this quiz.", access, subject: quiz.subject }, { status: 403 });
  }

  const bestScore = await getALevelBestAttempt(id, session.email);
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
    await publishALevelQuiz(id);
    const quiz = await getALevelQuizById(id);
    if (quiz) {
      await createNotification({
        type: "quiz",
        title: `New quiz: ${quiz.title}`,
        link: `/a-level/portal/quizzes?subject=${quiz.subject}`,
        program: "a-level",
        subject: quiz.subject,
      }).catch(console.error);
    }
    return NextResponse.json({ ok: true });
  }
  if (body.action === "unpublish") { await unpublishALevelQuiz(id); return NextResponse.json({ ok: true }); }
  if (body.questions !== undefined) { await setALevelQuizQuestions(id, body.questions); return NextResponse.json({ ok: true }); }
  if (body.title !== undefined) {
    await updateALevelQuizMeta(id, body.title, body.description ?? "", body.time_limit_minutes ?? 0);
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
  await deleteALevelQuiz(id);
  return NextResponse.json({ ok: true });
}
