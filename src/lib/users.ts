import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";


let usersReady = false;
async function ensureUsersTable() {
  if (usersReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('student', 'founder')),
      name TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS access_level TEXT NOT NULL DEFAULT 'free'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_requested_at TIMESTAMPTZ`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS notes TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS program TEXT NOT NULL DEFAULT 'sat'`;
  // Payment-proof fields for the manual (Pakistan) unlock flow, mirroring
  // olevel_subject_access's columns — added after this table already
  // existed in production, so a separate migration, not folded into
  // CREATE TABLE above.
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_method TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS amount_paid NUMERIC`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS transaction_reference TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_date DATE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS payer_account_name TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT`;
  // Migrate role constraint to include 'parent', then 'teacher'
  await sql`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check`;
  await sql`ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'founder', 'parent', 'teacher'))`;
  // Email used to be globally unique, which blocked the same person from
  // having a separate SAT and O-Level account. Scope uniqueness to
  // (email, program) instead — same email, different program is fine; same
  // email, same program is still a duplicate.
  await sql`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_email_program_idx ON users (email, program)`;
  usersReady = true;
}

export async function createUser(
  email: string,
  password: string,
  role: "student" | "founder" | "parent" | "teacher",
  name: string,
  program: "sat" | "o-level" | "punjab-9th" = "sat"
): Promise<string> {
  await ensureUsersTable();
  const id = crypto.randomUUID();
  const hash = await bcrypt.hash(password, 10);
  await sql`
    INSERT INTO users (id, email, password_hash, role, name, program)
    VALUES (${id}, ${email.toLowerCase().trim()}, ${hash}, ${role}, ${name}, ${program})
    ON CONFLICT (email, program) DO NOTHING
  `;
  return id;
}

export async function getUserProgram(email: string): Promise<"sat" | "o-level"> {
  await ensureUsersTable();
  const rows = await sql`SELECT program FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1`;
  return rows[0]?.program === "o-level" ? "o-level" : "sat";
}

export async function findUserByEmail(email: string) {
  await ensureUsersTable();
  const rows = await sql`
    SELECT * FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1
  `;
  return rows[0] ?? null;
}

// Same person, same email, can hold one account per program (a SAT account
// and an O-Level account) — this checks whether THIS specific program's
// account already exists, used by both registration endpoints instead of
// the global findUserByEmail() so registering for the other program isn't
// blocked.
export async function findUserByEmailAndProgram(email: string, program: "sat" | "o-level" | "punjab-9th") {
  await ensureUsersTable();
  const rows = await sql`
    SELECT * FROM users WHERE email = ${email.toLowerCase().trim()} AND program = ${program} LIMIT 1
  `;
  return rows[0] ?? null;
}

// Login needs every account matching (email, role) — not just one — since a
// student can now have both a SAT and an O-Level row under the same email.
// Ordered oldest-first so which account wins is at least deterministic if
// the caller doesn't disambiguate by program.
export async function findUsersByEmailAndRole(email: string, role: string) {
  await ensureUsersTable();
  const rows = await sql`
    SELECT * FROM users WHERE email = ${email.toLowerCase().trim()} AND role = ${role} ORDER BY created_at ASC
  `;
  return rows;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function updateUserPassword(email: string, newPassword: string): Promise<void> {
  await ensureUsersTable();
  const hash = await bcrypt.hash(newPassword, 10);
  await sql`UPDATE users SET password_hash = ${hash} WHERE email = ${email.toLowerCase().trim()}`;
}

// access_level is a SAT-only concept (O-Level unlocks per-subject through a
// separate table) — every query here is scoped to program = 'sat' so a
// person's O-Level account never shadows or gets shadowed by their SAT
// account's access state when both share an email.
export async function getStudentAccessLevel(email: string): Promise<"free" | "pending" | "unlocked"> {
  await ensureUsersTable();
  const rows = await sql`SELECT access_level FROM users WHERE email = ${email.toLowerCase().trim()} AND program = 'sat' LIMIT 1`;
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

// Manual (Pakistan) unlock path — records payment proof and flips access to
// 'pending' for the founder to verify. Allowed to run again while already
// 'pending' (e.g. the student corrects a typo and resubmits), but not once
// 'unlocked'.
export async function requestAccess(email: string, proof: PaymentProof): Promise<void> {
  await ensureUsersTable();
  await sql`
    UPDATE users
    SET access_level = 'pending', payment_requested_at = NOW(),
        payment_method = ${proof.paymentMethod},
        amount_paid = ${proof.amountPaid},
        transaction_reference = ${proof.transactionReference},
        payment_date = ${proof.paymentDate},
        payer_account_name = ${proof.payerAccountName},
        payment_screenshot_url = ${proof.paymentScreenshotUrl}
    WHERE email = ${email.toLowerCase().trim()} AND program = 'sat' AND access_level != 'unlocked'
  `;
}

// `stripePayment` is set only by the Stripe webhook path, which skips
// requestAccess() entirely (no manual proof submission happens for a card
// payment) — without recording it here, the admin view would show an
// unlocked account with no payment trail at all for Stripe-granted access.
export async function grantAccess(
  email: string, approvedBy: string, notes?: string,
  stripePayment?: { sessionId: string; amount: number }
): Promise<void> {
  await ensureUsersTable();
  if (stripePayment) {
    await sql`
      UPDATE users
      SET access_level = 'unlocked', approved_at = NOW(), approved_by = ${approvedBy}, notes = ${notes ?? null},
          payment_method = 'stripe', amount_paid = ${stripePayment.amount},
          transaction_reference = ${stripePayment.sessionId}, payment_date = CURRENT_DATE
      WHERE email = ${email.toLowerCase().trim()} AND program = 'sat'
    `;
    return;
  }
  await sql`
    UPDATE users
    SET access_level = 'unlocked', approved_at = NOW(), approved_by = ${approvedBy}, notes = ${notes ?? null}
    WHERE email = ${email.toLowerCase().trim()} AND program = 'sat'
  `;
}

export async function revokeAccess(email: string): Promise<void> {
  await ensureUsersTable();
  await sql`
    UPDATE users
    SET access_level = 'free', approved_at = NULL, approved_by = NULL, payment_requested_at = NULL
    WHERE email = ${email.toLowerCase().trim()} AND program = 'sat'
  `;
}

export interface StudentAccessRow {
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

export async function listStudentsWithAccess(): Promise<StudentAccessRow[]> {
  await ensureUsersTable();
  const rows = await sql`
    SELECT id, email, name, created_at, access_level, payment_requested_at, approved_at, approved_by, notes,
           payment_method, amount_paid, transaction_reference, payment_date, payer_account_name, payment_screenshot_url
    FROM users
    WHERE role = 'student' AND program = 'sat'
    ORDER BY
      CASE access_level WHEN 'pending' THEN 0 WHEN 'free' THEN 1 ELSE 2 END,
      created_at DESC
  `;
  return rows as StudentAccessRow[];
}
