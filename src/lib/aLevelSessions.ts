import { sql } from "@/lib/db";

// Deliberately isolated from sessions.ts (used by SAT/O-Level only) rather
// than widening it — same reasoning as punjab9thSessions.ts: sessions.ts's
// Session.subject is typed as OLevelLectureCategory and admin/sessions'
// page UI is tightly coupled to SAT/O-Level's own subject pickers. This
// writes to the same underlying live_sessions table (program='a-level'),
// no subject column needed at all since A-Level has exactly one subject.

export interface ALevelSession {
  id: string;
  title: string;
  description: string;
  meeting_link: string;
  platform: "zoom" | "google_classroom" | "google_meet" | "other";
  scheduled_at: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export async function getAllALevelSessions(): Promise<ALevelSession[]> {
  const rows = await sql`
    SELECT id, title, description, meeting_link, platform, scheduled_at, is_active, created_by, created_at
    FROM live_sessions WHERE program = 'a-level' ORDER BY scheduled_at DESC
  `;
  return rows as ALevelSession[];
}

export async function getActiveALevelSessions(): Promise<ALevelSession[]> {
  const rows = await sql`
    SELECT id, title, description, meeting_link, platform, scheduled_at, is_active, created_by, created_at
    FROM live_sessions WHERE program = 'a-level' AND is_active = true ORDER BY scheduled_at DESC
  `;
  return rows as ALevelSession[];
}

export async function createALevelSession(data: {
  title: string; description: string; meeting_link: string;
  platform: ALevelSession["platform"]; scheduled_at: string; created_by: string;
}): Promise<string> {
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO live_sessions (id, title, description, meeting_link, platform, scheduled_at, program, is_active, created_by)
    VALUES (${id}, ${data.title}, ${data.description}, ${data.meeting_link}, ${data.platform}, ${data.scheduled_at}, 'a-level', true, ${data.created_by})
  `;
  return id;
}

export async function updateALevelSession(id: string, data: Partial<Pick<ALevelSession, "title" | "description" | "meeting_link" | "platform" | "scheduled_at" | "is_active">>): Promise<void> {
  await sql`
    UPDATE live_sessions SET
      title = COALESCE(${data.title ?? null}, title),
      description = COALESCE(${data.description ?? null}, description),
      meeting_link = COALESCE(${data.meeting_link ?? null}, meeting_link),
      platform = COALESCE(${data.platform ?? null}, platform),
      scheduled_at = COALESCE(${data.scheduled_at ?? null}, scheduled_at),
      is_active = COALESCE(${data.is_active ?? null}, is_active)
    WHERE id = ${id} AND program = 'a-level'
  `;
}

export async function deleteALevelSession(id: string): Promise<void> {
  await sql`DELETE FROM live_sessions WHERE id = ${id} AND program = 'a-level'`;
}
