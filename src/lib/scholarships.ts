import { sql } from "@/lib/db";

// "new" is the default every application starts in, before the founder acts
// on it — not a manually-chosen outcome, but still a real state so it needs
// to be a valid value. The scholarship_percentage field (100/75/50) already
// carries how much was approved, so "approved" doesn't need to be split.
export type ScholarshipStatus = "new" | "approved" | "waitlisted" | "not_selected";

export const SCHOLARSHIP_STATUSES: ScholarshipStatus[] = ["new", "approved", "waitlisted", "not_selected"];

export const SCHOLARSHIP_STATUS_LABELS: Record<ScholarshipStatus, string> = {
  new: "New",
  approved: "Approved",
  waitlisted: "Waitlisted",
  not_selected: "Not Selected",
};

export type IncomeRange =
  | "under_50k" | "50k_100k" | "100k_150k" | "150k_250k" | "above_250k" | "prefer_not_to_say";

export const INCOME_RANGE_LABELS: Record<IncomeRange, string> = {
  under_50k: "Under PKR 50,000",
  "50k_100k": "PKR 50,000–100,000",
  "100k_150k": "PKR 100,001–150,000",
  "150k_250k": "PKR 150,001–250,000",
  above_250k: "Above PKR 250,000",
  prefer_not_to_say: "Prefer to discuss privately",
};

export interface ScholarshipApplication {
  id: string;
  program: "sat" | "o-level";
  student_user_id: string | null;
  student_name: string;
  age: string;
  city: string;
  school: string | null;
  grade: string;
  subjects_required: string | null;
  exam_session: string;
  parent_name: string;
  parent_whatsapp: string;
  parent_email: string;
  parent_occupation: string | null;
  income_range: IncomeRange;
  financial_explanation: string;
  motivation: string;
  agrees_attendance_work: boolean;
  agrees_assessments_support: boolean;
  parent_commitment_agreed: boolean;
  status: ScholarshipStatus;
  scholarship_percentage: number | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS scholarship_applications (
      id TEXT PRIMARY KEY,
      program TEXT NOT NULL,
      student_user_id TEXT,
      student_name TEXT NOT NULL,
      age TEXT NOT NULL,
      city TEXT NOT NULL,
      school TEXT,
      grade TEXT NOT NULL,
      subjects_required TEXT,
      exam_session TEXT NOT NULL,
      parent_name TEXT NOT NULL,
      parent_whatsapp TEXT NOT NULL,
      parent_email TEXT NOT NULL,
      parent_occupation TEXT,
      income_range TEXT NOT NULL,
      financial_explanation TEXT NOT NULL,
      motivation TEXT NOT NULL,
      agrees_attendance_work BOOLEAN NOT NULL DEFAULT FALSE,
      agrees_assessments_support BOOLEAN NOT NULL DEFAULT FALSE,
      parent_commitment_agreed BOOLEAN NOT NULL DEFAULT FALSE,
      status TEXT NOT NULL DEFAULT 'new',
      scholarship_percentage INTEGER,
      admin_notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  // Applications are submitted with no account yet — student_user_id is only
  // set once the founder approves and an account gets created. A short-lived
  // earlier version of this table required it NOT NULL with a student_email
  // column; both are cleaned up here since neither made sense once account
  // creation moved to approval time instead of registration time.
  await sql`ALTER TABLE scholarship_applications ALTER COLUMN student_user_id DROP NOT NULL`;
  await sql`ALTER TABLE scholarship_applications DROP COLUMN IF EXISTS student_email`;
  tableReady = true;
}

export type NewScholarshipInput = {
  program: "sat" | "o-level";
  student_name: string;
  age: string;
  city: string;
  school: string | null;
  grade: string;
  subjects_required: string | null;
  exam_session: string;
  parent_name: string;
  parent_whatsapp: string;
  parent_email: string;
  parent_occupation: string | null;
  income_range: IncomeRange;
  financial_explanation: string;
  motivation: string;
  agrees_attendance_work: boolean;
  agrees_assessments_support: boolean;
  parent_commitment_agreed: boolean;
};

export async function createScholarshipApplication(input: NewScholarshipInput): Promise<ScholarshipApplication> {
  await ensureTable();
  const id = crypto.randomUUID();
  const rows = await sql`
    INSERT INTO scholarship_applications (
      id, program, student_name, age, city, school, grade, subjects_required, exam_session,
      parent_name, parent_whatsapp, parent_email, parent_occupation,
      income_range, financial_explanation, motivation,
      agrees_attendance_work, agrees_assessments_support, parent_commitment_agreed
    ) VALUES (
      ${id}, ${input.program}, ${input.student_name}, ${input.age}, ${input.city}, ${input.school}, ${input.grade}, ${input.subjects_required}, ${input.exam_session},
      ${input.parent_name}, ${input.parent_whatsapp}, ${input.parent_email}, ${input.parent_occupation},
      ${input.income_range}, ${input.financial_explanation}, ${input.motivation},
      ${input.agrees_attendance_work}, ${input.agrees_assessments_support}, ${input.parent_commitment_agreed}
    )
    RETURNING *
  `;
  return rows[0] as ScholarshipApplication;
}

export async function getScholarshipApplicationById(id: string): Promise<ScholarshipApplication | null> {
  await ensureTable();
  const rows = await sql`SELECT * FROM scholarship_applications WHERE id = ${id} LIMIT 1`;
  return (rows[0] as ScholarshipApplication) ?? null;
}

export async function listScholarshipApplications(): Promise<ScholarshipApplication[]> {
  await ensureTable();
  const rows = await sql`SELECT * FROM scholarship_applications ORDER BY created_at DESC`;
  return rows as ScholarshipApplication[];
}

export async function updateScholarshipStatus(
  id: string, status: ScholarshipStatus, scholarshipPercentage: number | null, adminNotes?: string
): Promise<ScholarshipApplication | null> {
  await ensureTable();
  const rows = await sql`
    UPDATE scholarship_applications
    SET status = ${status}, scholarship_percentage = ${scholarshipPercentage},
        admin_notes = COALESCE(${adminNotes ?? null}, admin_notes), updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return (rows[0] as ScholarshipApplication) ?? null;
}

export async function linkScholarshipAccount(id: string, studentUserId: string): Promise<void> {
  await ensureTable();
  await sql`UPDATE scholarship_applications SET student_user_id = ${studentUserId}, updated_at = NOW() WHERE id = ${id}`;
}

export async function deleteScholarshipApplication(id: string): Promise<void> {
  await ensureTable();
  await sql`DELETE FROM scholarship_applications WHERE id = ${id}`;
}
