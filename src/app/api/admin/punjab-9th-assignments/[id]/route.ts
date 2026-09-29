import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAssignmentById, updateAssignment, publishAssignment, unpublishAssignment, deleteAssignment } from "@/lib/punjab9thAssignments";
import { createNotification } from "@/lib/notifications";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || (session.role !== "founder" && session.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const assignment = await getAssignmentById(id);
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
    await publishAssignment(id);
    const assignment = await getAssignmentById(id);
    if (assignment) {
      const due = assignment.due_at ? new Date(assignment.due_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : null;
      await createNotification({
        type: "assignment",
        title: `New assignment: ${assignment.title}`,
        body: due ? `Due ${due}` : null,
        link: `/punjab-board-9th-class/portal/${assignment.category}/assignments/${id}`,
        program: "punjab-9th",
        subject: assignment.category,
      }).catch(console.error);
    }
    return NextResponse.json({ ok: true });
  }
  if (body.action === "unpublish") {
    await unpublishAssignment(id);
    return NextResponse.json({ ok: true });
  }
  if (typeof body.title === "string") {
    if (!body.category) {
      return NextResponse.json({ error: "A valid subject is required" }, { status: 400 });
    }
    await updateAssignment(id, {
      title: body.title,
      description: body.description ?? "",
      category: body.category,
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
  await deleteAssignment(id);
  return NextResponse.json({ ok: true });
}
