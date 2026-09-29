import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllAssignments, createAssignment } from "@/lib/amnaShamimaAssignments";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const assignments = await getAllAssignments();
  return NextResponse.json({ assignments });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title, description, attachment_url, due_at, max_marks } = await req.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  const id = await createAssignment({
    title: title.trim(),
    description: description?.trim() ?? "",
    attachment_url: attachment_url?.trim() ?? "",
    due_at: due_at || null,
    max_marks: typeof max_marks === "number" && max_marks > 0 ? max_marks : null,
    created_by: session.email,
  });
  return NextResponse.json({ id });
}
