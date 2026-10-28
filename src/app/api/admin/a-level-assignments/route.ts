import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllALevelAssignments, createALevelAssignment } from "@/lib/aLevelAssignments";
import { ALEVEL_LECTURE_CATEGORIES, type ALevelLectureCategory } from "@/lib/lectures";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const assignments = await getAllALevelAssignments();
  return NextResponse.json({ assignments });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { subject, title, description, attachment_url, due_at, max_marks } = await req.json();
  if (!subject || !ALEVEL_LECTURE_CATEGORIES.includes(subject as ALevelLectureCategory) || !title?.trim()) {
    return NextResponse.json({ error: "Subject and title are required" }, { status: 400 });
  }
  const id = await createALevelAssignment({
    title: title.trim(),
    description: description?.trim() ?? "",
    attachment_url: attachment_url?.trim() ?? "",
    category: subject,
    due_at: due_at || null,
    max_marks: typeof max_marks === "number" && max_marks > 0 ? max_marks : null,
    created_by: session.email,
  });
  return NextResponse.json({ id });
}
