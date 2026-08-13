import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ensureSatQuizTables } from "@/lib/satQuizzes";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSatQuizTables();
  const { id } = await params;
  const [quiz] = await sql`UPDATE quiz_sets SET is_published = NOT is_published WHERE id = ${id} RETURNING *`;
  return NextResponse.json({ quiz });
}
