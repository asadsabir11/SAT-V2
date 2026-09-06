import { sql } from "@/lib/db";

// Fully isolated from lectures.ts — that file's LectureCategory is a strict
// per-subject enum used broadly across SAT/O-Level lecture and quiz-gating
// code. The Amna Shamima Foundation AI course has no subjects at all (one
// flat lecture list for the whole cohort), so rather than force it into
// that model this is its own table with its own minimal shape.

export interface AmnaShamimaLecture {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
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
    CREATE TABLE IF NOT EXISTS amna_shamima_lectures (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      video_url TEXT NOT NULL,
      thumbnail_url TEXT DEFAULT '',
      order_index INTEGER DEFAULT 0,
      is_published BOOLEAN DEFAULT false,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  ready = true;
}

export async function getAllAmnaShamimaLectures(): Promise<AmnaShamimaLecture[]> {
  await ensureTable();
  const rows = await sql`SELECT * FROM amna_shamima_lectures ORDER BY order_index ASC, created_at ASC`;
  return rows as AmnaShamimaLecture[];
}

export async function getPublishedAmnaShamimaLectures(): Promise<AmnaShamimaLecture[]> {
  await ensureTable();
  const rows = await sql`SELECT * FROM amna_shamima_lectures WHERE is_published = true ORDER BY order_index ASC, created_at ASC`;
  return rows as AmnaShamimaLecture[];
}

export async function getAmnaShamimaLectureById(id: string): Promise<AmnaShamimaLecture | null> {
  await ensureTable();
  const rows = await sql`SELECT * FROM amna_shamima_lectures WHERE id = ${id} LIMIT 1`;
  return (rows[0] as AmnaShamimaLecture) ?? null;
}

export async function createAmnaShamimaLecture(title: string, description: string, videoUrl: string, thumbnailUrl: string, createdBy: string): Promise<string> {
  await ensureTable();
  const id = crypto.randomUUID();
  const maxRow = await sql`SELECT COALESCE(MAX(order_index), 0) AS m FROM amna_shamima_lectures`;
  const nextOrder = (maxRow[0].m as number) + 1;
  await sql`
    INSERT INTO amna_shamima_lectures (id, title, description, video_url, thumbnail_url, order_index, created_by)
    VALUES (${id}, ${title}, ${description}, ${videoUrl}, ${thumbnailUrl}, ${nextOrder}, ${createdBy})
  `;
  return id;
}

export async function updateAmnaShamimaLecture(id: string, title: string, description: string): Promise<void> {
  await ensureTable();
  await sql`UPDATE amna_shamima_lectures SET title = ${title}, description = ${description}, updated_at = NOW() WHERE id = ${id}`;
}

export async function publishAmnaShamimaLecture(id: string): Promise<void> {
  await ensureTable();
  await sql`UPDATE amna_shamima_lectures SET is_published = true, updated_at = NOW() WHERE id = ${id}`;
}

export async function unpublishAmnaShamimaLecture(id: string): Promise<void> {
  await ensureTable();
  await sql`UPDATE amna_shamima_lectures SET is_published = false, updated_at = NOW() WHERE id = ${id}`;
}

export async function deleteAmnaShamimaLecture(id: string): Promise<void> {
  await ensureTable();
  await sql`DELETE FROM amna_shamima_lectures WHERE id = ${id}`;
}
