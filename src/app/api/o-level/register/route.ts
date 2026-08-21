import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmailAndProgram } from "@/lib/users";
import { createToken, AUTH_COOKIE } from "@/lib/auth";
import { appendData } from "@/lib/storage";
import { sendOLevelRegistrationWelcome, sendOLevelRegistrationAdminAlert } from "@/lib/email";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { isValidEmail, passwordStrengthError } from "@/lib/validators";

const REQUIRED_FIELDS = [
  "studentName", "studentEmail", "parentName", "parentEmail", "parentWhatsapp",
  "city", "studentGrade", "targetExamSession", "password",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const allowed = await checkRateLimit(`olevel-register:${clientIp(req)}`, 5, 60);
    if (!allowed) {
      return NextResponse.json({ error: "Too many attempts. Please try again later or contact us on WhatsApp." }, { status: 429 });
    }

    const missing = REQUIRED_FIELDS.filter((f) => typeof body[f] !== "string" || !body[f].trim());
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}` }, { status: 400 });
    }
    if (body.consent !== "true") {
      return NextResponse.json({ error: "You must consent to proceed" }, { status: 400 });
    }

    const studentEmail = String(body.studentEmail).trim().toLowerCase();
    const parentEmail = String(body.parentEmail).trim().toLowerCase();
    if (!isValidEmail(studentEmail) || !isValidEmail(parentEmail)) {
      return NextResponse.json({ error: "Enter valid email addresses" }, { status: 400 });
    }
    if (studentEmail === parentEmail) {
      return NextResponse.json({ error: "Student email and parent email must be different" }, { status: 400 });
    }
    const pwError = passwordStrengthError(String(body.password ?? ""));
    if (pwError) {
      return NextResponse.json({ error: `Password: ${pwError}` }, { status: 400 });
    }

    // Scoped to the O-Level program specifically — the same email is
    // allowed to also have a separate SAT account.
    const existing = await findUserByEmailAndProgram(studentEmail, "o-level");
    if (existing) {
      return NextResponse.json({ error: "An O-Level account with this email already exists. Please log in instead." }, { status: 409 });
    }

    const studentName = String(body.studentName).trim();
    const record = {
      id: crypto.randomUUID(),
      leadType: "o-level",
      studentName,
      studentEmail,
      parentName: String(body.parentName).trim(),
      parentEmail,
      parentWhatsapp: String(body.parentWhatsapp).trim(),
      city: String(body.city).trim(),
      studentGrade: String(body.studentGrade).trim(),
      schoolName: body.schoolName?.trim() || null,
      targetExamSession: String(body.targetExamSession).trim(),
      source: body.source?.trim() || null,
      studyGroupConsent: body.studyGroupConsent === "true" || body.studyGroupConsent === true,
      createdAt: new Date().toISOString(),
    };
    await appendData("leads-o-level.json", record);

    const userId = await createUser(studentEmail, body.password, "student", studentName, "o-level");

    await Promise.all([
      sendOLevelRegistrationWelcome({ email: studentEmail, name: studentName }).catch(console.error),
      sendOLevelRegistrationAdminAlert({ studentName, studentEmail, parentName: record.parentName, parentEmail, city: record.city }).catch(console.error),
    ]);

    const token = await createToken({ id: userId, email: studentEmail, role: "student", name: studentName, program: "o-level" });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (error) {
    console.error("O-Level registration failed", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
