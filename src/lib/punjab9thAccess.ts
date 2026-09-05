import { sql } from "@/lib/db";

// Mirrors the SAT-specific access functions in users.ts (getStudentAccessLevel,
// requestAccess, grantAccess, revokeAccess, listStudentsWithAccess) — those
// are explicitly hardcoded to program = 'sat' by design (see the comment on
// getStudentAccessLevel there), so rather than widen shared SAT code this is
// an isolated module scoped to program = 'punjab-9th' instead. It reuses the
// same users table columns (access_level, payment_method, amount_paid, etc.)
// which are already generic — no schema change needed, just a different
// program filter. Single flat access flag (not per-subject like O-Level),
// matching the actual pricing model: one fee unlocks every subject.

export async function getPunjab9thAccessLevel(email: string): Promise<"free" | "pending" | "unlocked"> {
  const rows = await sql`SELECT access_level FROM users WHERE email = ${email.toLowerCase().trim()} AND program = 'punjab-9th' LIMIT 1`;
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

export async function requestPunjab9thAccess(email: string, proof: PaymentProof): Promise<void> {
  await sql`
    UPDATE users
    SET access_level = 'pending', payment_requested_at = NOW(),
        payment_method = ${proof.paymentMethod},
        amount_paid = ${proof.amountPaid},
        transaction_reference = ${proof.transactionReference},
        payment_date = ${proof.paymentDate},
        payer_account_name = ${proof.payerAccountName},
        payment_screenshot_url = ${proof.paymentScreenshotUrl}
    WHERE email = ${email.toLowerCase().trim()} AND program = 'punjab-9th' AND access_level != 'unlocked'
  `;
}

export async function grantPunjab9thAccess(email: string, approvedBy: string, notes?: string): Promise<void> {
  await sql`
    UPDATE users
    SET access_level = 'unlocked', approved_at = NOW(), approved_by = ${approvedBy}, notes = ${notes ?? null}
    WHERE email = ${email.toLowerCase().trim()} AND program = 'punjab-9th'
  `;
}

export async function revokePunjab9thAccess(email: string): Promise<void> {
  await sql`
    UPDATE users
    SET access_level = 'free', approved_at = NULL, approved_by = NULL, payment_requested_at = NULL
    WHERE email = ${email.toLowerCase().trim()} AND program = 'punjab-9th'
  `;
}

export interface Punjab9thAccessRow {
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

export async function listPunjab9thStudentsWithAccess(): Promise<Punjab9thAccessRow[]> {
  const rows = await sql`
    SELECT id, email, name, created_at, access_level, payment_requested_at, approved_at, approved_by, notes,
           payment_method, amount_paid, transaction_reference, payment_date, payer_account_name, payment_screenshot_url
    FROM users
    WHERE role = 'student' AND program = 'punjab-9th'
    ORDER BY
      CASE access_level WHEN 'pending' THEN 0 WHEN 'free' THEN 1 ELSE 2 END,
      created_at DESC
  `;
  return rows as Punjab9thAccessRow[];
}
