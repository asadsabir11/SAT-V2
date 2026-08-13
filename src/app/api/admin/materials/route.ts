import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ensureMaterialsTables } from "@/lib/materials";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureMaterialsTables();
  const materials = await sql`SELECT * FROM study_materials ORDER BY order_index, created_at`;
  return NextResponse.json({ materials });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureMaterialsTables();
  const { title, description, status, url, pdf_url, order_index } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });
  const [material] = await sql`
    INSERT INTO study_materials (title, description, status, url, pdf_url, order_index)
    VALUES (${title.trim()}, ${description ?? ""}, ${status ?? "in_preparation"}, ${url ?? ""}, ${pdf_url ?? ""}, ${order_index ?? 0})
    RETURNING *
  `;
  return NextResponse.json({ material });
}
