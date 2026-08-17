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
  // Payment-proof fields added after this table already existed in
  // production — must be their own migration, not folded into CREATE TABLE
  // above (that already burned us once today on olevel_applications).
  await sql`ALTER TABLE olevel_subject_access ADD COLUMN IF NOT EXISTS payment_method TEXT`;
  await sql`ALTER TABLE olevel_subject_access ADD COLUMN IF NOT EXISTS amount_paid NUMERIC`;
  await sql`ALTER TABLE olevel_subject_access ADD COLUMN IF NOT EXISTS transaction_reference TEXT`;
  await sql`ALTER TABLE olevel_subject_access ADD COLUMN IF NOT EXISTS payment_date DATE`;
  await sql`ALTER TABLE olevel_subject_access ADD COLUMN IF NOT EXISTS payer_account_name TEXT`;
  await sql`ALTER TABLE olevel_subject_access ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT`;
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

export interface PaymentProof {
  paymentMethod: string;
  amountPaid: number;
  transactionReference: string;
  paymentDate: string;
  payerAccountName: string;
  paymentScreenshotUrl: string | null;
}

export async function requestOLevelAccess(email: string, subject: OLevelLectureCategory, proof: PaymentProof): Promise<void> {
  await ensureTable();
  const normalized = email.toLowerCase().trim();
  await sql`
    INSERT INTO olevel_subject_access (
      id, email, subject, status, payment_requested_at,
      payment_method, amount_paid, transaction_reference, payment_date, payer_account_name, payment_screenshot_url
    )
    VALUES (
      ${crypto.randomUUID()}, ${normalized}, ${subject}, 'pending', NOW(),
      ${proof.paymentMethod}, ${proof.amountPaid}, ${proof.transactionReference}, ${proof.paymentDate}, ${proof.payerAccountName}, ${proof.paymentScreenshotUrl}
    )
    ON CONFLICT (email, subject) DO UPDATE
      SET status = CASE WHEN olevel_subject_access.status = 'unlocked' THEN 'unlocked' ELSE 'pending' END,
          payment_requested_at = NOW(),
          payment_method = ${proof.paymentMethod},
          amount_paid = ${proof.amountPaid},
          transaction_reference = ${proof.transactionReference},
          payment_date = ${proof.paymentDate},
          payer_account_name = ${proof.payerAccountName},
          payment_screenshot_url = ${proof.paymentScreenshotUrl}
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
  payment_method: string | null;
  amount_paid: string | null;
  transaction_reference: string | null;
  payment_date: string | null;
  payer_account_name: string | null;
  payment_screenshot_url: string | null;
}

export async function listOLevelAccessRequests(): Promise<OLevelAccessRow[]> {
  await ensureTable();
  const rows = await sql`
    SELECT a.id, a.email, u.name, a.subject, a.status, a.payment_requested_at, a.approved_at, a.approved_by, a.notes, a.created_at,
           a.payment_method, a.amount_paid, a.transaction_reference, a.payment_date, a.payer_account_name, a.payment_screenshot_url
    FROM olevel_subject_access a
    LEFT JOIN users u ON u.email = a.email
    ORDER BY
      CASE a.status WHEN 'pending' THEN 0 WHEN 'unlocked' THEN 1 ELSE 2 END,
      a.created_at DESC
  `;
  return rows as OLevelAccessRow[];
}

export async function getOLevelAccessById(id: string): Promise<OLevelAccessRow | null> {
  await ensureTable();
  const rows = await sql`
    SELECT a.id, a.email, u.name, a.subject, a.status, a.payment_requested_at, a.approved_at, a.approved_by, a.notes, a.created_at,
           a.payment_method, a.amount_paid, a.transaction_reference, a.payment_date, a.payer_account_name, a.payment_screenshot_url
    FROM olevel_subject_access a
    LEFT JOIN users u ON u.email = a.email
    WHERE a.id = ${id}
    LIMIT 1
  `;
  return (rows[0] as OLevelAccessRow) ?? null;
}
