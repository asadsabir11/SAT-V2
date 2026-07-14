import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getBankQuestions, addBankQuestion } from "@/lib/questionBank";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const questions = await getBankQuestions();
  return NextResponse.json({ questions });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { section, topic, passage, text, options, correct, explanation } = body;
  if (!section || !topic || !text || !options || correct === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const id = await addBankQuestion({
    section, topic, passage: passage ?? "", text, options, correct,
    explanation: explanation ?? "", created_by: session.email,
  });
  return NextResponse.json({ id });
}
