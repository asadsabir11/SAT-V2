import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllAmnaShamimaLectures, createAmnaShamimaLecture } from "@/lib/amnaShamimaLectures";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const lectures = await getAllAmnaShamimaLectures();
  return NextResponse.json({ lectures });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title, description, video_url, thumbnail_url } = await req.json();
  if (!title?.trim() || !video_url?.trim()) {
    return NextResponse.json({ error: "Title and video are required" }, { status: 400 });
  }
  const id = await createAmnaShamimaLecture(title.trim(), description?.trim() ?? "", video_url.trim(), thumbnail_url?.trim() ?? "", session.email);
  return NextResponse.json({ id });
}
