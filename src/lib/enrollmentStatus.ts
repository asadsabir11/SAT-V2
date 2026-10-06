import { sql } from "@/lib/db";

// Admin-controlled "Fully Booked" badge for the home page's three program
// cards — Option A from the discussion: badge only, the Explore button and
// signup flow stay exactly as they are. A program with no row yet defaults
// to "open" rather than needing to be pre-seeded.

export type EnrollmentProgram = "sat" | "o-level" | "punjab-9th";
export type EnrollmentStatus = "open" | "full";

let ready = false;
async function ensureTable() {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS program_enrollment_status (
      program TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'open',
      updated_by TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  ready = true;
}

const ALL_PROGRAMS: EnrollmentProgram[] = ["sat", "o-level", "punjab-9th"];

export async function getEnrollmentStatuses(): Promise<Record<EnrollmentProgram, EnrollmentStatus>> {
  await ensureTable();
  const rows = await sql`SELECT program, status FROM program_enrollment_status`;
  const map: Record<EnrollmentProgram, EnrollmentStatus> = { sat: "open", "o-level": "open", "punjab-9th": "open" };
  for (const r of rows) {
    const program = r.program as EnrollmentProgram;
    if (ALL_PROGRAMS.includes(program)) map[program] = (r.status as EnrollmentStatus) === "full" ? "full" : "open";
  }
  return map;
}

export async function setEnrollmentStatus(program: EnrollmentProgram, status: EnrollmentStatus, updatedBy: string): Promise<void> {
  await ensureTable();
  await sql`
    INSERT INTO program_enrollment_status (program, status, updated_by, updated_at)
    VALUES (${program}, ${status}, ${updatedBy}, NOW())
    ON CONFLICT (program) DO UPDATE SET status = ${status}, updated_by = ${updatedBy}, updated_at = NOW()
  `;
}
