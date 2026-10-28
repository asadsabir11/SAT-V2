import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllALevelPapers, createALevelPaper } from "@/lib/aLevelPastPapers";
import { ALEVEL_LECTURE_CATEGORIES, type ALevelLectureCategory } from "@/lib/lectures";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const papers = await getAllALevelPapers();
  return NextResponse.json({ papers });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { subject, title, description, session: examSession, paper_type, file_url, file_name } = await req.json();
  if (!subject || !ALEVEL_LECTURE_CATEGORIES.includes(subject as ALevelLectureCategory) || !title?.trim() || !file_url?.trim()) {
    return NextResponse.json({ error: "Subject, title and file are required" }, { status: 400 });
  }
  const id = await createALevelPaper({
    subject,
    title: title.trim(),
    description: description?.trim() ?? "",
    session: examSession?.trim() ?? "",
    paper_type: paper_type ?? "question_paper",
    file_url: file_url.trim(),
    file_name: file_name?.trim() ?? "",
    created_by: session.email,
  });
  return NextResponse.json({ id });
}
