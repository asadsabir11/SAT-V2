import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAnnouncements, createAnnouncement } from "@/lib/announcements";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const announcements = await getAnnouncements();
  return NextResponse.json({ announcements });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title, body } = await req.json();
  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
  }
  const id = await createAnnouncement({ title: title.trim(), body: body.trim(), created_by: session.email });
  return NextResponse.json({ id });
}
