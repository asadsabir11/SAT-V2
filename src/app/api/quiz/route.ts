import { NextRequest, NextResponse } from "next/server";
import { getAllQuizzes, createQuiz } from "@/lib/quiz";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const quizzes = await getAllQuizzes();
  return NextResponse.json({ quizzes });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title, description } = await request.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  const id = await createQuiz(title.trim(), description?.trim() ?? "", session.name);
  return NextResponse.json({ id });
}
