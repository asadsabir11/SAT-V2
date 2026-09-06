import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllAmnaShamimaSessions, createAmnaShamimaSession } from "@/lib/amnaShamimaSessions";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sessions = await getAllAmnaShamimaSessions();
  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (!body.title?.trim() || !body.meeting_link?.trim() || !body.scheduled_at) {
    return NextResponse.json({ error: "Title, meeting link, and date/time are required" }, { status: 400 });
  }
  const id = await createAmnaShamimaSession({
    title: body.title.trim(),
    description: body.description?.trim() ?? "",
    meeting_link: body.meeting_link.trim(),
    platform: body.platform ?? "zoom",
    scheduled_at: body.scheduled_at,
    is_active: body.is_active ?? true,
    created_by: session.email,
  });
  return NextResponse.json({ id });
}
