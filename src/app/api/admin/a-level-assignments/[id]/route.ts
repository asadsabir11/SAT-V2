import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getALevelAssignmentById, updateALevelAssignment, publishALevelAssignment, unpublishALevelAssignment, deleteALevelAssignment } from "@/lib/aLevelAssignments";
import { createNotification } from "@/lib/notifications";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const assignment = await getALevelAssignmentById(id);
  if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ assignment });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  if (body.action === "publish") {
    await publishALevelAssignment(id);
    const assignment = await getALevelAssignmentById(id);
    if (assignment) {
      const due = assignment.due_at ? new Date(assignment.due_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : null;
      await createNotification({
        type: "assignment",
        title: `New assignment: ${assignment.title}`,
        body: due ? `Due ${due}` : null,
        link: `/a-level/portal/assignments/${id}`,
        program: "a-level",
      }).catch(console.error);
    }
    return NextResponse.json({ ok: true });
  }
  if (body.action === "unpublish") {
    await unpublishALevelAssignment(id);
    return NextResponse.json({ ok: true });
  }
  if (typeof body.title === "string") {
    await updateALevelAssignment(id, {
      title: body.title,
      description: body.description ?? "",
      due_at: body.due_at || null,
      max_marks: typeof body.max_marks === "number" && body.max_marks > 0 ? body.max_marks : null,
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
  await deleteALevelAssignment(id);
  return NextResponse.json({ ok: true });
}
