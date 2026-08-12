import { sql } from "@/lib/db";
import type { OLevelLectureCategory } from "@/lib/lectures";

export type PaperType = "question_paper" | "mark_scheme" | "examiner_report" | "other";

export type PastPaper = {
  id: string;
  subject: OLevelLectureCategory;
  title: string;
  description: string;
  session: string;
  paper_type: PaperType;
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
    CREATE TABLE IF NOT EXISTS past_papers (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
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

export async function getAllPapers(): Promise<PastPaper[]> {
  await ensureTable();
  const rows = await sql`SELECT * FROM past_papers ORDER BY order_index ASC, created_at DESC`;
  return rows as PastPaper[];
}

export async function getPublishedPapersBySubject(subject: OLevelLectureCategory): Promise<PastPaper[]> {
  await ensureTable();
  const rows = await sql`
    SELECT * FROM past_papers WHERE is_published = true AND subject = ${subject}
    ORDER BY order_index ASC, created_at DESC
  `;
  return rows as PastPaper[];
}

export async function getPaperById(id: string): Promise<PastPaper | null> {
  await ensureTable();
  const rows = await sql`SELECT * FROM past_papers WHERE id = ${id} LIMIT 1`;
  return (rows[0] as PastPaper) ?? null;
}

export async function createPaper(data: {
  subject: OLevelLectureCategory;
  title: string;
  description: string;
  session: string;
  paper_type: PaperType;
  file_url: string;
  file_name: string;
  created_by: string;
}): Promise<string> {
  await ensureTable();
  const id = crypto.randomUUID();
  const maxRow = await sql`SELECT COALESCE(MAX(order_index), 0) AS m FROM past_papers`;
  const nextOrder = (maxRow[0].m as number) + 1;
  await sql`
    INSERT INTO past_papers (id, subject, title, description, session, paper_type, file_url, file_name, order_index, created_by)
    VALUES (${id}, ${data.subject}, ${data.title}, ${data.description}, ${data.session}, ${data.paper_type}, ${data.file_url}, ${data.file_name}, ${nextOrder}, ${data.created_by})
  `;
  return id;
}

export async function updatePaper(id: string, data: Partial<Pick<PastPaper, "title" | "description" | "session" | "paper_type">>) {
  await ensureTable();
  await sql`
    UPDATE past_papers SET
      title = COALESCE(${data.title ?? null}, title),
      description = COALESCE(${data.description ?? null}, description),
      session = COALESCE(${data.session ?? null}, session),
      paper_type = COALESCE(${data.paper_type ?? null}, paper_type),
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function publishPaper(id: string) {
  await ensureTable();
  await sql`UPDATE past_papers SET is_published = true, updated_at = NOW() WHERE id = ${id}`;
}

export async function unpublishPaper(id: string) {
  await ensureTable();
  await sql`UPDATE past_papers SET is_published = false, updated_at = NOW() WHERE id = ${id}`;
}

export async function deletePaper(id: string) {
  await ensureTable();
  await sql`DELETE FROM past_papers WHERE id = ${id}`;
}
