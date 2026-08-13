import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ensureMaterialsTables } from "@/lib/materials";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureMaterialsTables();
  const { id } = await params;
  await sql`
    INSERT INTO material_completions (material_id, student_id)
    VALUES (${id}, ${String(session.id)})
    ON CONFLICT (material_id, student_id) DO NOTHING
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureMaterialsTables();
  const { id } = await params;
  await sql`DELETE FROM material_completions WHERE material_id = ${id} AND student_id = ${String(session.id)}`;
  return NextResponse.json({ ok: true });
}
