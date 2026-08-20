import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/auth";
import {
  getScholarshipApplicationById, updateScholarshipStatus, linkScholarshipAccount, deleteScholarshipApplication,
  SCHOLARSHIP_STATUSES, SCHOLARSHIP_ACCOUNT_CREATING_STATUSES, type ScholarshipStatus,
} from "@/lib/scholarships";
import { findUserByEmailAndProgram, createUser } from "@/lib/users";
import { createResetToken } from "@/lib/passwordReset";
import { sendScholarshipAccountWelcome } from "@/lib/email";

const APP_URL = "https://academy.thedigitaltutor.net";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const before = await getScholarshipApplicationById(id);
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  const status = body.status as ScholarshipStatus;
  if (!SCHOLARSHIP_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const percentage = body.scholarshipPercentage === null || body.scholarshipPercentage === undefined
    ? null
    : Number(body.scholarshipPercentage);
  if (percentage !== null && (Number.isNaN(percentage) || percentage < 0 || percentage > 100)) {
    return NextResponse.json({ error: "Scholarship percentage must be between 0 and 100" }, { status: 400 });
  }

  let updated = await updateScholarshipStatus(id, status, percentage, body.adminNotes);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Approving (for the first time) creates the student's login — a
  // throwaway password, never shared with anyone, plus an emailed
  // set-password link. Mirrors how teacher/parent accounts are created.
  // Skipped if this application already has a linked account (e.g. status
  // toggled back and forth, or a sibling application under the same email
  // already has one for this program).
  if (!before.student_user_id && SCHOLARSHIP_ACCOUNT_CREATING_STATUSES.includes(status)) {
    const existingUser = await findUserByEmailAndProgram(updated.parent_email, updated.program);
    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
    } else {
      const throwawayPassword = crypto.randomBytes(24).toString("hex");
      userId = await createUser(updated.parent_email, throwawayPassword, "student", updated.student_name, updated.program);
      const token = await createResetToken(updated.parent_email);
      const setupUrl = `${APP_URL}/reset-password?token=${token}`;
      sendScholarshipAccountWelcome({ email: updated.parent_email, name: updated.student_name, program: updated.program, setupUrl }).catch(console.error);
    }
    await linkScholarshipAccount(id, userId);
    updated = { ...updated, student_user_id: userId };
  }

  return NextResponse.json({ application: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteScholarshipApplication(id);
  return NextResponse.json({ ok: true });
}
