import { sql } from "@/lib/db";

export type NotificationType = "challan" | "lecture" | "quiz" | "announcement";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  // null program = shown to students in both programs.
  program: "sat" | "o-level" | null;
  // O-Level-only subject scoping; null = whole program (or SAT, where there's
  // no per-subject access model).
  subject: string | null;
  // null = broadcast to everyone in `program`; set = targeted at one student
  // (e.g. "your fee challan is ready" shouldn't reach anyone else).
  student_user_id: string | null;
  created_at: string;
}

let ready = false;
async function ensureTable() {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      link TEXT,
      program TEXT,
      subject TEXT,
      student_user_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS notifications_last_seen_at TIMESTAMPTZ`;
  ready = true;
}

export async function createNotification(input: {
  type: NotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
  program?: "sat" | "o-level" | null;
  subject?: string | null;
  studentUserId?: string | null;
}): Promise<void> {
  await ensureTable();
  await sql`
    INSERT INTO notifications (id, type, title, body, link, program, subject, student_user_id)
    VALUES (
      ${crypto.randomUUID()}, ${input.type}, ${input.title}, ${input.body ?? null}, ${input.link ?? null},
      ${input.program ?? null}, ${input.subject ?? null}, ${input.studentUserId ?? null}
    )
  `;
}

// Broadcasts scoped to the student's program, plus anything targeted
// directly at them. O-Level subject-level scoping is applied by the caller
// in JS (it already has the student's unlocked-subjects set from
// getOLevelAccessMap) rather than here, to avoid dynamic array params
// against the `sql` tagged-template wrapper.
export async function listNotificationsForStudent(studentUserId: string, program: "sat" | "o-level", limit = 30): Promise<Notification[]> {
  await ensureTable();
  const rows = await sql`
    SELECT * FROM notifications
    WHERE student_user_id = ${studentUserId}
       OR (student_user_id IS NULL AND (program IS NULL OR program = ${program}))
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows as Notification[];
}

export async function getLastSeenAt(studentUserId: string): Promise<string | null> {
  await ensureTable();
  const rows = await sql`SELECT notifications_last_seen_at FROM users WHERE id = ${studentUserId} LIMIT 1`;
  return (rows[0]?.notifications_last_seen_at as string | null) ?? null;
}

export async function markNotificationsSeen(studentUserId: string): Promise<void> {
  await ensureTable();
  await sql`UPDATE users SET notifications_last_seen_at = NOW() WHERE id = ${studentUserId}`;
}
