import { sql } from "@/lib/db";
import crypto from "crypto";

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_reset_token_hash ON password_reset_tokens(token_hash)`;
  tableReady = true;
}

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

/**
 * Generates a one-time reset token and stores only its hash. No time-based
 * expiry by design — the link stays valid until it's actually used to reset
 * the password (or the account is deleted), not until an arbitrary clock
 * runs out. expires_at is still populated (column is NOT NULL) but is never
 * checked — set far out so its presence doesn't imply an enforced deadline.
 */
export async function createResetToken(email: string): Promise<string> {
  await ensureTable();
  const raw = crypto.randomBytes(32).toString("hex");
  await sql`
    INSERT INTO password_reset_tokens (id, email, token_hash, expires_at)
    VALUES (${crypto.randomUUID()}, ${email.toLowerCase().trim()}, ${hashToken(raw)}, NOW() + INTERVAL '100 years')
  `;
  return raw;
}

/** Marks a token used and returns the email it was issued for, or null if invalid/already used. */
export async function consumeResetToken(rawToken: string): Promise<string | null> {
  await ensureTable();
  const rows = await sql`
    SELECT id, email FROM password_reset_tokens
    WHERE token_hash = ${hashToken(rawToken)} AND used_at IS NULL
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return null;
  await sql`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ${row.id}`;
  return row.email as string;
}
