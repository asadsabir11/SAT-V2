import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllLectures, getPublishedLectures, createLecture } from "@/lib/lectures";
import { getStudentAccessLevel } from "@/lib/users";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.role === "founder") {
    const lectures = await getAllLectures();
    return NextResponse.json({ lectures, access_level: "unlocked" });
  }

  // Student: return all published lectures marked with is_locked
  const [lectures, accessLevel] = await Promise.all([
    getPublishedLectures(),
    getStudentAccessLevel(session.email),
  ]);

  const isUnlocked = accessLevel === "unlocked";
  const lecturesWithLock = lectures.map(({ video_url: _v, ...l }) => ({
    ...l,
    is_locked: l.category !== "introduction" && !isUnlocked && !l.is_free_preview,
  }));

  return NextResponse.json({ lectures: lecturesWithLock, access_level: accessLevel });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title, description, video_url, thumbnail_url, category } = await req.json();
  if (!title || !video_url) {
    return NextResponse.json({ error: "title and video_url are required" }, { status: 400 });
  }
  const cat = category === "english" ? "english" : category === "introduction" ? "introduction" : "math";
  const id = await createLecture(title, description ?? "", video_url, session.email, thumbnail_url ?? "", cat);
  return NextResponse.json({ id });
}
