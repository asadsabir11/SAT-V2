import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAnnouncements, createAnnouncement } from "@/lib/announcements";
import { getUserProgram } from "@/lib/users";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Students only see their own program's announcements (plus legacy/general
  // ones with no program set). Founders/teachers managing the admin page see
  // everything, unfiltered.
  if (session.role === "student") {
    const program = session.program ?? await getUserProgram(session.email);
    const announcements = await getAnnouncements(program);
    return NextResponse.json({ announcements });
  }

  const announcements = await getAnnouncements();
  return NextResponse.json({ announcements });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title, body, program } = await req.json();
  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
  }
  if (program !== "sat" && program !== "o-level") {
    return NextResponse.json({ error: "A valid program (SAT or O Level) is required" }, { status: 400 });
  }
  const id = await createAnnouncement({ title: title.trim(), body: body.trim(), created_by: session.email, program });
  return NextResponse.json({ id });
}
