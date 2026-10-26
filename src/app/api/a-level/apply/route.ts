import { NextRequest, NextResponse } from "next/server";
import { appendData } from "@/lib/storage";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { createNotification } from "@/lib/notifications";
import { sendALevelLeadAdminAlert, sendALevelRegistrationWelcome } from "@/lib/email";
import { createUser, findUserByEmailAndProgram } from "@/lib/users";
import { createToken, AUTH_COOKIE } from "@/lib/auth";
import { isValidEmail, passwordStrengthError } from "@/lib/validators";

const REQUIRED_FIELDS = [
  "studentName", "studentEmail", "password", "parentName", "parentWhatsapp", "city",
  "schoolOrQualification", "preferredClassTime",
];

// Public registration for the A Level (Computer Science) landing page.
// Mirrors /api/punjab-9th/apply exactly — flat single-subject program, no
// subject/group selection anywhere in this flow. Creates a real student
// account (program: "a-level") so the student can sign in and land on
// /a-level/portal.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const allowed = await checkRateLimit(`a-level-apply:${clientIp(req)}`, 5, 60);
    if (!allowed) {
      return NextResponse.json({ error: "Too many attempts. Please try again later or contact us on WhatsApp." }, { status: 429 });
    }

    const missing = REQUIRED_FIELDS.filter((f) => typeof body[f] !== "string" || !body[f].trim());
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}` }, { status: 400 });
    }
    if (body.parentConsent !== true) {
      return NextResponse.json({ error: "Parent consent is required" }, { status: 400 });
    }

    const studentEmail = String(body.studentEmail).trim().toLowerCase();
    if (!isValidEmail(studentEmail)) {
      return NextResponse.json({ error: "Enter a valid student email address" }, { status: 400 });
    }
    const parentEmail = body.parentEmail?.trim() ? String(body.parentEmail).trim().toLowerCase() : null;
    if (parentEmail && !isValidEmail(parentEmail)) {
      return NextResponse.json({ error: "Enter a valid parent/guardian email address" }, { status: 400 });
    }
    const pwError = passwordStrengthError(String(body.password));
    if (pwError) {
      return NextResponse.json({ error: `Password: ${pwError}` }, { status: 400 });
    }

    const existing = await findUserByEmailAndProgram(studentEmail, "a-level");
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists for this program. Please log in instead." }, { status: 409 });
    }

    const studentName = String(body.studentName).trim();

    const record = {
      id: crypto.randomUUID(),
      leadType: "a-level",
      studentName,
      studentEmail,
      parentName: String(body.parentName).trim(),
      parentWhatsapp: String(body.parentWhatsapp).trim(),
      parentEmail,
      city: String(body.city).trim(),
      schoolOrQualification: String(body.schoolOrQualification).trim(),
      preferredClassTime: String(body.preferredClassTime).trim(),
      deviceAvailable: body.deviceAvailable?.trim() || null,
      howHeard: body.howHeard?.trim() || null,
      createdAt: new Date().toISOString(),
    };

    const userId = await createUser(studentEmail, String(body.password), "student", studentName, "a-level");
    await appendData("leads-a-level.json", record);

    await Promise.all([
      createNotification({
        type: "registration",
        audience: "admin",
        title: `New A Level lead: ${record.studentName}`,
        body: `${record.city} · ${record.parentWhatsapp}`,
        link: "/admin",
      }).catch(console.error),
      sendALevelLeadAdminAlert(record).catch(console.error),
      sendALevelRegistrationWelcome({ name: studentName, email: studentEmail }).catch(console.error),
    ]);

    const token = await createToken({ id: userId, email: studentEmail, role: "student", name: studentName, program: "a-level" });
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
    console.error("A Level registration failed", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
