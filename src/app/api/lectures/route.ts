import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllLectures, getPublishedLectures, createLecture } from "@/lib/lectures";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lectures = session.role === "founder"
    ? await getAllLectures()
    : await getPublishedLectures();

  return NextResponse.json({ lectures });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title, description, video_url } = await req.json();
  if (!title || !video_url) {
    return NextResponse.json({ error: "title and video_url are required" }, { status: 400 });
  }
  const id = await createLecture(title, description ?? "", video_url, session.email);
  return NextResponse.json({ id });
}
