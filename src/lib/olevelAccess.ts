import { sql } from "@/lib/db";
import type { OLevelLectureCategory } from "@/lib/lectures";

export type OLevelAccessStatus = "free" | "pending" | "unlocked";

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS olevel_subject_access (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'free',
      payment_requested_at TIMESTAMPTZ,
      approved_at TIMESTAMPTZ,
      approved_by TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(email, subject)
    )
  `;
  tableReady = true;
}

export async function getOLevelSubjectAccess(email: string, subject: string): Promise<OLevelAccessStatus> {
  await ensureTable();
  const rows = await sql`
    SELECT status FROM olevel_subject_access WHERE email = ${email.toLowerCase().trim()} AND subject = ${subject} LIMIT 1
  `;
  const status = rows[0]?.status;
  return status === "pending" || status === "unlocked" ? status : "free";
}

export async function getOLevelAccessMap(email: string): Promise<Record<string, OLevelAccessStatus>> {
  await ensureTable();
  const rows = await sql`
    SELECT subject, status FROM olevel_subject_access WHERE email = ${email.toLowerCase().trim()}
  `;
  const map: Record<string, OLevelAccessStatus> = {};
  for (const r of rows) {
    map[r.subject as string] = (r.status as OLevelAccessStatus) ?? "free";
  }
  return map;
}

export async function requestOLevelAccess(email: string, subject: OLevelLectureCategory): Promise<void> {
  await ensureTable();
  const normalized = email.toLowerCase().trim();
  await sql`
    INSERT INTO olevel_subject_access (id, email, subject, status, payment_requested_at)
    VALUES (${crypto.randomUUID()}, ${normalized}, ${subject}, 'pending', NOW())
    ON CONFLICT (email, subject) DO UPDATE
      SET status = CASE WHEN olevel_subject_access.status = 'unlocked' THEN 'unlocked' ELSE 'pending' END,
          payment_requested_at = NOW()
  `;
}

export async function grantOLevelAccess(email: string, subject: string, approvedBy: string, notes?: string): Promise<void> {
  await ensureTable();
  const normalized = email.toLowerCase().trim();
  await sql`
    INSERT INTO olevel_subject_access (id, email, subject, status, approved_at, approved_by, notes)
    VALUES (${crypto.randomUUID()}, ${normalized}, ${subject}, 'unlocked', NOW(), ${approvedBy}, ${notes ?? null})
    ON CONFLICT (email, subject) DO UPDATE
      SET status = 'unlocked', approved_at = NOW(), approved_by = ${approvedBy}, notes = ${notes ?? null}
  `;
}

export async function revokeOLevelAccess(email: string, subject: string): Promise<void> {
  await ensureTable();
  const normalized = email.toLowerCase().trim();
  await sql`
    INSERT INTO olevel_subject_access (id, email, subject, status)
    VALUES (${crypto.randomUUID()}, ${normalized}, ${subject}, 'free')
    ON CONFLICT (email, subject) DO UPDATE
      SET status = 'free', approved_at = NULL, approved_by = NULL, payment_requested_at = NULL
  `;
}

export interface OLevelAccessRow {
  id: string;
  email: string;
  name: string | null;
  subject: string;
  status: OLevelAccessStatus;
  payment_requested_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  notes: string | null;
  created_at: string;
}

export async function listOLevelAccessRequests(): Promise<OLevelAccessRow[]> {
  await ensureTable();
  const rows = await sql`
    SELECT a.id, a.email, u.name, a.subject, a.status, a.payment_requested_at, a.approved_at, a.approved_by, a.notes, a.created_at
    FROM olevel_subject_access a
    LEFT JOIN users u ON u.email = a.email
    ORDER BY
      CASE a.status WHEN 'pending' THEN 0 WHEN 'unlocked' THEN 1 ELSE 2 END,
      a.created_at DESC
  `;
  return rows as OLevelAccessRow[];
}
