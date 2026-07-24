import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  createAssignment, listAssignments, deleteAssignment,
  getAllStudentsHomework, upsertHomework
} from "@/lib/parent-system";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.POSTGRES_URL!);

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const weekNo = new URL(req.url).searchParams.get("week");
  const [assignments, students] = await Promise.all([
    listAssignments(weekNo ? Number(weekNo) : undefined),
    sql`SELECT id, name FROM users WHERE role = 'student' ORDER BY name`,
  ]);

  const submissions = weekNo
    ? await getAllStudentsHomework(Number(weekNo))
    : [];

  return NextResponse.json({ assignments, students, submissions });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Create assignment
  if (body.action === "create") {
    const { weekNo, title, dueAt } = body;
    if (!weekNo || !title) return NextResponse.json({ error: "weekNo and title required" }, { status: 400 });
    const id = await createAssignment(Number(weekNo), title, dueAt);
    return NextResponse.json({ ok: true, id });
  }

  // Mark submission
  if (body.action === "mark") {
    const { studentId, assignmentId, status } = body;
    if (!studentId || !assignmentId || !status) return NextResponse.json({ error: "studentId, assignmentId, status required" }, { status: 400 });
    await upsertHomework(studentId, assignmentId, status);
    return NextResponse.json({ ok: true });
  }

  // Delete assignment
  if (body.action === "delete") {
    await deleteAssignment(body.id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
