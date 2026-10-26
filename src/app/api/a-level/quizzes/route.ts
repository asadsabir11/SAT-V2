import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllALevelQuizzes, getPublishedALevelQuizzes, createALevelQuiz } from "@/lib/aLevelQuiz";
import { getALevelAccessLevel } from "@/lib/aLevelAccess";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.role === "founder" || session.role === "teacher") {
    const quizzes = await getAllALevelQuizzes();
    return NextResponse.json({ quizzes });
  }

  if (session.role !== "student" || session.program !== "a-level") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Flat access, not per-subject — matches A-Level's single flat fee.
  const access = await getALevelAccessLevel(session.email);
  if (access !== "unlocked") {
    return NextResponse.json({ quizzes: [], access });
  }
  const quizzes = await getPublishedALevelQuizzes();
  return NextResponse.json({ quizzes, access });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title, description } = await req.json();
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  const id = await createALevelQuiz(title, description ?? "", session.email);
  return NextResponse.json({ id });
}
