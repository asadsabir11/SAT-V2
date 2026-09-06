import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllPunjab9thQuizzes, getPublishedPunjab9thQuizzesBySubject, createPunjab9thQuiz } from "@/lib/punjab9thQuiz";
import { PUNJAB_9TH_SUBJECTS } from "@/lib/punjab9thSessions";
import { getPunjab9thAccessLevel } from "@/lib/punjab9thAccess";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subjectParam = req.nextUrl.searchParams.get("subject");

  if (session.role === "founder" || session.role === "teacher") {
    const quizzes = await getAllPunjab9thQuizzes();
    return NextResponse.json({ quizzes });
  }

  if (session.role !== "student" || session.program !== "punjab-9th") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!subjectParam || !(PUNJAB_9TH_SUBJECTS as readonly string[]).includes(subjectParam)) {
    return NextResponse.json({ error: "subject is required" }, { status: 400 });
  }

  // Flat access, not per-subject — the whole account is unlocked or not,
  // matching the flat PKR 2,500/mo pricing (see punjab9thAccess.ts).
  const access = await getPunjab9thAccessLevel(session.email);
  if (access !== "unlocked") {
    return NextResponse.json({ quizzes: [], access });
  }
  const quizzes = await getPublishedPunjab9thQuizzesBySubject(subjectParam);
  return NextResponse.json({ quizzes, access });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { subject, title, description } = await req.json();
  if (!title || !subject || !(PUNJAB_9TH_SUBJECTS as readonly string[]).includes(subject)) {
    return NextResponse.json({ error: "subject and title are required" }, { status: 400 });
  }
  const id = await createPunjab9thQuiz(subject, title, description ?? "", session.email);
  return NextResponse.json({ id });
}
