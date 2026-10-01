import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getRecordingById, updateRecording, publishRecording, unpublishRecording, deleteRecording } from "@/lib/amnaShamimaRecordings";
import { createNotification } from "@/lib/notifications";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  if (body.action === "publish") {
    await publishRecording(id);
    const recording = await getRecordingById(id);
    if (recording) {
      // Reuses the "lecture" notification type rather than widening
      // NotificationType again — a recording is recorded-lecture content
      // from the student's point of view.
      await createNotification({
        type: "lecture",
        title: `New recording: ${recording.title}`,
        link: "/amna-shamima/portal/recordings",
        program: "amna-shamima",
      }).catch(console.error);
    }
    return NextResponse.json({ ok: true });
  }
  if (body.action === "unpublish") {
    await unpublishRecording(id);
    return NextResponse.json({ ok: true });
  }
  if (typeof body.title === "string") {
    if (!body.zoom_link?.trim()) {
      return NextResponse.json({ error: "Zoom link is required" }, { status: 400 });
    }
    await updateRecording(id, {
      title: body.title,
      description: body.description ?? "",
      zoom_link: body.zoom_link,
      passcode: body.passcode ?? "",
    });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteRecording(id);
  return NextResponse.json({ ok: true });
}
