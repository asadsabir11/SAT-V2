import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllPapers, getPublishedPapersBySubject, createPaper, type PaperType } from "@/lib/past-papers";
import { OLEVEL_LECTURE_CATEGORIES, type OLevelLectureCategory } from "@/lib/lectures";
import { getOLevelSubjectAccess } from "@/lib/olevelAccess";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if ((session.role === "founder" || session.role === "teacher")) {
    const papers = await getAllPapers();
    return NextResponse.json({ papers });
  }

  if (session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subjectParam = req.nextUrl.searchParams.get("subject");
  if (!subjectParam || !OLEVEL_LECTURE_CATEGORIES.includes(subjectParam as OLevelLectureCategory)) {
    return NextResponse.json({ error: "subject is required" }, { status: 400 });
  }
  const subject = subjectParam as OLevelLectureCategory;
  const access = await getOLevelSubjectAccess(session.email, subject);
  if (access !== "unlocked") {
    return NextResponse.json({ papers: [], access });
  }
  const papers = await getPublishedPapersBySubject(subject);
  return NextResponse.json({ papers, access });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { subject, title, description, session: examSession, paper_type, file_url, file_name } = await req.json();
  if (!subject || !OLEVEL_LECTURE_CATEGORIES.includes(subject) || !title || !file_url) {
    return NextResponse.json({ error: "subject, title and file_url are required" }, { status: 400 });
  }
  const type: PaperType = ["question_paper", "mark_scheme", "examiner_report", "other"].includes(paper_type) ? paper_type : "question_paper";
  const id = await createPaper({
    subject, title, description: description ?? "", session: examSession ?? "",
    paper_type: type, file_url, file_name: file_name ?? "", created_by: session.email,
  });
  return NextResponse.json({ id });
}
