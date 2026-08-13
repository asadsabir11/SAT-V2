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
  // Migrate role constraint to include 'parent'
  await sql`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check`;
  await sql`ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'founder', 'parent'))`;
  usersReady = true;
}

export async function createUser(
  email: string,
  password: string,
  role: "student" | "founder" | "parent",
  name: string,
  program: "sat" | "o-level" = "sat"
): Promise<string> {
  await ensureUsersTable();
  const id = crypto.randomUUID();
  const hash = await bcrypt.hash(password, 10);
  await sql`
    INSERT INTO users (id, email, password_hash, role, name, program)
    VALUES (${id}, ${email.toLowerCase().trim()}, ${hash}, ${role}, ${name}, ${program})
    ON CONFLICT (email) DO NOTHING
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

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getStudentAccessLevel(email: string): Promise<"free" | "pending" | "unlocked"> {
  await ensureUsersTable();
  const rows = await sql`SELECT access_level FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1`;
  const level = rows[0]?.access_level ?? "free";
  if (level === "pending" || level === "unlocked") return level;
  return "free";
}

export async function requestAccess(email: string): Promise<void> {
  await ensureUsersTable();
  await sql`
    UPDATE users
    SET access_level = 'pending', payment_requested_at = NOW()
    WHERE email = ${email.toLowerCase().trim()} AND access_level = 'free'
  `;
}

export async function grantAccess(email: string, approvedBy: string, notes?: string): Promise<void> {
  await ensureUsersTable();
  await sql`
    UPDATE users
    SET access_level = 'unlocked', approved_at = NOW(), approved_by = ${approvedBy}, notes = ${notes ?? null}
    WHERE email = ${email.toLowerCase().trim()}
  `;
}

export async function revokeAccess(email: string): Promise<void> {
  await ensureUsersTable();
  await sql`
    UPDATE users
    SET access_level = 'free', approved_at = NULL, approved_by = NULL, payment_requested_at = NULL
    WHERE email = ${email.toLowerCase().trim()}
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
}

export async function listStudentsWithAccess(): Promise<StudentAccessRow[]> {
  await ensureUsersTable();
  const rows = await sql`
    SELECT id, email, name, created_at, access_level, payment_requested_at, approved_at, approved_by, notes
    FROM users
    WHERE role = 'student'
    ORDER BY
      CASE access_level WHEN 'pending' THEN 0 WHEN 'free' THEN 1 ELSE 2 END,
      created_at DESC
  `;
  return rows as StudentAccessRow[];
}
