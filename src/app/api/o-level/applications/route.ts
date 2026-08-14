import { NextRequest, NextResponse } from "next/server";
import { createApplication, SUBJECT_OPTIONS, TARGET_EXAM_SESSIONS, type SubjectOption, type TargetExamSession } from "@/lib/olevelApplications";
import { sendOLevelApplicationConfirmation, sendOLevelApplicationAdminAlert } from "@/lib/email";

const VALID_SUBJECTS = new Set(SUBJECT_OPTIONS.map((s) => s.value));
const VALID_SESSIONS = new Set(TARGET_EXAM_SESSIONS.map((s) => s.value));

const REQUIRED_FIELDS = [
  "parentName", "parentEmail", "parentWhatsapp", "studentName", "studentGrade",
  "city", "subject", "preferredClassTime", "targetExamSession", "consent",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const missing = REQUIRED_FIELDS.filter((f) => {
      const v = body[f];
      return typeof v !== "string" || !v.trim();
    });
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}` }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(body.parentEmail.trim())) {
      return NextResponse.json({ error: "Enter a valid parent email address" }, { status: 400 });
    }
    if (!VALID_SUBJECTS.has(body.subject as SubjectOption)) {
      return NextResponse.json({ error: "Invalid subject selection" }, { status: 400 });
    }
    if (!VALID_SESSIONS.has(body.targetExamSession as TargetExamSession)) {
      return NextResponse.json({ error: "Invalid target exam session" }, { status: 400 });
    }

    const application = await createApplication({
      parent_name: body.parentName.trim(),
      parent_email: body.parentEmail.trim().toLowerCase(),
      parent_whatsapp: body.parentWhatsapp.trim(),
      student_name: body.studentName.trim(),
      student_grade: body.studentGrade.trim(),
      school_name: body.schoolName?.trim() || null,
      city: body.city.trim(),
      subject: body.subject as SubjectOption,
      preferred_class_time: body.preferredClassTime.trim(),
      target_exam_session: body.targetExamSession as TargetExamSession,
      source: body.source?.trim() || null,
      utm_source: body.utm_source?.trim() || null,
      utm_medium: body.utm_medium?.trim() || null,
      utm_campaign: body.utm_campaign?.trim() || null,
      utm_content: body.utm_content?.trim() || null,
      utm_term: body.utm_term?.trim() || null,
      fbclid: body.fbclid?.trim() || null,
    });

    sendOLevelApplicationConfirmation(application).catch(console.error);
    sendOLevelApplicationAdminAlert(application).catch(console.error);

    return NextResponse.json({ id: application.id });
  } catch (error) {
    console.error("O-Level application submission failed", error);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
