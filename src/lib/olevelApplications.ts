import { sql } from "@/lib/db";
import type { OLevelLectureCategory } from "@/lib/lectures";
import {
  amountDueForSubject,
  type SubjectOption,
  type TargetExamSession,
  type PaymentMethod,
} from "@/lib/olevelApplicationOptions";

export { SUBJECT_OPTIONS, TARGET_EXAM_SESSIONS, amountDueForSubject, type SubjectOption, type TargetExamSession, type PaymentMethod } from "@/lib/olevelApplicationOptions";

export type ApplicationStatus =
  | "new_application"
  | "contact_required"
  | "assessment_scheduled"
  | "assessment_completed"
  | "awaiting_payment"
  | "payment_submitted"
  | "payment_verified"
  | "enrolled"
  | "waiting_list"
  | "declined"
  | "refunded"
  | "cancelled";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "new_application", "contact_required", "assessment_scheduled", "assessment_completed",
  "awaiting_payment", "payment_submitted", "payment_verified", "enrolled",
  "waiting_list", "declined", "refunded", "cancelled",
];

// Waitlist subjects don't correspond to a live cohort yet — nothing to grant access to.
const GRANT_SUBJECTS: Record<SubjectOption, OLevelLectureCategory[]> = {
  "english-language": ["english-language"],
  "mathematics": ["mathematics"],
  "english-language+mathematics": ["english-language", "mathematics"],
  "computer-science-waitlist": [],
  "islamiyat-waitlist": [],
  "pakistan-studies-waitlist": [],
};

export function subjectsToGrant(subject: SubjectOption): OLevelLectureCategory[] {
  return GRANT_SUBJECTS[subject] ?? [];
}

export interface OLevelApplication {
  id: string;
  parent_name: string;
  parent_email: string;
  parent_whatsapp: string;
  student_name: string;
  student_grade: string;
  school_name: string | null;
  city: string;
  subject: SubjectOption;
  preferred_class_time: string;
  target_exam_session: TargetExamSession;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbclid: string | null;
  status: ApplicationStatus;
  amount_due: number | null;
  payment_method: PaymentMethod | null;
  amount_paid: number | null;
  transaction_reference: string | null;
  payment_date: string | null;
  payer_account_name: string | null;
  payment_screenshot_url: string | null;
  payment_note: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS olevel_applications (
      id TEXT PRIMARY KEY,
      parent_name TEXT NOT NULL,
      parent_email TEXT NOT NULL,
      parent_whatsapp TEXT NOT NULL,
      student_name TEXT NOT NULL,
      student_grade TEXT NOT NULL,
      school_name TEXT,
      city TEXT NOT NULL,
      subject TEXT NOT NULL,
      preferred_class_time TEXT NOT NULL,
      target_exam_session TEXT NOT NULL,
      source TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_content TEXT,
      utm_term TEXT,
      fbclid TEXT,
      status TEXT NOT NULL DEFAULT 'new_application',
      amount_due NUMERIC,
      payment_method TEXT,
      amount_paid NUMERIC,
      transaction_reference TEXT,
      payment_date DATE,
      payer_account_name TEXT,
      payment_screenshot_url TEXT,
      payment_note TEXT,
      admin_notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  tableReady = true;
}

export type NewApplicationInput = {
  parent_name: string;
  parent_email: string;
  parent_whatsapp: string;
  student_name: string;
  student_grade: string;
  school_name: string | null;
  city: string;
  subject: SubjectOption;
  preferred_class_time: string;
  target_exam_session: TargetExamSession;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbclid: string | null;
};

export async function createApplication(input: NewApplicationInput): Promise<OLevelApplication> {
  await ensureTable();
  const id = crypto.randomUUID();
  const amountDue = amountDueForSubject(input.subject);
  const rows = await sql`
    INSERT INTO olevel_applications (
      id, parent_name, parent_email, parent_whatsapp, student_name, student_grade, school_name, city,
      subject, preferred_class_time, target_exam_session, source,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid,
      status, amount_due
    ) VALUES (
      ${id}, ${input.parent_name}, ${input.parent_email}, ${input.parent_whatsapp}, ${input.student_name}, ${input.student_grade}, ${input.school_name}, ${input.city},
      ${input.subject}, ${input.preferred_class_time}, ${input.target_exam_session}, ${input.source},
      ${input.utm_source}, ${input.utm_medium}, ${input.utm_campaign}, ${input.utm_content}, ${input.utm_term}, ${input.fbclid},
      'new_application', ${amountDue}
    )
    RETURNING *
  `;
  return rows[0] as OLevelApplication;
}

export async function getApplicationById(id: string): Promise<OLevelApplication | null> {
  await ensureTable();
  const rows = await sql`SELECT * FROM olevel_applications WHERE id = ${id} LIMIT 1`;
  return (rows[0] as OLevelApplication) ?? null;
}

export async function submitPayment(id: string, input: {
  payment_method: PaymentMethod;
  amount_paid: number;
  transaction_reference: string;
  payment_date: string;
  payer_account_name: string;
  payment_screenshot_url: string | null;
  payment_note: string | null;
}): Promise<OLevelApplication | null> {
  await ensureTable();
  const rows = await sql`
    UPDATE olevel_applications SET
      payment_method = ${input.payment_method},
      amount_paid = ${input.amount_paid},
      transaction_reference = ${input.transaction_reference},
      payment_date = ${input.payment_date},
      payer_account_name = ${input.payer_account_name},
      payment_screenshot_url = ${input.payment_screenshot_url},
      payment_note = ${input.payment_note},
      status = 'payment_submitted',
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return (rows[0] as OLevelApplication) ?? null;
}

export async function listApplications(): Promise<OLevelApplication[]> {
  await ensureTable();
  const rows = await sql`SELECT * FROM olevel_applications ORDER BY created_at DESC`;
  return rows as OLevelApplication[];
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus, adminNotes?: string): Promise<OLevelApplication | null> {
  await ensureTable();
  const rows = await sql`
    UPDATE olevel_applications
    SET status = ${status}, admin_notes = COALESCE(${adminNotes ?? null}, admin_notes), updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return (rows[0] as OLevelApplication) ?? null;
}

export async function updateApplicationNotes(id: string, adminNotes: string): Promise<void> {
  await ensureTable();
  await sql`UPDATE olevel_applications SET admin_notes = ${adminNotes}, updated_at = NOW() WHERE id = ${id}`;
}
