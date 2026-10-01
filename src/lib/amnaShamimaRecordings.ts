import { sql } from "@/lib/db";

// Mirrors amnaShamimaMaterials.ts's shape/isolation rationale — a flat,
// title-only list (per the user's choice, no lecture/week linkage). Replaces
// the workaround of posting a Zoom link + passcode as a plain Announcement,
// which has no dedicated place for the passcode and scrolls off the portal
// once newer announcements are posted.

export interface AmnaShamimaRecording {
  id: string;
  title: string;
  description: string;
  zoom_link: string;
  passcode: string;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

let ready = false;
async function ensureTable() {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS amna_shamima_recordings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      zoom_link TEXT NOT NULL,
      passcode TEXT DEFAULT '',
      is_published BOOLEAN DEFAULT false,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  ready = true;
}

export async function getAllRecordings(): Promise<AmnaShamimaRecording[]> {
  await ensureTable();
  const rows = await sql`SELECT * FROM amna_shamima_recordings ORDER BY created_at DESC`;
  return rows as AmnaShamimaRecording[];
}

export async function getPublishedRecordings(): Promise<AmnaShamimaRecording[]> {
  await ensureTable();
  const rows = await sql`SELECT * FROM amna_shamima_recordings WHERE is_published = true ORDER BY created_at DESC`;
  return rows as AmnaShamimaRecording[];
}

export async function getRecordingById(id: string): Promise<AmnaShamimaRecording | null> {
  await ensureTable();
  const rows = await sql`SELECT * FROM amna_shamima_recordings WHERE id = ${id} LIMIT 1`;
  return (rows[0] as AmnaShamimaRecording) ?? null;
}

export async function createRecording(data: { title: string; description: string; zoom_link: string; passcode: string; created_by: string }): Promise<string> {
  await ensureTable();
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO amna_shamima_recordings (id, title, description, zoom_link, passcode, created_by)
    VALUES (${id}, ${data.title}, ${data.description}, ${data.zoom_link}, ${data.passcode}, ${data.created_by})
  `;
  return id;
}

export async function updateRecording(id: string, data: { title: string; description: string; zoom_link: string; passcode: string }): Promise<void> {
  await ensureTable();
  await sql`
    UPDATE amna_shamima_recordings
    SET title = ${data.title}, description = ${data.description}, zoom_link = ${data.zoom_link}, passcode = ${data.passcode}, updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function publishRecording(id: string): Promise<void> {
  await ensureTable();
  await sql`UPDATE amna_shamima_recordings SET is_published = true, updated_at = NOW() WHERE id = ${id}`;
}

export async function unpublishRecording(id: string): Promise<void> {
  await ensureTable();
  await sql`UPDATE amna_shamima_recordings SET is_published = false, updated_at = NOW() WHERE id = ${id}`;
}

export async function deleteRecording(id: string): Promise<void> {
  await ensureTable();
  await sql`DELETE FROM amna_shamima_recordings WHERE id = ${id}`;
}
