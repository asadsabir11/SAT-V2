import { sql } from "@/lib/db";
import type { OLevelLectureCategory } from "@/lib/lectures";

// Same Google Classroom shape as amnaShamimaAssignments.ts (late submissions
// flagged not blocked, one submission per student replacing the last,
// Unsubmit before grading) but subject-scoped, since O-Level access is
// per-subject rather than flat. Kept as its own module rather than widening
// the Amna Shamima one — filtering to a student's unlocked subjects happens
// in JS at the call site (mirrors getOLevelAccessMap's own callers), not
// here, to avoid a dynamic IN/ANY list against the `sql` tagged template.

export interface OLevelAssignment {
  id: string;
  title: string;
  description: string;
  attachment_url: string;
  category: OLevelLectureCategory;
  due_at: string | null;
  max_marks: number | null;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface OLevelAssignmentSubmission {
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
    CREATE TABLE IF NOT EXISTS o_level_assignments (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      attachment_url TEXT DEFAULT '',
      category TEXT NOT NULL,
      due_at TIMESTAMPTZ,
      max_marks INTEGER,
      is_published BOOLEAN DEFAULT false,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS o_level_assignment_submissions (
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

export async function getAllAssignments(): Promise<OLevelAssignment[]> {
  await ensureTables();
  const rows = await sql`SELECT * FROM o_level_assignments ORDER BY created_at DESC`;
  return rows as OLevelAssignment[];
}

export async function getPublishedAssignments(): Promise<OLevelAssignment[]> {
  await ensureTables();
  const rows = await sql`SELECT * FROM o_level_assignments WHERE is_published = true ORDER BY due_at ASC NULLS LAST, created_at DESC`;
  return rows as OLevelAssignment[];
}

export async function getAssignmentById(id: string): Promise<OLevelAssignment | null> {
  await ensureTables();
  const rows = await sql`SELECT * FROM o_level_assignments WHERE id = ${id} LIMIT 1`;
  return (rows[0] as OLevelAssignment) ?? null;
}

export async function createAssignment(data: {
  title: string; description: string; attachment_url: string; category: string;
  due_at: string | null; max_marks: number | null; created_by: string;
}): Promise<string> {
  await ensureTables();
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO o_level_assignments (id, title, description, attachment_url, category, due_at, max_marks, created_by)
    VALUES (${id}, ${data.title}, ${data.description}, ${data.attachment_url}, ${data.category}, ${data.due_at}, ${data.max_marks}, ${data.created_by})
  `;
  return id;
}

export async function updateAssignment(id: string, data: { title: string; description: string; category: string; due_at: string | null; max_marks: number | null }): Promise<void> {
  await ensureTables();
  await sql`
    UPDATE o_level_assignments
    SET title = ${data.title}, description = ${data.description}, category = ${data.category}, due_at = ${data.due_at}, max_marks = ${data.max_marks}, updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function publishAssignment(id: string): Promise<void> {
  await ensureTables();
  await sql`UPDATE o_level_assignments SET is_published = true, updated_at = NOW() WHERE id = ${id}`;
}

export async function unpublishAssignment(id: string): Promise<void> {
  await ensureTables();
  await sql`UPDATE o_level_assignments SET is_published = false, updated_at = NOW() WHERE id = ${id}`;
}

export async function deleteAssignment(id: string): Promise<void> {
  await ensureTables();
  await sql`DELETE FROM o_level_assignment_submissions WHERE assignment_id = ${id}`;
  await sql`DELETE FROM o_level_assignments WHERE id = ${id}`;
}

export async function getSubmissionsForAssignment(assignmentId: string): Promise<OLevelAssignmentSubmission[]> {
  await ensureTables();
  const rows = await sql`SELECT * FROM o_level_assignment_submissions WHERE assignment_id = ${assignmentId} ORDER BY submitted_at DESC`;
  return rows as OLevelAssignmentSubmission[];
}

export async function getSubmissionById(id: string): Promise<OLevelAssignmentSubmission | null> {
  await ensureTables();
  const rows = await sql`SELECT * FROM o_level_assignment_submissions WHERE id = ${id} LIMIT 1`;
  return (rows[0] as OLevelAssignmentSubmission) ?? null;
}

export async function getSubmissionForStudent(assignmentId: string, studentEmail: string): Promise<OLevelAssignmentSubmission | null> {
  await ensureTables();
  const rows = await sql`
    SELECT * FROM o_level_assignment_submissions
    WHERE assignment_id = ${assignmentId} AND student_email = ${studentEmail.toLowerCase().trim()}
    LIMIT 1
  `;
  return (rows[0] as OLevelAssignmentSubmission) ?? null;
}

export async function upsertSubmission(data: {
  assignment_id: string; student_email: string; student_name: string; file_url: string; is_late: boolean;
}): Promise<string> {
  await ensureTables();
  const email = data.student_email.toLowerCase().trim();
  const existing = await getSubmissionForStudent(data.assignment_id, email);
  if (existing) {
    await sql`
      UPDATE o_level_assignment_submissions
      SET file_url = ${data.file_url}, is_late = ${data.is_late}, student_name = ${data.student_name},
          submitted_at = NOW(), marks = NULL, feedback = NULL, graded_at = NULL, graded_by = NULL
      WHERE id = ${existing.id}
    `;
    return existing.id;
  }
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO o_level_assignment_submissions (id, assignment_id, student_email, student_name, file_url, is_late)
    VALUES (${id}, ${data.assignment_id}, ${email}, ${data.student_name}, ${data.file_url}, ${data.is_late})
  `;
  return id;
}

export async function gradeSubmission(id: string, marks: number, feedback: string | null, gradedBy: string): Promise<void> {
  await ensureTables();
  await sql`
    UPDATE o_level_assignment_submissions
    SET marks = ${marks}, feedback = ${feedback}, graded_at = NOW(), graded_by = ${gradedBy}
    WHERE id = ${id}
  `;
}

export async function unsubmitAssignment(assignmentId: string, studentEmail: string): Promise<void> {
  await ensureTables();
  await sql`
    DELETE FROM o_level_assignment_submissions
    WHERE assignment_id = ${assignmentId} AND student_email = ${studentEmail.toLowerCase().trim()}
  `;
}
