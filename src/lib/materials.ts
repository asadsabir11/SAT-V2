import { sql } from "@/lib/db";

let tablesReady = false;
export async function ensureMaterialsTables() {
  if (tablesReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS study_materials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT DEFAULT 'in_preparation',
      url TEXT DEFAULT '',
      pdf_url TEXT DEFAULT '',
      order_index INTEGER DEFAULT 0,
      is_published BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS material_completions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      material_id UUID NOT NULL,
      student_id TEXT NOT NULL,
      completed_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(material_id, student_id)
    )
  `;
  tablesReady = true;
}
