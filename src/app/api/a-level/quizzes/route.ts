import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllALevelQuizzes, getPublishedALevelQuizzesBySubject, createALevelQuiz } from "@/lib/aLevelQuiz";
import { getALevelSubjectAccess } from "@/lib/aLevelAccess";
import { ALEVEL_LECTURE_CATEGORIES, type ALevelLectureCategory } from "@/lib/lectures";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.role === "founder" || session.role === "teacher") {
    const quizzes = await getAllALevelQuizzes();
    return NextResponse.json({ quizzes });
  }

  if (session.role !== "student" || session.program !== "a-level") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subjectParam = req.nextUrl.searchParams.get("subject");
  if (!subjectParam || !ALEVEL_LECTURE_CATEGORIES.includes(subjectParam as ALevelLectureCategory)) {
    return NextResponse.json({ error: "subject is required" }, { status: 400 });
  }
  const subject = subjectParam as ALevelLectureCategory;
  const access = await getALevelSubjectAccess(session.email, subject);
  if (access !== "unlocked") {
    return NextResponse.json({ quizzes: [], access });
  }
  const quizzes = await getPublishedALevelQuizzesBySubject(subject);
  return NextResponse.json({ quizzes, access });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { subject, title, description } = await req.json();
  if (!title || !subject || !ALEVEL_LECTURE_CATEGORIES.includes(subject)) {
    return NextResponse.json({ error: "subject and title are required" }, { status: 400 });
  }
  const id = await createALevelQuiz(subject, title, description ?? "", session.email);
  return NextResponse.json({ id });
}
