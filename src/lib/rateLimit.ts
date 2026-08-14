import { sql } from "@/lib/db";

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS rate_limit_events (
      id BIGSERIAL PRIMARY KEY,
      bucket TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_rate_limit_bucket_time ON rate_limit_events(bucket, created_at)`;
  tableReady = true;
}

/**
 * Simple DB-backed fixed-window rate limit. Returns true if the request
 * should be ALLOWED (and records it), false if the caller has exceeded
 * `max` events in the last `windowMinutes` for this bucket.
 */
export async function checkRateLimit(bucket: string, max: number, windowMinutes: number): Promise<boolean> {
  await ensureTable();
  const rows = await sql`
    SELECT COUNT(*)::int AS count FROM rate_limit_events
    WHERE bucket = ${bucket} AND created_at > NOW() - (${windowMinutes} || ' minutes')::interval
  `;
  const count = (rows[0]?.count as number) ?? 0;
  if (count >= max) return false;
  await sql`INSERT INTO rate_limit_events (bucket) VALUES (${bucket})`;
  return true;
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
