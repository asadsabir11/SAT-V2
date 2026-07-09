import fs from "fs";
import path from "path";

// Vercel's deployment filesystem is read-only — only /tmp is writable.
// Locally we use /data next to the project root.
const DIR = process.env.VERCEL
  ? "/tmp/sat-data"
  : path.join(process.cwd(), "data");

function ensure() {
  try {
    if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
  } catch {
    // read-only filesystem on serverless — skip silently
  }
}

export function readData<T>(file: string): T[] {
  ensure();
  try {
    const p = path.join(DIR, file);
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return [];
  }
}

export function appendData<T>(file: string, record: T): void {
  ensure();
  try {
    const p = path.join(DIR, file);
    const data = readData<T>(file);
    data.push(record);
    fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // On Vercel, writes to /tmp are ephemeral per-instance — silently continue.
    // The n8n webhook is the primary persistent storage in production.
  }
}

export function findByField<T>(file: string, field: string, value: string): T | null {
  const data = readData<T>(file);
  return (data as Record<string, unknown>[]).find((r) => r[field] === value) as T ?? null;
}
