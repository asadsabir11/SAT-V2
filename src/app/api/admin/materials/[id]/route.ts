import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ensureMaterialsTables } from "@/lib/materials";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureMaterialsTables();
  const { id } = await params;
  const { title, description, status, url, pdf_url, order_index, is_published } = await req.json();
  const [material] = await sql`
    UPDATE study_materials
    SET title = ${title}, description = ${description ?? ""}, status = ${status ?? "in_preparation"},
        url = ${url ?? ""}, pdf_url = ${pdf_url ?? ""}, order_index = ${order_index ?? 0}, is_published = ${is_published ?? true}
    WHERE id = ${id} RETURNING *
  `;
  return NextResponse.json({ material });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder" && session.role !== "teacher") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureMaterialsTables();
  const { id } = await params;
  await sql`DELETE FROM study_materials WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
