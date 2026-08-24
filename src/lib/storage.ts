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

// Case-insensitive, returns every match — findByField only returns the
// single most recent one, which isn't right for "find the student(s) whose
// registration form named this parent email" (siblings can share a parent).
export async function findAllByFieldCI<T>(collection: string, field: string, value: string): Promise<T[]> {
  await ensureTables();
  const rows = await sql`
    SELECT data FROM sat_records
    WHERE collection = ${collection} AND LOWER(data->>${field}) = LOWER(${value})
    ORDER BY created_at DESC
  `;
  return rows.map((r) => r.data as T);
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

// Atomically bumps a numeric counter field inside the record's JSON, e.g.
// tracking workbook download counts. counterField is always a fixed string
// literal passed by call sites (never user input), so it's safe to splice
// into the jsonb_set path directly rather than parameterize.
export async function incrementCounter(collection: string, id: string, counterField: string): Promise<number> {
  await ensureTables();
  const rows = await sql`
    UPDATE sat_records
    SET data = jsonb_set(data, ARRAY[${counterField}], (COALESCE((data->>${counterField})::int, 0) + 1)::text::jsonb)
    WHERE collection = ${collection} AND id = ${id}
    RETURNING data
  `;
  const updated = rows[0]?.data as Record<string, unknown> | undefined;
  return (updated?.[counterField] as number) ?? 0;
}
