import { sql } from "@/lib/db";

// Isolated module, same rationale as amnaShamimaQA.ts/amnaShamimaMaterials.ts —
// this program has no shared assignment system to plug into. Modeled on
// Google Classroom: a due date that doesn't block late work, just flags it;
// one submission per student per assignment (resubmitting replaces the
// previous file, same as Classroom "Resubmit" before grading); marks/feedback
// entered by staff.

export interface AmnaShamimaAssignment {
  id: string;
  title: string;
  description: string;
  attachment_url: string;
  due_at: string | null;
  max_marks: number | null;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AmnaShamimaAssignmentSubmission {
  id: string;
  assignment_id: string;
  student_email: string;
  student_name: string;
  file_url: string;
  is_late: boolean;
  marks: number | null;
  feedback: string | null;
  submitted_at: string;
  graded_at: string | null;
  graded_by: string | null;
}

let ready = false;
async function ensureTables() {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS amna_shamima_assignments (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      attachment_url TEXT DEFAULT '',
      due_at TIMESTAMPTZ,
      max_marks INTEGER,
      is_published BOOLEAN DEFAULT false,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS amna_shamima_assignment_submissions (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL,
      student_email TEXT NOT NULL,
      student_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      is_late BOOLEAN DEFAULT false,
      marks INTEGER,
      feedback TEXT,
      submitted_at TIMESTAMPTZ DEFAULT NOW(),
      graded_at TIMESTAMPTZ,
      graded_by TEXT,
      UNIQUE(assignment_id, student_email)
    )
  `;
  ready = true;
}

export async function getAllAssignments(): Promise<AmnaShamimaAssignment[]> {
  await ensureTables();
  const rows = await sql`SELECT * FROM amna_shamima_assignments ORDER BY created_at DESC`;
  return rows as AmnaShamimaAssignment[];
}

export async function getPublishedAssignments(): Promise<AmnaShamimaAssignment[]> {
  await ensureTables();
  const rows = await sql`SELECT * FROM amna_shamima_assignments WHERE is_published = true ORDER BY due_at ASC NULLS LAST, created_at DESC`;
  return rows as AmnaShamimaAssignment[];
}

export async function getAssignmentById(id: string): Promise<AmnaShamimaAssignment | null> {
  await ensureTables();
  const rows = await sql`SELECT * FROM amna_shamima_assignments WHERE id = ${id} LIMIT 1`;
  return (rows[0] as AmnaShamimaAssignment) ?? null;
}

export async function createAssignment(data: {
  title: string; description: string; attachment_url: string;
  due_at: string | null; max_marks: number | null; created_by: string;
}): Promise<string> {
  await ensureTables();
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO amna_shamima_assignments (id, title, description, attachment_url, due_at, max_marks, created_by)
    VALUES (${id}, ${data.title}, ${data.description}, ${data.attachment_url}, ${data.due_at}, ${data.max_marks}, ${data.created_by})
  `;
  return id;
}

export async function updateAssignment(id: string, data: { title: string; description: string; due_at: string | null; max_marks: number | null }): Promise<void> {
  await ensureTables();
  await sql`
    UPDATE amna_shamima_assignments
    SET title = ${data.title}, description = ${data.description}, due_at = ${data.due_at}, max_marks = ${data.max_marks}, updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function publishAssignment(id: string): Promise<void> {
  await ensureTables();
  await sql`UPDATE amna_shamima_assignments SET is_published = true, updated_at = NOW() WHERE id = ${id}`;
}

export async function unpublishAssignment(id: string): Promise<void> {
  await ensureTables();
  await sql`UPDATE amna_shamima_assignments SET is_published = false, updated_at = NOW() WHERE id = ${id}`;
}

export async function deleteAssignment(id: string): Promise<void> {
  await ensureTables();
  await sql`DELETE FROM amna_shamima_assignment_submissions WHERE assignment_id = ${id}`;
  await sql`DELETE FROM amna_shamima_assignments WHERE id = ${id}`;
}

export async function getSubmissionsForAssignment(assignmentId: string): Promise<AmnaShamimaAssignmentSubmission[]> {
  await ensureTables();
  const rows = await sql`SELECT * FROM amna_shamima_assignment_submissions WHERE assignment_id = ${assignmentId} ORDER BY submitted_at DESC`;
  return rows as AmnaShamimaAssignmentSubmission[];
}

export async function getSubmissionById(id: string): Promise<AmnaShamimaAssignmentSubmission | null> {
  await ensureTables();
  const rows = await sql`SELECT * FROM amna_shamima_assignment_submissions WHERE id = ${id} LIMIT 1`;
  return (rows[0] as AmnaShamimaAssignmentSubmission) ?? null;
}

export async function getSubmissionForStudent(assignmentId: string, studentEmail: string): Promise<AmnaShamimaAssignmentSubmission | null> {
  await ensureTables();
  const rows = await sql`
    SELECT * FROM amna_shamima_assignment_submissions
    WHERE assignment_id = ${assignmentId} AND student_email = ${studentEmail.toLowerCase().trim()}
    LIMIT 1
  `;
  return (rows[0] as AmnaShamimaAssignmentSubmission) ?? null;
}

// One row per (assignment, student) — resubmitting before the deadline (or
// after, since late submissions are allowed) replaces the previous file and
// clears any existing grade, same as Google Classroom un-grading a
// resubmission.
export async function upsertSubmission(data: {
  assignment_id: string; student_email: string; student_name: string; file_url: string; is_late: boolean;
}): Promise<string> {
  await ensureTables();
  const email = data.student_email.toLowerCase().trim();
  const existing = await getSubmissionForStudent(data.assignment_id, email);
  if (existing) {
    await sql`
      UPDATE amna_shamima_assignment_submissions
      SET file_url = ${data.file_url}, is_late = ${data.is_late}, student_name = ${data.student_name},
          submitted_at = NOW(), marks = NULL, feedback = NULL, graded_at = NULL, graded_by = NULL
      WHERE id = ${existing.id}
    `;
    return existing.id;
  }
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO amna_shamima_assignment_submissions (id, assignment_id, student_email, student_name, file_url, is_late)
    VALUES (${id}, ${data.assignment_id}, ${email}, ${data.student_name}, ${data.file_url}, ${data.is_late})
  `;
  return id;
}

export async function gradeSubmission(id: string, marks: number, feedback: string | null, gradedBy: string): Promise<void> {
  await ensureTables();
  await sql`
    UPDATE amna_shamima_assignment_submissions
    SET marks = ${marks}, feedback = ${feedback}, graded_at = NOW(), graded_by = ${gradedBy}
    WHERE id = ${id}
  `;
}

// Google Classroom's "Unsubmit" — reverts a turned-in assignment back to
// "not turned in" so the student can attach a different file and turn it in
// again. Only meaningful before grading; callers should block it afterward
// (the API route does).
export async function unsubmitAssignment(assignmentId: string, studentEmail: string): Promise<void> {
  await ensureTables();
  await sql`
    DELETE FROM amna_shamima_assignment_submissions
    WHERE assignment_id = ${assignmentId} AND student_email = ${studentEmail.toLowerCase().trim()}
  `;
}
