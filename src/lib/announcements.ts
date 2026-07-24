import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.POSTGRES_URL!);

export type Announcement = {
  id: string;
  title: string;
  body: string;
  created_by: string;
  created_at: string;
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
  ready = true;
}

export async function getAnnouncements(): Promise<Announcement[]> {
  await ensureTable();
  const rows = await sql`SELECT * FROM announcements ORDER BY created_at DESC LIMIT 10`;
  return rows as Announcement[];
}

export async function createAnnouncement(data: { title: string; body: string; created_by: string }): Promise<string> {
  await ensureTable();
  const id = crypto.randomUUID();
  await sql`INSERT INTO announcements (id, title, body, created_by) VALUES (${id}, ${data.title}, ${data.body}, ${data.created_by})`;
  return id;
}

export async function deleteAnnouncement(id: string) {
  await ensureTable();
  await sql`DELETE FROM announcements WHERE id = ${id}`;
}
