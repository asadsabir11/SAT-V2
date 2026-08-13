import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { requestOLevelAccess, getOLevelSubjectAccess } from "@/lib/olevelAccess";
import { OLEVEL_LECTURE_CATEGORIES, type OLevelLectureCategory } from "@/lib/lectures";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject } = await req.json();
  if (!subject || !OLEVEL_LECTURE_CATEGORIES.includes(subject)) {
    return NextResponse.json({ error: "A valid subject is required" }, { status: 400 });
  }
  const sub = subject as OLevelLectureCategory;

  const current = await getOLevelSubjectAccess(session.email, sub);
  if (current === "unlocked") {
    return NextResponse.json({ ok: true, status: "unlocked" });
  }
  if (current === "pending") {
    return NextResponse.json({ ok: true, status: "pending" });
  }

  await requestOLevelAccess(session.email, sub);
  return NextResponse.json({ ok: true, status: "pending" });
}
