import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateBankQuestion, deleteBankQuestion } from "@/lib/questionBank";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  if (!body.section || !body.topic || !body.text || !body.options || body.correct === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  await updateBankQuestion(id, { ...body, program: body.program === "o-level" ? "o-level" : "sat" });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteBankQuestion(id);
  return NextResponse.json({ ok: true });
}
