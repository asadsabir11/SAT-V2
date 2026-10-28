import { sql } from "@/lib/db";
import { grantOLevelAccess } from "@/lib/olevelAccess";
import { grantPunjab9thAccess } from "@/lib/punjab9thAccess";
import { grantALevelAccess } from "@/lib/aLevelAccess";

// Redemption codes printed inside physical copies of the academy's notes.
// Deliberately its own isolated table rather than extending any per-program
// access table — a code only needs to know which program/subject it grants
// and whether it's been used, then it just calls into that program's
// existing grant function (same one the admin payment-approval flow already
// uses) to actually unlock access. Nothing about the existing access tables
// or the lecture/quiz/assignment access checks needs to change — a
// book-redeemed account looks identical to a payment-unlocked one.
export type BookCodeProgram = "o-level" | "punjab-9th" | "a-level";

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS book_redemption_codes (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      program TEXT NOT NULL,
      subject TEXT,
      batch_label TEXT,
      status TEXT NOT NULL DEFAULT 'unused',
      redeemed_by_email TEXT,
      redeemed_by_name TEXT,
      redeemed_at TIMESTAMPTZ,
      created_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  tableReady = true;
}

// Excludes 0/O/1/I/L so a printed code can't be misread.
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomSegment(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return out;
}

export interface GenerateBookCodesOptions {
  program: BookCodeProgram;
  subject: string | null;
  count: number;
  batchLabel: string;
  createdBy: string;
}

export async function generateBookCodes(opts: GenerateBookCodesOptions): Promise<string[]> {
  await ensureTable();
  if (opts.count < 1 || opts.count > 2000) {
    throw new Error("Count must be between 1 and 2000");
  }

  const codes: string[] = [];
  const seen = new Set<string>();
  while (codes.length < opts.count) {
    const candidate = `DT-${randomSegment(8)}`;
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    codes.push(candidate);
  }

  // Sequential inserts, not a multi-row batch — this only ever runs as a
  // one-off admin action (generating a print batch), not a hot path, and
  // keeps each insert's ON CONFLICT collision guard simple.
  for (const code of codes) {
    await sql`
      INSERT INTO book_redemption_codes (id, code, program, subject, batch_label, created_by)
      VALUES (${crypto.randomUUID()}, ${code}, ${opts.program}, ${opts.subject}, ${opts.batchLabel}, ${opts.createdBy})
      ON CONFLICT (code) DO NOTHING
    `;
  }
  return codes;
}

export interface BookCodeRecord {
  id: string;
  code: string;
  program: BookCodeProgram;
  subject: string | null;
  batch_label: string | null;
  status: "unused" | "used";
  redeemed_by_email: string | null;
  redeemed_by_name: string | null;
  redeemed_at: string | null;
  created_by: string | null;
  created_at: string;
}

export async function listBookCodes(program?: BookCodeProgram): Promise<BookCodeRecord[]> {
  await ensureTable();
  const rows = program
    ? await sql`SELECT * FROM book_redemption_codes WHERE program = ${program} ORDER BY created_at DESC`
    : await sql`SELECT * FROM book_redemption_codes ORDER BY created_at DESC`;
  return rows as BookCodeRecord[];
}

let registrationsTableReady = false;
async function ensureRegistrationsTable() {
  if (registrationsTableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS book_redemption_registrations (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      program TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  registrationsTableReady = true;
}

// Separate from the normal per-program leads tables on purpose — a
// book-redemption student isn't a marketing lead needing admissions
// follow-up (see the registration form's own comment), so it doesn't
// belong in /admin/o-level-leads etc. This just gives admins their own
// view of who signed up through this specific flow.
export async function recordBookRegistration(email: string, name: string, program: BookCodeProgram): Promise<void> {
  await ensureRegistrationsTable();
  await sql`
    INSERT INTO book_redemption_registrations (id, email, name, program)
    VALUES (${crypto.randomUUID()}, ${email.toLowerCase().trim()}, ${name}, ${program})
  `;
}

export interface BookRegistrationRow {
  id: string;
  email: string;
  name: string;
  program: BookCodeProgram;
  created_at: string;
  redeemed: boolean;
}

export async function listBookRegistrations(program?: BookCodeProgram): Promise<BookRegistrationRow[]> {
  await ensureRegistrationsTable();
  await ensureTable();
  const rows = program
    ? await sql`
        SELECT r.id, r.email, r.name, r.program, r.created_at,
               EXISTS(SELECT 1 FROM book_redemption_codes c WHERE c.redeemed_by_email = r.email AND c.program = r.program AND c.status = 'used') AS redeemed
        FROM book_redemption_registrations r
        WHERE r.program = ${program}
        ORDER BY r.created_at DESC
      `
    : await sql`
        SELECT r.id, r.email, r.name, r.program, r.created_at,
               EXISTS(SELECT 1 FROM book_redemption_codes c WHERE c.redeemed_by_email = r.email AND c.program = r.program AND c.status = 'used') AS redeemed
        FROM book_redemption_registrations r
        ORDER BY r.created_at DESC
      `;
  return rows as BookRegistrationRow[];
}

export type RedeemBookCodeResult =
  | { ok: true; program: BookCodeProgram; subject: string | null }
  | { ok: false; error: "not_found" | "already_used" | "wrong_program" };

// Atomic claim — the UPDATE's WHERE status='unused' means two simultaneous
// redemption attempts for the same code can't both succeed, no separate
// read-then-write race window.
export async function redeemBookCode(rawCode: string, email: string, name: string, studentProgram: BookCodeProgram): Promise<RedeemBookCodeResult> {
  await ensureTable();
  const code = rawCode.trim().toUpperCase();
  const normalizedEmail = email.toLowerCase().trim();

  const claimed = await sql`
    UPDATE book_redemption_codes
    SET status = 'used', redeemed_by_email = ${normalizedEmail}, redeemed_by_name = ${name}, redeemed_at = NOW()
    WHERE code = ${code} AND status = 'unused'
    RETURNING id, program, subject
  `;

  if (claimed.length === 0) {
    const existing = await sql`SELECT status FROM book_redemption_codes WHERE code = ${code} LIMIT 1`;
    if (existing.length === 0) return { ok: false, error: "not_found" };
    return { ok: false, error: "already_used" };
  }

  const row = claimed[0] as { id: string; program: BookCodeProgram; subject: string | null };

  if (row.program !== studentProgram) {
    // Shouldn't happen in practice (the redeem page only lets a student
    // submit against their own program), but guard anyway rather than
    // silently granting access for a program they're not even registered
    // in. The code stays marked used either way — it was already claimed
    // above, so it can't be retried against the right program by someone
    // else; support can re-issue a replacement if this was a genuine mixup.
    return { ok: false, error: "wrong_program" };
  }

  const approvedBy = `book-code:${code}`;
  const notes = "Redeemed via printed book code";
  if (row.program === "o-level" && row.subject) {
    await grantOLevelAccess(normalizedEmail, row.subject, approvedBy, notes);
  } else if (row.program === "punjab-9th") {
    await grantPunjab9thAccess(normalizedEmail, approvedBy, notes);
  } else if (row.program === "a-level") {
    await grantALevelAccess(normalizedEmail, approvedBy, notes);
  }

  return { ok: true, program: row.program, subject: row.subject };
}
