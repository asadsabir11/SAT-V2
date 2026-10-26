import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllALevelSessions, createALevelSession } from "@/lib/aLevelSessions";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sessions = await getAllALevelSessions();
  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title, description, meeting_link, platform, scheduled_at } = await req.json();
  if (!title?.trim() || !meeting_link?.trim() || !scheduled_at) {
    return NextResponse.json({ error: "Title, meeting link, and scheduled time are required" }, { status: 400 });
  }
  const id = await createALevelSession({
    title: title.trim(),
    description: description?.trim() ?? "",
    meeting_link: meeting_link.trim(),
    platform: platform ?? "zoom",
    scheduled_at,
    created_by: session.email,
  });
  return NextResponse.json({ id });
}
