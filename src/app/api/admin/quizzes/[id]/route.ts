import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ensureSatQuizTables } from "@/lib/satQuizzes";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSatQuizTables();
  const { id } = await params;
  const [quiz] = await sql`SELECT * FROM quiz_sets WHERE id = ${id}`;
  if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const questions = await sql`SELECT * FROM quiz_set_questions WHERE quiz_id = ${id} ORDER BY order_index, created_at`;
  const attempts = await sql`
    SELECT a.id, a.student_name, a.score, a.total, a.completed_at,
      u.name AS user_name
    FROM quiz_set_attempts a
    LEFT JOIN users u ON u.id::text = a.student_id::text
    WHERE a.quiz_id = ${id} AND a.completed_at IS NOT NULL
    ORDER BY a.completed_at DESC
  `;
  return NextResponse.json({ quiz, questions, attempts });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSatQuizTables();
  const { id } = await params;
  const { title, description, subject, category, time_limit_minutes } = await req.json();
  const [quiz] = await sql`
    UPDATE quiz_sets
    SET title = ${title}, description = ${description ?? ""}, subject = ${subject ?? "general"},
        category = ${category ?? "math"}, time_limit_minutes = ${time_limit_minutes ?? null}
    WHERE id = ${id} RETURNING *
  `;
  return NextResponse.json({ quiz });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSatQuizTables();
  const { id } = await params;
  await sql`DELETE FROM quiz_sets WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
