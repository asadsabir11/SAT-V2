import { sql } from "@/lib/db";

// Mirrors punjab9thAccess.ts — flat access (one fee unlocks the whole
// program), not per-subject like O-Level, matching A-Level's single-subject
// (Computer Science) pricing model. Reuses the same generic users table
// columns, scoped to program = 'a-level'.

export async function getALevelAccessLevel(email: string): Promise<"free" | "pending" | "unlocked"> {
  const rows = await sql`SELECT access_level FROM users WHERE email = ${email.toLowerCase().trim()} AND program = 'a-level' LIMIT 1`;
  const level = rows[0]?.access_level ?? "free";
  if (level === "pending" || level === "unlocked") return level;
  return "free";
}

export interface PaymentProof {
  paymentMethod: string;
  amountPaid: number;
  transactionReference: string;
  paymentDate: string;
  payerAccountName: string;
  paymentScreenshotUrl: string | null;
}

export async function requestALevelAccess(email: string, proof: PaymentProof): Promise<void> {
  await sql`
    UPDATE users
    SET access_level = 'pending', payment_requested_at = NOW(),
        payment_method = ${proof.paymentMethod},
        amount_paid = ${proof.amountPaid},
        transaction_reference = ${proof.transactionReference},
        payment_date = ${proof.paymentDate},
        payer_account_name = ${proof.payerAccountName},
        payment_screenshot_url = ${proof.paymentScreenshotUrl}
    WHERE email = ${email.toLowerCase().trim()} AND program = 'a-level' AND access_level != 'unlocked'
  `;
}

export async function grantALevelAccess(email: string, approvedBy: string, notes?: string): Promise<void> {
  await sql`
    UPDATE users
    SET access_level = 'unlocked', approved_at = NOW(), approved_by = ${approvedBy}, notes = ${notes ?? null}
    WHERE email = ${email.toLowerCase().trim()} AND program = 'a-level'
  `;
}

export async function revokeALevelAccess(email: string): Promise<void> {
  await sql`
    UPDATE users
    SET access_level = 'free', approved_at = NULL, approved_by = NULL, payment_requested_at = NULL
    WHERE email = ${email.toLowerCase().trim()} AND program = 'a-level'
  `;
}

export interface ALevelAccessRow {
  id: string;
  email: string;
  name: string;
  created_at: string;
  access_level: "free" | "pending" | "unlocked";
  payment_requested_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  notes: string | null;
  payment_method: string | null;
  amount_paid: string | null;
  transaction_reference: string | null;
  payment_date: string | null;
  payer_account_name: string | null;
  payment_screenshot_url: string | null;
}

export async function listALevelStudentsWithAccess(): Promise<ALevelAccessRow[]> {
  const rows = await sql`
    SELECT id, email, name, created_at, access_level, payment_requested_at, approved_at, approved_by, notes,
           payment_method, amount_paid, transaction_reference, payment_date, payer_account_name, payment_screenshot_url
    FROM users
    WHERE role = 'student' AND program = 'a-level'
    ORDER BY
      CASE access_level WHEN 'pending' THEN 0 WHEN 'free' THEN 1 ELSE 2 END,
      created_at DESC
  `;
  return rows as ALevelAccessRow[];
}
