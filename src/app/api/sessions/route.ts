import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllSessions, getActiveSessions, createSession } from "@/lib/sessions";
import { getStudentAccessLevel } from "@/lib/users";
import { getOLevelSubjectAccess } from "@/lib/olevelAccess";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const programParam = req.nextUrl.searchParams.get("program");

  if (programParam === "o-level") {
    if (session.role === "founder") {
      const sessions = (await getAllSessions()).filter((s) => s.program === "o-level");
      return NextResponse.json({ sessions, access_level: "unlocked" });
    }
    if (session.role !== "student") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const subjectParam = req.nextUrl.searchParams.get("subject");
    // Sessions without a subject (general announcements) stay open to any enrolled student.
    const access = subjectParam ? await getOLevelSubjectAccess(session.email, subjectParam) : "unlocked";
    if (access !== "unlocked") {
      return NextResponse.json({ sessions: [], access_level: access, locked: true });
    }
    const sessions = (await getActiveSessions()).filter((s) => s.program === "o-level" && (!subjectParam || !s.subject || s.subject === subjectParam));
    return NextResponse.json({ sessions, access_level: "unlocked", locked: false });
  }

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
  const { title, description, meeting_link, platform, scheduled_at, is_active, program, subject } = body;
  if (!title || !meeting_link || !scheduled_at) {
    return NextResponse.json({ error: "title, meeting_link and scheduled_at are required" }, { status: 400 });
  }
  const id = await createSession({
    title, description: description ?? "", meeting_link, platform: platform ?? "zoom",
    scheduled_at, is_active: is_active ?? true,
    program: program === "o-level" ? "o-level" : "sat",
    subject: program === "o-level" ? (subject ?? null) : null,
    created_by: session.email,
  });
  return NextResponse.json({ id });
}
