import { sql } from "@/lib/db";
import { marginalPriceForNextSubject } from "@/lib/academy/data";
import { listStudentsWithAccess } from "@/lib/users";
import { listOLevelAccessRequests } from "@/lib/olevelAccess";
import { findApprovedScholarshipForStudent } from "@/lib/scholarships";

// Must match the SAT unlock page's AMOUNT_DUE — kept as a separate constant
// here rather than imported, since that page's constant isn't exported and
// this is the only other place that needs to know the flat monthly fee.
const SAT_MONTHLY_FEE = 5300;

export type ChallanStatus = "unpaid" | "submitted" | "paid";
export type SubmissionStatus = "pending" | "verified" | "rejected";

export interface Challan {
  id: string;
  student_user_id: string;
  student_email: string;
  student_name: string | null;
  program: "sat" | "o-level";
  // Empty string (not NULL) for SAT rows — Postgres UNIQUE constraints treat
  // every NULL as distinct from every other NULL, which would let duplicate
  // SAT challans slip through for the same student/period.
  subject: string;
  period: string;
  amount_due: string;
  status: ChallanStatus;
  created_at: string;
  updated_at: string;
}

export interface ChallanSubmission {
  id: string;
  student_user_id: string;
  student_email: string;
  student_name: string;
  challan_ids: string;
  amount_paid: string;
  transaction_reference: string;
  payment_screenshot_url: string | null;
  status: SubmissionStatus;
  admin_notes: string | null;
  submitted_at: string;
  verified_at: string | null;
  verified_by: string | null;
}

let ready = false;
async function ensureTables() {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS challans (
      id TEXT PRIMARY KEY,
      student_user_id TEXT NOT NULL,
      student_email TEXT NOT NULL,
      student_name TEXT,
      program TEXT NOT NULL,
      subject TEXT NOT NULL DEFAULT '',
      period TEXT NOT NULL,
      amount_due NUMERIC NOT NULL,
      status TEXT NOT NULL DEFAULT 'unpaid',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(student_user_id, program, subject, period)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS challan_submissions (
      id TEXT PRIMARY KEY,
      student_user_id TEXT NOT NULL,
      student_email TEXT NOT NULL,
      student_name TEXT NOT NULL,
      challan_ids TEXT NOT NULL,
      amount_paid NUMERIC NOT NULL,
      transaction_reference TEXT NOT NULL,
      payment_screenshot_url TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      admin_notes TEXT,
      submitted_at TIMESTAMPTZ DEFAULT NOW(),
      verified_at TIMESTAMPTZ,
      verified_by TEXT
    )
  `;
  ready = true;
}

// Bulk-generates this period's challans for every currently-unlocked
// student. Idempotent — safe to click twice, existing (student, program,
// subject, period) rows are left alone. SAT gets one flat-fee challan per
// student; O-Level gets one challan per currently-unlocked subject, priced
// by that subject's position among the student's active subjects (same
// bundle tiers as the original unlock flow) so dropping a subject later
// correctly reprices whichever one(s) remain on the next generation run.
export async function generateMonthlyChallans(period: string): Promise<{ created: number; skipped: number }> {
  await ensureTables();
  let created = 0;
  let skipped = 0;

  // Scholarship students get 100% free access — they should never be billed.
  // Prune any still-unpaid challans a past (buggy) run created for them, on
  // top of skipping them below, so re-running Generate also cleans up
  // whatever's already there instead of leaving stale rows behind.
  await sql`
    DELETE FROM challans
    WHERE status = 'unpaid'
      AND student_user_id IN (SELECT student_user_id FROM scholarship_applications WHERE student_user_id IS NOT NULL AND status = 'approved')
  `;

  const satStudents = await listStudentsWithAccess();
  for (const s of satStudents) {
    if (s.access_level !== "unlocked") continue;
    if (await findApprovedScholarshipForStudent(s.id, "sat")) continue;
    const exists = await sql`
      SELECT id FROM challans WHERE student_user_id = ${s.id} AND program = 'sat' AND subject = '' AND period = ${period} LIMIT 1
    `;
    if (exists.length > 0) { skipped++; continue; }
    await sql`
      INSERT INTO challans (id, student_user_id, student_email, student_name, program, subject, period, amount_due)
      VALUES (${crypto.randomUUID()}, ${s.id}, ${s.email}, ${s.name}, 'sat', '', ${period}, ${SAT_MONTHLY_FEE})
    `;
    created++;
  }

  const oLevelRows = await listOLevelAccessRequests();
  const unlockedByEmail = new Map<string, { name: string | null; subjects: { subject: string; approved_at: string | null }[] }>();
  for (const r of oLevelRows) {
    if (r.status !== "unlocked") continue;
    if (!unlockedByEmail.has(r.email)) unlockedByEmail.set(r.email, { name: r.name, subjects: [] });
    unlockedByEmail.get(r.email)!.subjects.push({ subject: r.subject, approved_at: r.approved_at });
  }

  for (const [email, info] of unlockedByEmail) {
    const sortedSubjects = [...info.subjects].sort(
      (a, b) => new Date(a.approved_at ?? 0).getTime() - new Date(b.approved_at ?? 0).getTime()
    );
    const userRows = await sql`SELECT id FROM users WHERE email = ${email} AND program = 'o-level' LIMIT 1`;
    const studentUserId = userRows[0]?.id as string | undefined;
    if (!studentUserId) { skipped += sortedSubjects.length; continue; }
    if (await findApprovedScholarshipForStudent(studentUserId, "o-level")) continue;

    for (let i = 0; i < sortedSubjects.length; i++) {
      const subject = sortedSubjects[i].subject;
      const price = marginalPriceForNextSubject(i);
      const exists = await sql`
        SELECT id FROM challans WHERE student_user_id = ${studentUserId} AND program = 'o-level' AND subject = ${subject} AND period = ${period} LIMIT 1
      `;
      if (exists.length > 0) { skipped++; continue; }
      await sql`
        INSERT INTO challans (id, student_user_id, student_email, student_name, program, subject, period, amount_due)
        VALUES (${crypto.randomUUID()}, ${studentUserId}, ${email}, ${info.name}, 'o-level', ${subject}, ${period}, ${price})
      `;
      created++;
    }
  }

  return { created, skipped };
}

export async function listChallansForStudent(studentUserId: string): Promise<Challan[]> {
  await ensureTables();
  const rows = await sql`SELECT * FROM challans WHERE student_user_id = ${studentUserId} ORDER BY period DESC, created_at DESC`;
  return rows as Challan[];
}

export async function listAllChallans(): Promise<Challan[]> {
  await ensureTables();
  const rows = await sql`SELECT * FROM challans ORDER BY period DESC, created_at DESC`;
  return rows as Challan[];
}

export async function getChallanById(id: string): Promise<Challan | null> {
  await ensureTables();
  const rows = await sql`SELECT * FROM challans WHERE id = ${id} LIMIT 1`;
  return (rows[0] as Challan) ?? null;
}

export async function createSubmission(input: {
  studentUserId: string;
  studentEmail: string;
  studentName: string;
  challanIds: string[];
  amountPaid: number;
  transactionReference: string;
  paymentScreenshotUrl: string | null;
}): Promise<ChallanSubmission> {
  await ensureTables();
  const id = crypto.randomUUID();
  const challanIdsCsv = input.challanIds.join(",");
  const rows = await sql`
    INSERT INTO challan_submissions (
      id, student_user_id, student_email, student_name, challan_ids, amount_paid, transaction_reference, payment_screenshot_url
    )
    VALUES (
      ${id}, ${input.studentUserId}, ${input.studentEmail}, ${input.studentName}, ${challanIdsCsv},
      ${input.amountPaid}, ${input.transactionReference}, ${input.paymentScreenshotUrl}
    )
    RETURNING *
  `;
  for (const challanId of input.challanIds) {
    await sql`UPDATE challans SET status = 'submitted', updated_at = NOW() WHERE id = ${challanId}`;
  }
  return rows[0] as ChallanSubmission;
}

export async function listSubmissions(): Promise<ChallanSubmission[]> {
  await ensureTables();
  const rows = await sql`
    SELECT * FROM challan_submissions
    ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, submitted_at DESC
  `;
  return rows as ChallanSubmission[];
}

export async function getSubmissionById(id: string): Promise<ChallanSubmission | null> {
  await ensureTables();
  const rows = await sql`SELECT * FROM challan_submissions WHERE id = ${id} LIMIT 1`;
  return (rows[0] as ChallanSubmission) ?? null;
}

export async function verifySubmission(id: string, verifiedBy: string, notes?: string): Promise<ChallanSubmission | null> {
  await ensureTables();
  const rows = await sql`
    UPDATE challan_submissions
    SET status = 'verified', verified_at = NOW(), verified_by = ${verifiedBy}, admin_notes = COALESCE(${notes ?? null}, admin_notes)
    WHERE id = ${id}
    RETURNING *
  `;
  const submission = rows[0] as ChallanSubmission | undefined;
  if (!submission) return null;
  const challanIds = submission.challan_ids.split(",").filter(Boolean);
  for (const challanId of challanIds) {
    await sql`UPDATE challans SET status = 'paid', updated_at = NOW() WHERE id = ${challanId}`;
  }
  return submission;
}

export async function rejectSubmission(id: string, verifiedBy: string, notes?: string): Promise<ChallanSubmission | null> {
  await ensureTables();
  const rows = await sql`
    UPDATE challan_submissions
    SET status = 'rejected', verified_at = NOW(), verified_by = ${verifiedBy}, admin_notes = COALESCE(${notes ?? null}, admin_notes)
    WHERE id = ${id}
    RETURNING *
  `;
  const submission = rows[0] as ChallanSubmission | undefined;
  if (!submission) return null;
  const challanIds = submission.challan_ids.split(",").filter(Boolean);
  for (const challanId of challanIds) {
    await sql`UPDATE challans SET status = 'unpaid', updated_at = NOW() WHERE id = ${challanId}`;
  }
  return submission;
}
