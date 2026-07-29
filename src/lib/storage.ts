import { sql } from "@/lib/db";


let tablesReady = false;

async function ensureTables() {
  if (tablesReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS sat_records (
      id TEXT PRIMARY KEY,
      collection TEXT NOT NULL,
      email TEXT,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_collection ON sat_records(collection)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_email ON sat_records(email)`;
  tablesReady = true;
}

export async function appendData<T>(collection: string, record: T): Promise<void> {
  await ensureTables();
  const r = record as Record<string, unknown>;
  const id = (r.id as string) ?? crypto.randomUUID();
  const email = (r.email ?? r.studentEmail ?? null) as string | null;
  await sql`
    INSERT INTO sat_records (id, collection, email, data)
    VALUES (${id}, ${collection}, ${email}, ${JSON.stringify(record)})
    ON CONFLICT (id) DO NOTHING
  `;
}

export async function findByField<T>(collection: string, field: string, value: string): Promise<T | null> {
  await ensureTables();
  const rows = await sql`
    SELECT data FROM sat_records
    WHERE collection = ${collection} AND data->>${field} = ${value}
    ORDER BY created_at DESC LIMIT 1
  `;
  return (rows[0]?.data ?? null) as T | null;
}

export async function readData<T>(collection: string): Promise<T[]> {
  await ensureTables();
  const rows = await sql`
    SELECT data FROM sat_records WHERE collection = ${collection} ORDER BY created_at ASC
  `;
  return rows.map((r) => r.data as T);
}

export async function deleteByField(collection: string, field: string, value: string): Promise<void> {
  await ensureTables();
  await sql`DELETE FROM sat_records WHERE collection = ${collection} AND data->>${field} = ${value}`;
}
