import { sql } from "@/lib/db";

// Deliberately NOT reusing sessions.ts's exported functions — that file's
// Session.subject is typed as OLevelLectureCategory, a strict 6-value enum
// used broadly across O-Level lecture/quiz/access gating, and widening it
// to also cover Punjab 9th's subject set (Urdu, Chemistry, Biology,
// Tarjuma-tul-Quran, etc. — mostly not O-Level subjects) would touch a lot
// of O-Level-specific code for no reason. Instead this writes directly to
// the same underlying live_sessions table (program='punjab-9th'), which
// already has no DB-level constraint tying subject to any fixed set — so
// this is fully isolated at the TypeScript/module level while still
// sharing the table, which is what lets the existing, already-generic
// session_attendance / getAttendanceForSession (parent-system.ts) work
// here completely unmodified.

export type Punjab9thStudyGroup = "Biology" | "Computer Science" | "Both";

export const PUNJAB_9TH_SUBJECTS = ["English", "Urdu", "Maths", "Physics", "Chemistry", "Biology", "Computer Science", "Islamiat", "Tarjuma-tul-Quran or Ethics"] as const;

// Which subjects a student actually studies, based on their registered
// group — used to render permanent subject cards on the portal (always
// shown, whether or not a class has been scheduled for that subject yet).
const BIOLOGY_GROUP_SUBJECTS = ["English", "Urdu", "Maths", "Physics", "Chemistry", "Biology", "Islamiat", "Tarjuma-tul-Quran or Ethics"];
const CS_GROUP_SUBJECTS = ["English", "Urdu", "Maths", "Physics", "Chemistry", "Computer Science", "Islamiat", "Tarjuma-tul-Quran or Ethics"];

export function subjectsForStudyGroup(group: string): string[] {
  return group === "Computer Science" ? CS_GROUP_SUBJECTS : BIOLOGY_GROUP_SUBJECTS;
}

export interface Punjab9thSession {
  id: string;
  subject: string;
  study_group: Punjab9thStudyGroup;
  title: string;
  meeting_link: string;
  scheduled_at: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

let ready = false;
async function ensureColumn() {
  if (ready) return;
  // study_group is nullable and only ever set on program='punjab-9th' rows
  // — SAT/O-Level rows in this same table are untouched (NULL).
  await sql`ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS study_group TEXT`;
  ready = true;
}

export async function getAllPunjab9thSessions(): Promise<Punjab9thSession[]> {
  await ensureColumn();
  const rows = await sql`
    SELECT id, subject, study_group, title, meeting_link, scheduled_at, is_active, created_by, created_at
    FROM live_sessions WHERE program = 'punjab-9th' ORDER BY scheduled_at DESC
  `;
  return rows as Punjab9thSession[];
}

// Used by the student-facing portal — active sessions for the student's
// registered group, plus any "Both" sessions (shared-subject classes like
// English/Urdu/Maths that both groups attend together).
export async function getActivePunjab9thSessionsForGroup(group: string): Promise<Punjab9thSession[]> {
  await ensureColumn();
  const rows = await sql`
    SELECT id, subject, study_group, title, meeting_link, scheduled_at, is_active, created_by, created_at
    FROM live_sessions
    WHERE program = 'punjab-9th' AND is_active = true AND (study_group = ${group} OR study_group = 'Both')
    ORDER BY scheduled_at ASC
  `;
  return rows as Punjab9thSession[];
}

// Powers the dedicated per-subject portal page — a student clicks their
// "Urdu" card and lands on a page scoped to just that subject.
export async function getActivePunjab9thSessionsForSubjectAndGroup(subject: string, group: string): Promise<Punjab9thSession[]> {
  await ensureColumn();
  const rows = await sql`
    SELECT id, subject, study_group, title, meeting_link, scheduled_at, is_active, created_by, created_at
    FROM live_sessions
    WHERE program = 'punjab-9th' AND is_active = true AND subject = ${subject} AND (study_group = ${group} OR study_group = 'Both')
    ORDER BY scheduled_at ASC
  `;
  return rows as Punjab9thSession[];
}

export async function createPunjab9thSession(data: {
  subject: string; study_group: Punjab9thStudyGroup; title: string; meeting_link: string; scheduled_at: string; is_active: boolean; created_by: string;
}): Promise<string> {
  await ensureColumn();
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO live_sessions (id, title, description, meeting_link, platform, scheduled_at, is_active, program, subject, study_group, created_by)
    VALUES (${id}, ${data.title}, '', ${data.meeting_link}, 'zoom', ${data.scheduled_at}, ${data.is_active}, 'punjab-9th', ${data.subject}, ${data.study_group}, ${data.created_by})
  `;
  return id;
}

export async function updatePunjab9thSession(id: string, data: Partial<Pick<Punjab9thSession, "subject" | "study_group" | "title" | "meeting_link" | "scheduled_at" | "is_active">>) {
  await ensureColumn();
  await sql`
    UPDATE live_sessions SET
      subject = COALESCE(${data.subject ?? null}, subject),
      study_group = COALESCE(${data.study_group ?? null}, study_group),
      title = COALESCE(${data.title ?? null}, title),
      meeting_link = COALESCE(${data.meeting_link ?? null}, meeting_link),
      scheduled_at = COALESCE(${data.scheduled_at ?? null}, scheduled_at),
      is_active = COALESCE(${data.is_active ?? null}, is_active)
    WHERE id = ${id} AND program = 'punjab-9th'
  `;
}

export async function deletePunjab9thSession(id: string) {
  await ensureColumn();
  await sql`DELETE FROM live_sessions WHERE id = ${id} AND program = 'punjab-9th'`;
}
