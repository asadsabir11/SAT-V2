import { NextRequest, NextResponse } from "next/server";
import { appendData } from "@/lib/storage";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { createNotification } from "@/lib/notifications";
import { sendPunjab9thLeadAdminAlert } from "@/lib/email";
import { createUser, findUserByEmailAndProgram } from "@/lib/users";
import { createToken, AUTH_COOKIE } from "@/lib/auth";
import { isValidEmail, passwordStrengthError } from "@/lib/validators";

const REQUIRED_FIELDS = [
  "studentName", "studentEmail", "password", "parentName", "parentWhatsapp", "city",
  "punjabBoard", "studyGroup", "teachingMedium", "preferredClassTime",
];

// Public registration for the Punjab Board 9th Class landing page. Creates
// a real student account (program: "punjab-9th") so the student can sign
// in later, same as SAT/O-Level registration — but unlike those, there's
// no dashboard/content for this program yet (phase 1 is WhatsApp-
// coordinated live classes only), so a successful login lands on a small
// dedicated portal page instead of the shared /dashboard. A dedicated,
// self-contained route (rather than extending the shared /api/leads/[type]
// route) so nothing about SAT/O-Level's existing registration flows is
// touched.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const allowed = await checkRateLimit(`punjab-9th-apply:${clientIp(req)}`, 5, 60);
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
    const pwError = passwordStrengthError(String(body.password));
    if (pwError) {
      return NextResponse.json({ error: `Password: ${pwError}` }, { status: 400 });
    }

    // Scoped to this program specifically — the same email is allowed to
    // also have a separate SAT or O-Level account.
    const existing = await findUserByEmailAndProgram(studentEmail, "punjab-9th");
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists for this program. Please log in instead." }, { status: 409 });
    }

    const studentName = String(body.studentName).trim();

    const record = {
      id: crypto.randomUUID(),
      leadType: "punjab-9th",
      studentName,
      studentEmail,
      parentName: String(body.parentName).trim(),
      parentWhatsapp: String(body.parentWhatsapp).trim(),
      city: String(body.city).trim(),
      punjabBoard: String(body.punjabBoard).trim(),
      schoolName: body.schoolName?.trim() || null,
      // Registration is by group only (Biology or Computer Science) — the
      // flat monthly fee covers every subject in that group, so there's no
      // per-subject selection anywhere in this flow.
      studyGroup: String(body.studyGroup).trim(),
      teachingMedium: String(body.teachingMedium).trim(),
      preferredClassTime: String(body.preferredClassTime).trim(),
      deviceAvailable: body.deviceAvailable?.trim() || null,
      howHeard: body.howHeard?.trim() || null,
      createdAt: new Date().toISOString(),
    };

    const userId = await createUser(studentEmail, String(body.password), "student", studentName, "punjab-9th");
    await appendData("leads-punjab-9th.json", record);

    await Promise.all([
      createNotification({
        type: "registration",
        audience: "admin",
        title: `New Punjab Board 9th Class lead: ${record.studentName}`,
        body: `${record.studyGroup} group · ${record.city} · ${record.parentWhatsapp}`,
        link: "/admin",
      }).catch(console.error),
      sendPunjab9thLeadAdminAlert(record).catch(console.error),
    ]);

    const token = await createToken({ id: userId, email: studentEmail, role: "student", name: studentName, program: "punjab-9th" });
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
    console.error("Punjab 9th Class registration failed", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
