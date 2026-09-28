import { sql } from "@/lib/db";

// Mirrors amnaShamimaLectures.ts's shape/isolation rationale — its own
// minimal table rather than reusing SAT's study_materials (which has no
// program column at all and is wired into that program's completion-tracking
// UI). PDFs/images have no "watch progress" concept, so this is just a flat
// published/draft file list — title, description, and the uploaded file URL.

export interface AmnaShamimaMaterial {
  id: string;
  title: string;
  description: string;
  file_url: string;
  order_index: number;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

let ready = false;
async function ensureTable() {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS amna_shamima_materials (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      file_url TEXT NOT NULL,
      order_index INTEGER DEFAULT 0,
      is_published BOOLEAN DEFAULT false,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  ready = true;
}

export async function getAllAmnaShamimaMaterials(): Promise<AmnaShamimaMaterial[]> {
  await ensureTable();
  const rows = await sql`SELECT * FROM amna_shamima_materials ORDER BY order_index ASC, created_at ASC`;
  return rows as AmnaShamimaMaterial[];
}

export async function getPublishedAmnaShamimaMaterials(): Promise<AmnaShamimaMaterial[]> {
  await ensureTable();
  const rows = await sql`SELECT * FROM amna_shamima_materials WHERE is_published = true ORDER BY order_index ASC, created_at ASC`;
  return rows as AmnaShamimaMaterial[];
}

export async function createAmnaShamimaMaterial(title: string, description: string, fileUrl: string, createdBy: string): Promise<string> {
  await ensureTable();
  const id = crypto.randomUUID();
  const maxRow = await sql`SELECT COALESCE(MAX(order_index), 0) AS m FROM amna_shamima_materials`;
  const nextOrder = (maxRow[0].m as number) + 1;
  await sql`
    INSERT INTO amna_shamima_materials (id, title, description, file_url, order_index, created_by)
    VALUES (${id}, ${title}, ${description}, ${fileUrl}, ${nextOrder}, ${createdBy})
  `;
  return id;
}

export async function updateAmnaShamimaMaterial(id: string, title: string, description: string): Promise<void> {
  await ensureTable();
  await sql`UPDATE amna_shamima_materials SET title = ${title}, description = ${description}, updated_at = NOW() WHERE id = ${id}`;
}

export async function publishAmnaShamimaMaterial(id: string): Promise<void> {
  await ensureTable();
  await sql`UPDATE amna_shamima_materials SET is_published = true, updated_at = NOW() WHERE id = ${id}`;
}

export async function unpublishAmnaShamimaMaterial(id: string): Promise<void> {
  await ensureTable();
  await sql`UPDATE amna_shamima_materials SET is_published = false, updated_at = NOW() WHERE id = ${id}`;
}

export async function deleteAmnaShamimaMaterial(id: string): Promise<void> {
  await ensureTable();
  await sql`DELETE FROM amna_shamima_materials WHERE id = ${id}`;
}
