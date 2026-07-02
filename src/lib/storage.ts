import fs from "fs";
import path from "path";

const DIR = path.join(process.cwd(), "data");

function ensure() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
}

export function readData<T>(file: string): T[] {
  ensure();
  const p = path.join(DIR, file);
  if (!fs.existsSync(p)) return [];
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return [];
  }
}

export function appendData<T>(file: string, record: T): void {
  ensure();
  const p = path.join(DIR, file);
  const data = readData<T>(file);
  data.push(record);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
}

export function findByField<T>(file: string, field: string, value: string): T | null {
  const data = readData<T>(file);
  return (data as Record<string, unknown>[]).find((r) => r[field] === value) as T ?? null;
}
