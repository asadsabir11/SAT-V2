import { sql } from "@/lib/db";
import type { ALevelLectureCategory } from "@/lib/lectures";

// Same Google Classroom shape as oLevelAssignments.ts (late submissions
// flagged not blocking, one submission per student replacing the last,
// Unsubmit before grading), category-scoped since A-Level access is now
// per-subject (CS 9618 Vol 1 / Vol 2), not flat.

export interface ALevelAssignment {
  id: string;
  title: string;
  description: string;
  attachment_url: string;
  category: ALevelLectureCategory;
  due_at: string | null;
  max_marks: number | null;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ALevelAssignmentSubmission {
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
    CREATE TABLE IF NOT EXISTS a_level_assignments (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      attachment_url TEXT DEFAULT '',
      category TEXT NOT NULL DEFAULT 'computer-science-vol1',
      due_at TIMESTAMPTZ,
      max_marks INTEGER,
      is_published BOOLEAN DEFAULT false,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS a_level_assignment_submissions (
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
  // Table may already exist from before the Vol 1/Vol 2 split.
  await sql`ALTER TABLE a_level_assignments ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'computer-science-vol1'`;
  ready = true;
}

export async function getAllALevelAssignments(): Promise<ALevelAssignment[]> {
  await ensureTables();
  const rows = await sql`SELECT * FROM a_level_assignments ORDER BY created_at DESC`;
  return rows as ALevelAssignment[];
}

export async function getPublishedALevelAssignments(): Promise<ALevelAssignment[]> {
  await ensureTables();
  const rows = await sql`SELECT * FROM a_level_assignments WHERE is_published = true ORDER BY due_at ASC NULLS LAST, created_at DESC`;
  return rows as ALevelAssignment[];
}

export async function getALevelAssignmentById(id: string): Promise<ALevelAssignment | null> {
  await ensureTables();
  const rows = await sql`SELECT * FROM a_level_assignments WHERE id = ${id} LIMIT 1`;
  return (rows[0] as ALevelAssignment) ?? null;
}

export async function createALevelAssignment(data: {
  title: string; description: string; attachment_url: string; category: ALevelLectureCategory;
  due_at: string | null; max_marks: number | null; created_by: string;
}): Promise<string> {
  await ensureTables();
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO a_level_assignments (id, title, description, attachment_url, category, due_at, max_marks, created_by)
    VALUES (${id}, ${data.title}, ${data.description}, ${data.attachment_url}, ${data.category}, ${data.due_at}, ${data.max_marks}, ${data.created_by})
  `;
  return id;
}

export async function updateALevelAssignment(id: string, data: { title: string; description: string; category: ALevelLectureCategory; due_at: string | null; max_marks: number | null }): Promise<void> {
  await ensureTables();
  await sql`
    UPDATE a_level_assignments
    SET title = ${data.title}, description = ${data.description}, category = ${data.category}, due_at = ${data.due_at}, max_marks = ${data.max_marks}, updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function publishALevelAssignment(id: string): Promise<void> {
  await ensureTables();
  await sql`UPDATE a_level_assignments SET is_published = true, updated_at = NOW() WHERE id = ${id}`;
}

export async function unpublishALevelAssignment(id: string): Promise<void> {
  await ensureTables();
  await sql`UPDATE a_level_assignments SET is_published = false, updated_at = NOW() WHERE id = ${id}`;
}

export async function deleteALevelAssignment(id: string): Promise<void> {
  await ensureTables();
  await sql`DELETE FROM a_level_assignment_submissions WHERE assignment_id = ${id}`;
  await sql`DELETE FROM a_level_assignments WHERE id = ${id}`;
}

export async function getALevelSubmissionsForAssignment(assignmentId: string): Promise<ALevelAssignmentSubmission[]> {
  await ensureTables();
  const rows = await sql`SELECT * FROM a_level_assignment_submissions WHERE assignment_id = ${assignmentId} ORDER BY submitted_at DESC`;
  return rows as ALevelAssignmentSubmission[];
}

export async function getALevelSubmissionById(id: string): Promise<ALevelAssignmentSubmission | null> {
  await ensureTables();
  const rows = await sql`SELECT * FROM a_level_assignment_submissions WHERE id = ${id} LIMIT 1`;
  return (rows[0] as ALevelAssignmentSubmission) ?? null;
}

export async function getALevelSubmissionForStudent(assignmentId: string, studentEmail: string): Promise<ALevelAssignmentSubmission | null> {
  await ensureTables();
  const rows = await sql`
    SELECT * FROM a_level_assignment_submissions
    WHERE assignment_id = ${assignmentId} AND student_email = ${studentEmail.toLowerCase().trim()}
    LIMIT 1
  `;
  return (rows[0] as ALevelAssignmentSubmission) ?? null;
}

export async function upsertALevelSubmission(data: {
  assignment_id: string; student_email: string; student_name: string; file_url: string; is_late: boolean;
}): Promise<string> {
  await ensureTables();
  const email = data.student_email.toLowerCase().trim();
  const existing = await getALevelSubmissionForStudent(data.assignment_id, email);
  if (existing) {
    await sql`
      UPDATE a_level_assignment_submissions
      SET file_url = ${data.file_url}, is_late = ${data.is_late}, student_name = ${data.student_name},
          submitted_at = NOW(), marks = NULL, feedback = NULL, graded_at = NULL, graded_by = NULL
      WHERE id = ${existing.id}
    `;
    return existing.id;
  }
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO a_level_assignment_submissions (id, assignment_id, student_email, student_name, file_url, is_late)
    VALUES (${id}, ${data.assignment_id}, ${email}, ${data.student_name}, ${data.file_url}, ${data.is_late})
  `;
  return id;
}

export async function gradeALevelSubmission(id: string, marks: number, feedback: string | null, gradedBy: string): Promise<void> {
  await ensureTables();
  await sql`
    UPDATE a_level_assignment_submissions
    SET marks = ${marks}, feedback = ${feedback}, graded_at = NOW(), graded_by = ${gradedBy}
    WHERE id = ${id}
  `;
}

export async function unsubmitALevelAssignment(assignmentId: string, studentEmail: string): Promise<void> {
  await ensureTables();
  await sql`
    DELETE FROM a_level_assignment_submissions
    WHERE assignment_id = ${assignmentId} AND student_email = ${studentEmail.toLowerCase().trim()}
  `;
}
