import { sql } from "@/lib/db";


export type Announcement = {
  id: string;
  title: string;
  body: string;
  created_by: string;
  created_at: string;
  // null = posted before program-scoping existed — shown to both programs
  // rather than silently hidden from whichever one didn't originally exist.
  program: "sat" | "o-level" | null;
};

let ready = false;
async function ensureTable() {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS program TEXT`;
  ready = true;
}

// No program = admin view, every announcement across both programs.
// A program = student view, that program's posts plus any legacy/general
// ones (program IS NULL).
export async function getAnnouncements(program?: "sat" | "o-level" | "punjab-9th"): Promise<Announcement[]> {
  await ensureTable();
  const rows = program
    ? await sql`SELECT * FROM announcements WHERE program = ${program} OR program IS NULL ORDER BY created_at DESC LIMIT 10`
    : await sql`SELECT * FROM announcements ORDER BY created_at DESC LIMIT 30`;
  return rows as Announcement[];
}

export async function createAnnouncement(data: { title: string; body: string; created_by: string; program: "sat" | "o-level" }): Promise<string> {
  await ensureTable();
  const id = crypto.randomUUID();
  await sql`INSERT INTO announcements (id, title, body, created_by, program) VALUES (${id}, ${data.title}, ${data.body}, ${data.created_by}, ${data.program})`;
  return id;
}

export async function deleteAnnouncement(id: string) {
  await ensureTable();
  await sql`DELETE FROM announcements WHERE id = ${id}`;
}
