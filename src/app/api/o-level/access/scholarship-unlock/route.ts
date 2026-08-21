import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOLevelSubjectAccess, grantOLevelAccess } from "@/lib/olevelAccess";
import { OLEVEL_LECTURE_CATEGORIES, type OLevelLectureCategory } from "@/lib/lectures";
import { findApprovedScholarshipForStudent } from "@/lib/scholarships";
import { sendOLevelAccessGranted } from "@/lib/email";

// Self-service unlock for the "I'm a scholarship student" checkbox on the
// O-Level unlock page — skips the payment form entirely and instead checks
// the logged-in account against approved scholarships, matching the
// program-level scholarship (any approved O-Level scholarship covers any
// subject, same as the founder manually granting access would).
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { subject } = body;
  if (!subject || !OLEVEL_LECTURE_CATEGORIES.includes(subject)) {
    return NextResponse.json({ error: "A valid subject is required" }, { status: 400 });
  }
  const sub = subject as OLevelLectureCategory;

  const current = await getOLevelSubjectAccess(session.email, sub);
  if (current === "unlocked") {
    return NextResponse.json({ ok: true, status: "unlocked" });
  }

  const scholarship = await findApprovedScholarshipForStudent(session.id, "o-level");
  if (!scholarship) {
    return NextResponse.json(
      { error: "We couldn't find an approved Opportunity Scholarship linked to your account. Please pay the amount to unlock this subject." },
      { status: 403 }
    );
  }

  await grantOLevelAccess(session.email, sub, "scholarship", `Opportunity Scholarship ${scholarship.id} — self-service unlock, no payment`);
  await sendOLevelAccessGranted({ email: session.email, name: session.name, subject: sub }).catch(console.error);

  return NextResponse.json({ ok: true, status: "unlocked" });
}
