import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllRecordings, createRecording } from "@/lib/amnaShamimaRecordings";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const recordings = await getAllRecordings();
  return NextResponse.json({ recordings });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title, description, zoom_link, passcode } = await req.json();
  if (!title?.trim() || !zoom_link?.trim()) {
    return NextResponse.json({ error: "Title and Zoom link are required" }, { status: 400 });
  }
  const id = await createRecording({
    title: title.trim(),
    description: description?.trim() ?? "",
    zoom_link: zoom_link.trim(),
    passcode: passcode?.trim() ?? "",
    created_by: session.email,
  });
  return NextResponse.json({ id });
}
