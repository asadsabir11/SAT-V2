import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.POSTGRES_URL!);

async function ensureUsersTable() {
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
}

export async function createUser(
  email: string,
  password: string,
  role: "student" | "founder",
  name: string
): Promise<string> {
  await ensureUsersTable();
  const id = crypto.randomUUID();
  const hash = await bcrypt.hash(password, 10);
  await sql`
    INSERT INTO users (id, email, password_hash, role, name)
    VALUES (${id}, ${email.toLowerCase().trim()}, ${hash}, ${role}, ${name})
    ON CONFLICT (email) DO NOTHING
  `;
  return id;
}

export async function findUserByEmail(email: string) {
  await ensureUsersTable();
  const rows = await sql`
    SELECT * FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
