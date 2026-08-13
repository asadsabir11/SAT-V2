import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ensureMaterialsTables } from "@/lib/materials";

export async function GET() {
  await ensureMaterialsTables();
  const session = await getSession();
  const materials = await sql`
    SELECT * FROM study_materials WHERE is_published = TRUE ORDER BY order_index, created_at
  `;

  // Attach completion status for logged-in students
  if (session) {
    const completions = await sql`
      SELECT material_id FROM material_completions WHERE student_id = ${String(session.id)}
    `;
    const completedIds = new Set(completions.map(c => String(c.material_id)));
    return NextResponse.json({
      materials: materials.map(m => ({ ...m, is_completed: completedIds.has(String(m.id)) })),
    });
  }

  return NextResponse.json({ materials: materials.map(m => ({ ...m, is_completed: false })) });
}
