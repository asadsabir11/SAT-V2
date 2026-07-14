import { NextRequest, NextResponse } from "next/server";
import { getQuizById, updateQuizMeta, setQuizQuestions, activateQuiz, deactivateQuiz, deleteQuiz } from "@/lib/quiz";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const quiz = await getQuizById(id);
  if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ quiz });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();

  if (body.action === "activate") { await activateQuiz(id); return NextResponse.json({ ok: true }); }
  if (body.action === "deactivate") { await deactivateQuiz(id); return NextResponse.json({ ok: true }); }
  if (body.questions !== undefined) { await setQuizQuestions(id, body.questions); return NextResponse.json({ ok: true }); }
  if (body.title !== undefined) { await updateQuizMeta(id, body.title, body.description ?? "", body.time_limit_minutes ?? 0); return NextResponse.json({ ok: true }); }

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
