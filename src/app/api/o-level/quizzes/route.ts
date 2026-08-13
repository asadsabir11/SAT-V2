import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllQuizzes, getPublishedQuizzesBySubject, createQuiz } from "@/lib/olevel-quiz";
import { OLEVEL_LECTURE_CATEGORIES, type OLevelLectureCategory } from "@/lib/lectures";
import { getOLevelSubjectAccess } from "@/lib/olevelAccess";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subjectParam = req.nextUrl.searchParams.get("subject");

  if (session.role === "founder") {
    const quizzes = await getAllQuizzes();
    return NextResponse.json({ quizzes });
  }

  if (session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!subjectParam || !OLEVEL_LECTURE_CATEGORIES.includes(subjectParam as OLevelLectureCategory)) {
    return NextResponse.json({ error: "subject is required" }, { status: 400 });
  }
  const subject = subjectParam as OLevelLectureCategory;
  const access = await getOLevelSubjectAccess(session.email, subject);
  if (access !== "unlocked") {
    return NextResponse.json({ quizzes: [], access });
  }
  const quizzes = await getPublishedQuizzesBySubject(subject);
  return NextResponse.json({ quizzes, access });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { subject, title, description } = await req.json();
  if (!title || !subject || !OLEVEL_LECTURE_CATEGORIES.includes(subject)) {
    return NextResponse.json({ error: "subject and title are required" }, { status: 400 });
  }
  const id = await createQuiz(subject, title, description ?? "", session.email);
  return NextResponse.json({ id });
}
