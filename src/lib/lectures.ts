import { sql } from "@/lib/db";


export type Program = "sat" | "o-level";
export type SatLectureCategory = "introduction" | "math" | "english";
export type OLevelLectureCategory = "mathematics" | "computer-science" | "english-language" | "islamiyat" | "pakistan-studies";
export type LectureCategory = SatLectureCategory | OLevelLectureCategory;

export const OLEVEL_LECTURE_CATEGORIES: OLevelLectureCategory[] = [
  "mathematics", "computer-science", "english-language", "islamiyat", "pakistan-studies",
];

export type Lecture = {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  program: Program;
  category: LectureCategory;
  is_free_preview: boolean;
  order_index: number;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

let ready = false;
async function ensureTable() {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS lectures (
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
  await sql`ALTER TABLE lectures ADD COLUMN IF NOT EXISTS thumbnail_url TEXT DEFAULT ''`;
  await sql`ALTER TABLE lectures ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'math'`;
  await sql`ALTER TABLE lectures ADD COLUMN IF NOT EXISTS is_free_preview BOOLEAN DEFAULT false`;
  await sql`ALTER TABLE lectures ADD COLUMN IF NOT EXISTS program TEXT NOT NULL DEFAULT 'sat'`;
  ready = true;
}

export async function getAllLectures(): Promise<Lecture[]> {
  await ensureTable();
  const rows = await sql`SELECT * FROM lectures ORDER BY order_index ASC, created_at ASC`;
  return rows as Lecture[];
}

export async function getPublishedLectures(): Promise<Lecture[]> {
  await ensureTable();
  const rows = await sql`SELECT * FROM lectures WHERE is_published = true ORDER BY order_index ASC, created_at ASC`;
  return rows as Lecture[];
}

export async function getPublishedLecturesByProgram(program: Program): Promise<Lecture[]> {
  await ensureTable();
  const rows = await sql`SELECT * FROM lectures WHERE is_published = true AND program = ${program} ORDER BY order_index ASC, created_at ASC`;
  return rows as Lecture[];
}

export async function getLectureById(id: string): Promise<Lecture | null> {
  await ensureTable();
  const rows = await sql`SELECT * FROM lectures WHERE id = ${id} LIMIT 1`;
  return (rows[0] as Lecture) ?? null;
}

export async function createLecture(title: string, description: string, videoUrl: string, createdBy: string, thumbnailUrl = "", category: LectureCategory = "math", program: Program = "sat"): Promise<string> {
  await ensureTable();
  const id = crypto.randomUUID();
  const maxRow = await sql`SELECT COALESCE(MAX(order_index), 0) AS m FROM lectures`;
  const nextOrder = (maxRow[0].m as number) + 1;
  await sql`
    INSERT INTO lectures (id, title, description, video_url, thumbnail_url, category, program, order_index, created_by)
    VALUES (${id}, ${title}, ${description}, ${videoUrl}, ${thumbnailUrl}, ${category}, ${program}, ${nextOrder}, ${createdBy})
  `;
  return id;
}

export async function updateLecture(id: string, title: string, description: string, category?: string) {
  await ensureTable();
  if (category) {
    await sql`UPDATE lectures SET title=${title}, description=${description}, category=${category}, updated_at=NOW() WHERE id=${id}`;
  } else {
    await sql`UPDATE lectures SET title=${title}, description=${description}, updated_at=NOW() WHERE id=${id}`;
  }
}

export async function publishLecture(id: string) {
  await ensureTable();
  await sql`UPDATE lectures SET is_published=true, updated_at=NOW() WHERE id=${id}`;
}

export async function unpublishLecture(id: string) {
  await ensureTable();
  await sql`UPDATE lectures SET is_published=false, updated_at=NOW() WHERE id=${id}`;
}

export async function deleteLecture(id: string) {
  await ensureTable();
  await sql`DELETE FROM lectures WHERE id=${id}`;
}

export async function reorderLecture(id: string, orderIndex: number) {
  await ensureTable();
  await sql`UPDATE lectures SET order_index=${orderIndex}, updated_at=NOW() WHERE id=${id}`;
}

export async function setFreePreview(id: string, preview: boolean) {
  await ensureTable();
  await sql`UPDATE lectures SET is_free_preview=${preview}, updated_at=NOW() WHERE id=${id}`;
}
