import { sql } from "@/lib/db";
import type { ALevelLectureCategory } from "@/lib/lectures";

// Mirrors olevelAccess.ts — per-subject access, not flat like it used to be.
// A-Level grew a second subject (CS 9618 Vol 1 / Vol 2), each separately
// payable/unlockable, so the old single users.access_level flag no longer
// fits. Own table (a_level_subject_access), isolated from O-Level's.

export type ALevelAccessStatus = "free" | "pending" | "unlocked";

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS a_level_subject_access (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'free',
      payment_requested_at TIMESTAMPTZ,
      approved_at TIMESTAMPTZ,
      approved_by TEXT,
      notes TEXT,
      payment_method TEXT,
      amount_paid NUMERIC,
      transaction_reference TEXT,
      payment_date DATE,
      payer_account_name TEXT,
      payment_screenshot_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(email, subject)
    )
  `;

  // One-time (idempotent) migration: A-Level launched this session as a
  // flat whole-account unlock (users.access_level), before the Vol 1/Vol 2
  // split existed. Any account that was already flat-unlocked gets both
  // volumes granted here so a real paying student never gets locked out by
  // this migration. ON CONFLICT DO NOTHING makes re-running this on every
  // cold start harmless once it's done.
  const flatUnlocked = await sql`SELECT email FROM users WHERE program = 'a-level' AND access_level = 'unlocked'`;
  for (const row of flatUnlocked as { email: string }[]) {
    for (const subject of ["computer-science-vol1", "computer-science-vol2"]) {
      await sql`
        INSERT INTO a_level_subject_access (id, email, subject, status, approved_at, approved_by, notes)
        VALUES (${crypto.randomUUID()}, ${row.email}, ${subject}, 'unlocked', NOW(), 'migration:flat-to-per-subject', 'Migrated from flat A-Level access')
        ON CONFLICT (email, subject) DO NOTHING
      `;
    }
  }

  tableReady = true;
}

export async function getALevelSubjectAccess(email: string, subject: string): Promise<ALevelAccessStatus> {
  await ensureTable();
  const rows = await sql`
    SELECT status FROM a_level_subject_access WHERE email = ${email.toLowerCase().trim()} AND subject = ${subject} LIMIT 1
  `;
  const status = rows[0]?.status;
  return status === "pending" || status === "unlocked" ? status : "free";
}

export async function getALevelAccessMap(email: string): Promise<Record<string, ALevelAccessStatus>> {
  await ensureTable();
  const rows = await sql`
    SELECT subject, status FROM a_level_subject_access WHERE email = ${email.toLowerCase().trim()}
  `;
  const map: Record<string, ALevelAccessStatus> = {};
  for (const r of rows) {
    map[r.subject as string] = (r.status as ALevelAccessStatus) ?? "free";
  }
  return map;
}

export interface PaymentProof {
  paymentMethod: string;
  amountPaid: number;
  transactionReference: string;
  paymentDate: string;
  payerAccountName: string;
  paymentScreenshotUrl: string | null;
}

export async function requestALevelAccess(email: string, subject: ALevelLectureCategory, proof: PaymentProof): Promise<void> {
  await ensureTable();
  const normalized = email.toLowerCase().trim();
  await sql`
    INSERT INTO a_level_subject_access (
      id, email, subject, status, payment_requested_at,
      payment_method, amount_paid, transaction_reference, payment_date, payer_account_name, payment_screenshot_url
    )
    VALUES (
      ${crypto.randomUUID()}, ${normalized}, ${subject}, 'pending', NOW(),
      ${proof.paymentMethod}, ${proof.amountPaid}, ${proof.transactionReference}, ${proof.paymentDate}, ${proof.payerAccountName}, ${proof.paymentScreenshotUrl}
    )
    ON CONFLICT (email, subject) DO UPDATE
      SET status = CASE WHEN a_level_subject_access.status = 'unlocked' THEN 'unlocked' ELSE 'pending' END,
          payment_requested_at = NOW(),
          payment_method = ${proof.paymentMethod},
          amount_paid = ${proof.amountPaid},
          transaction_reference = ${proof.transactionReference},
          payment_date = ${proof.paymentDate},
          payer_account_name = ${proof.payerAccountName},
          payment_screenshot_url = ${proof.paymentScreenshotUrl}
  `;
}

export async function grantALevelAccess(email: string, subject: string, approvedBy: string, notes?: string): Promise<void> {
  await ensureTable();
  const normalized = email.toLowerCase().trim();
  await sql`
    INSERT INTO a_level_subject_access (id, email, subject, status, approved_at, approved_by, notes)
    VALUES (${crypto.randomUUID()}, ${normalized}, ${subject}, 'unlocked', NOW(), ${approvedBy}, ${notes ?? null})
    ON CONFLICT (email, subject) DO UPDATE
      SET status = 'unlocked', approved_at = NOW(), approved_by = ${approvedBy}, notes = ${notes ?? null}
  `;
}

export async function revokeALevelAccess(email: string, subject: string): Promise<void> {
  await ensureTable();
  const normalized = email.toLowerCase().trim();
  await sql`
    INSERT INTO a_level_subject_access (id, email, subject, status)
    VALUES (${crypto.randomUUID()}, ${normalized}, ${subject}, 'free')
    ON CONFLICT (email, subject) DO UPDATE
      SET status = 'free', approved_at = NULL, approved_by = NULL, payment_requested_at = NULL
  `;
}

export interface ALevelAccessRow {
  id: string;
  email: string;
  name: string | null;
  subject: string;
  status: ALevelAccessStatus;
  payment_requested_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  notes: string | null;
  created_at: string;
  payment_method: string | null;
  amount_paid: string | null;
  transaction_reference: string | null;
  payment_date: string | null;
  payer_account_name: string | null;
  payment_screenshot_url: string | null;
}

export async function listALevelAccessRequests(): Promise<ALevelAccessRow[]> {
  await ensureTable();
  const rows = await sql`
    SELECT a.id, a.email, u.name, a.subject, a.status, a.payment_requested_at, a.approved_at, a.approved_by, a.notes, a.created_at,
           a.payment_method, a.amount_paid, a.transaction_reference, a.payment_date, a.payer_account_name, a.payment_screenshot_url
    FROM a_level_subject_access a
    LEFT JOIN users u ON u.email = a.email AND u.program = 'a-level'
    ORDER BY
      CASE a.status WHEN 'pending' THEN 0 WHEN 'unlocked' THEN 1 ELSE 2 END,
      a.created_at DESC
  `;
  return rows as ALevelAccessRow[];
}
