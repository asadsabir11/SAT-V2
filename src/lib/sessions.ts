import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.POSTGRES_URL!);

export type Session = {
  id: string;
  title: string;
  description: string;
  meeting_link: string;
  platform: "zoom" | "google_classroom" | "google_meet" | "other";
  scheduled_at: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
};

let ready = false;
async function ensureTable() {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS live_sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      meeting_link TEXT NOT NULL,
      platform TEXT DEFAULT 'zoom',
      scheduled_at TIMESTAMPTZ NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  ready = true;
}

export async function getAllSessions(): Promise<Session[]> {
  await ensureTable();
  const rows = await sql`SELECT * FROM live_sessions ORDER BY scheduled_at DESC`;
  return rows as Session[];
}

export async function getActiveSessions(): Promise<Session[]> {
  await ensureTable();
  const rows = await sql`SELECT * FROM live_sessions WHERE is_active = true ORDER BY scheduled_at ASC`;
  return rows as Session[];
}

export async function createSession(data: Omit<Session, "id" | "created_at">): Promise<string> {
  await ensureTable();
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO live_sessions (id, title, description, meeting_link, platform, scheduled_at, is_active, created_by)
    VALUES (${id}, ${data.title}, ${data.description}, ${data.meeting_link}, ${data.platform}, ${data.scheduled_at}, ${data.is_active}, ${data.created_by})
  `;
  return id;
}

export async function updateSession(id: string, data: Partial<Pick<Session, "title" | "description" | "meeting_link" | "platform" | "scheduled_at" | "is_active">>) {
  await ensureTable();
  await sql`
    UPDATE live_sessions SET
      title = COALESCE(${data.title ?? null}, title),
      description = COALESCE(${data.description ?? null}, description),
      meeting_link = COALESCE(${data.meeting_link ?? null}, meeting_link),
      platform = COALESCE(${data.platform ?? null}, platform),
      scheduled_at = COALESCE(${data.scheduled_at ?? null}, scheduled_at),
      is_active = COALESCE(${data.is_active ?? null}, is_active)
    WHERE id = ${id}
  `;
}

export async function deleteSession(id: string) {
  await ensureTable();
  await sql`DELETE FROM live_sessions WHERE id = ${id}`;
}
