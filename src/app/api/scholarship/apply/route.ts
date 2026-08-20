import { NextRequest, NextResponse } from "next/server";
import { createScholarshipApplication, type IncomeRange } from "@/lib/scholarships";
import { sendScholarshipApplicationAdminAlert } from "@/lib/email";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { isValidEmail } from "@/lib/validators";

const VALID_INCOME_RANGES: IncomeRange[] = [
  "under_50k", "50k_100k", "100k_150k", "150k_250k", "above_250k", "prefer_not_to_say",
];

const REQUIRED_FIELDS = [
  "program", "studentName", "age", "city", "grade", "examSession",
  "parentName", "parentWhatsapp", "parentEmail", "incomeRange",
  "financialExplanation", "motivation",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Honeypot — bots tend to fill every field; humans never see this one.
    if (typeof body.website === "string" && body.website.trim()) {
      return NextResponse.json({ ok: true });
    }

    const allowed = await checkRateLimit(`scholarship-apply:${clientIp(req)}`, 5, 60);
    if (!allowed) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const missing = REQUIRED_FIELDS.filter((f) => typeof body[f] !== "string" || !body[f].trim());
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}` }, { status: 400 });
    }
    if (body.program !== "sat" && body.program !== "o-level") {
      return NextResponse.json({ error: "Invalid program" }, { status: 400 });
    }
    if (!VALID_INCOME_RANGES.includes(body.incomeRange)) {
      return NextResponse.json({ error: "Invalid income range" }, { status: 400 });
    }
    const parentEmail = String(body.parentEmail).trim().toLowerCase();
    if (!isValidEmail(parentEmail)) {
      return NextResponse.json({ error: "Enter a valid parent email address" }, { status: 400 });
    }
    if (body.agreesAttendanceWork !== true || body.agreesAssessmentsSupport !== true || body.parentCommitmentAgreed !== true || body.privacyConsent !== true) {
      return NextResponse.json({ error: "All commitment and consent confirmations are required" }, { status: 400 });
    }

    const application = await createScholarshipApplication({
      program: body.program,
      student_name: String(body.studentName).trim(),
      age: String(body.age).trim(),
      city: String(body.city).trim(),
      school: body.school?.trim() || null,
      grade: String(body.grade).trim(),
      subjects_required: body.subjectsRequired?.trim() || null,
      exam_session: String(body.examSession).trim(),
      parent_name: String(body.parentName).trim(),
      parent_whatsapp: String(body.parentWhatsapp).trim(),
      parent_email: parentEmail,
      parent_occupation: body.parentOccupation?.trim() || null,
      income_range: body.incomeRange,
      financial_explanation: String(body.financialExplanation).trim(),
      motivation: String(body.motivation).trim(),
      agrees_attendance_work: true,
      agrees_assessments_support: true,
      parent_commitment_agreed: true,
    });

    sendScholarshipApplicationAdminAlert({
      program: application.program,
      studentName: application.student_name,
      age: application.age,
      city: application.city,
      grade: application.grade,
      parentName: application.parent_name,
      parentEmail: application.parent_email,
      parentWhatsapp: application.parent_whatsapp,
      incomeRange: application.income_range,
    }).catch(console.error);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Scholarship application failed", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
