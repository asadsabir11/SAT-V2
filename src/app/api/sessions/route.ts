import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllSessions, getActiveSessions, createSession } from "@/lib/sessions";
import { getStudentAccessLevel } from "@/lib/users";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.role === "founder") {
    const sessions = await getAllSessions();
    return NextResponse.json({ sessions, access_level: "unlocked" });
  }

  const accessLevel = await getStudentAccessLevel(session.email);
  if (accessLevel !== "unlocked") {
    return NextResponse.json({ sessions: [], access_level: accessLevel, locked: true });
  }

  const sessions = await getActiveSessions();
  return NextResponse.json({ sessions, access_level: accessLevel });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { title, description, meeting_link, platform, scheduled_at, is_active } = body;
  if (!title || !meeting_link || !scheduled_at) {
    return NextResponse.json({ error: "title, meeting_link and scheduled_at are required" }, { status: 400 });
  }
  const id = await createSession({
    title, description: description ?? "", meeting_link, platform: platform ?? "zoom",
    scheduled_at, is_active: is_active ?? true, created_by: session.email,
  });
  return NextResponse.json({ id });
}
