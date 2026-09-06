import { sql } from "@/lib/db";

// Reuses the same underlying live_sessions table as sessions.ts and
// punjab9thSessions.ts (program = 'amna-shamima'), but — unlike either of
// those — this program has no subject or study-group dimension at all: it's
// one AI course, one cohort, one shared class link. So this is simpler than
// punjab9thSessions.ts, not just isolated from sessions.ts's SAT/O-Level
// typing: subject and study_group are left NULL on these rows.

export interface AmnaShamimaSession {
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

export async function getAllAmnaShamimaSessions(): Promise<AmnaShamimaSession[]> {
  const rows = await sql`
    SELECT id, title, description, meeting_link, platform, scheduled_at, is_active, created_by, created_at
    FROM live_sessions WHERE program = 'amna-shamima' ORDER BY scheduled_at DESC
  `;
  return rows as AmnaShamimaSession[];
}

export async function getActiveAmnaShamimaSessions(): Promise<AmnaShamimaSession[]> {
  const rows = await sql`
    SELECT id, title, description, meeting_link, platform, scheduled_at, is_active, created_by, created_at
    FROM live_sessions WHERE program = 'amna-shamima' AND is_active = true ORDER BY scheduled_at ASC
  `;
  return rows as AmnaShamimaSession[];
}

export async function createAmnaShamimaSession(data: {
  title: string; description: string; meeting_link: string; platform: AmnaShamimaSession["platform"]; scheduled_at: string; is_active: boolean; created_by: string;
}): Promise<string> {
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO live_sessions (id, title, description, meeting_link, platform, scheduled_at, is_active, program, created_by)
    VALUES (${id}, ${data.title}, ${data.description}, ${data.meeting_link}, ${data.platform}, ${data.scheduled_at}, ${data.is_active}, 'amna-shamima', ${data.created_by})
  `;
  return id;
}

export async function updateAmnaShamimaSession(id: string, data: Partial<Pick<AmnaShamimaSession, "title" | "description" | "meeting_link" | "platform" | "scheduled_at" | "is_active">>): Promise<void> {
  await sql`
    UPDATE live_sessions SET
      title = COALESCE(${data.title ?? null}, title),
      description = COALESCE(${data.description ?? null}, description),
      meeting_link = COALESCE(${data.meeting_link ?? null}, meeting_link),
      platform = COALESCE(${data.platform ?? null}, platform),
      scheduled_at = COALESCE(${data.scheduled_at ?? null}, scheduled_at),
      is_active = COALESCE(${data.is_active ?? null}, is_active)
    WHERE id = ${id} AND program = 'amna-shamima'
  `;
}

export async function deleteAmnaShamimaSession(id: string): Promise<void> {
  await sql`DELETE FROM live_sessions WHERE id = ${id} AND program = 'amna-shamima'`;
}
