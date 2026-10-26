import { sql } from "@/lib/db";

// Mirrors past-papers.ts, without a `subject` field — A-Level has exactly
// one subject (Computer Science), so a subject column would be redundant.
// Own table, isolated from O-Level's past_papers.

export type ALevelPaperType = "question_paper" | "mark_scheme" | "examiner_report" | "other";

export type ALevelPastPaper = {
  id: string;
  title: string;
  description: string;
  session: string;
  paper_type: ALevelPaperType;
  file_url: string;
  file_name: string;
  is_published: boolean;
  order_index: number;
  created_by: string;
  created_at: string;
  updated_at: string;
};

let ready = false;
async function ensureTable() {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS a_level_past_papers (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      session TEXT DEFAULT '',
      paper_type TEXT NOT NULL DEFAULT 'question_paper',
      file_url TEXT NOT NULL,
      file_name TEXT DEFAULT '',
      is_published BOOLEAN DEFAULT false,
      order_index INTEGER DEFAULT 0,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  ready = true;
}

export async function getAllALevelPapers(): Promise<ALevelPastPaper[]> {
  await ensureTable();
  const rows = await sql`SELECT * FROM a_level_past_papers ORDER BY order_index ASC, created_at DESC`;
  return rows as ALevelPastPaper[];
}

export async function getPublishedALevelPapers(): Promise<ALevelPastPaper[]> {
  await ensureTable();
  const rows = await sql`SELECT * FROM a_level_past_papers WHERE is_published = true ORDER BY order_index ASC, created_at DESC`;
  return rows as ALevelPastPaper[];
}

export async function getALevelPaperById(id: string): Promise<ALevelPastPaper | null> {
  await ensureTable();
  const rows = await sql`SELECT * FROM a_level_past_papers WHERE id = ${id} LIMIT 1`;
  return (rows[0] as ALevelPastPaper) ?? null;
}

export async function createALevelPaper(data: {
  title: string;
  description: string;
  session: string;
  paper_type: ALevelPaperType;
  file_url: string;
  file_name: string;
  created_by: string;
}): Promise<string> {
  await ensureTable();
  const id = crypto.randomUUID();
  const maxRow = await sql`SELECT COALESCE(MAX(order_index), 0) AS m FROM a_level_past_papers`;
  const nextOrder = (maxRow[0].m as number) + 1;
  await sql`
    INSERT INTO a_level_past_papers (id, title, description, session, paper_type, file_url, file_name, order_index, created_by)
    VALUES (${id}, ${data.title}, ${data.description}, ${data.session}, ${data.paper_type}, ${data.file_url}, ${data.file_name}, ${nextOrder}, ${data.created_by})
  `;
  return id;
}

export async function updateALevelPaper(id: string, data: Partial<Pick<ALevelPastPaper, "title" | "description" | "session" | "paper_type">>) {
  await ensureTable();
  await sql`
    UPDATE a_level_past_papers SET
      title = COALESCE(${data.title ?? null}, title),
      description = COALESCE(${data.description ?? null}, description),
      session = COALESCE(${data.session ?? null}, session),
      paper_type = COALESCE(${data.paper_type ?? null}, paper_type),
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function publishALevelPaper(id: string) {
  await ensureTable();
  await sql`UPDATE a_level_past_papers SET is_published = true, updated_at = NOW() WHERE id = ${id}`;
}

export async function unpublishALevelPaper(id: string) {
  await ensureTable();
  await sql`UPDATE a_level_past_papers SET is_published = false, updated_at = NOW() WHERE id = ${id}`;
}

export async function deleteALevelPaper(id: string) {
  await ensureTable();
  await sql`DELETE FROM a_level_past_papers WHERE id = ${id}`;
}
