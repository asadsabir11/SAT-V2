import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/auth";
import { getScholarshipApplicationById, linkScholarshipAccount } from "@/lib/scholarships";
import { findUserByEmailAndProgram, createUser } from "@/lib/users";
import { createResetToken } from "@/lib/passwordReset";
import { sendScholarshipAccountWelcome, sendScholarshipApprovedExistingAccount } from "@/lib/email";
import { isValidEmail } from "@/lib/validators";

const APP_URL = "https://academy.thedigitaltutor.net";

// A separate, explicit action from approving the application — mirrors how
// teacher accounts are created: the founder reviews, then deliberately
// creates the login (throwaway password, emailed set-password link), rather
// than it happening automatically as a side effect of a status change.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const application = await getScholarshipApplicationById(id);
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (application.student_user_id) {
    return NextResponse.json({ error: "This application already has a linked account" }, { status: 409 });
  }

  const body = await req.json();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  // Accounts are unique per (email, program) with no regard for role — if
  // this email already has a non-student account for this program (e.g. the
  // parent's own parent-portal login), it can't also become the student's
  // account under the same email. Point the founder at the conflict instead
  // of silently reusing the wrong account.
  const existingUser = await findUserByEmailAndProgram(email, application.program);
  if (existingUser && existingUser.role !== "student") {
    return NextResponse.json({
      error: `${email} already has a ${existingUser.role} account for this program — use a different email for the student's login.`,
    }, { status: 409 });
  }

  let userId: string;
  if (existingUser) {
    userId = existingUser.id;
    sendScholarshipApprovedExistingAccount({ email, name, program: application.program }).catch(console.error);
  } else {
    const throwawayPassword = crypto.randomBytes(24).toString("hex");
    userId = await createUser(email, throwawayPassword, "student", name, application.program);
    const token = await createResetToken(email);
    const setupUrl = `${APP_URL}/reset-password?token=${token}`;
    sendScholarshipAccountWelcome({ email, name, program: application.program, setupUrl }).catch(console.error);
  }
  await linkScholarshipAccount(id, userId);

  return NextResponse.json({ ok: true, studentUserId: userId });
}
