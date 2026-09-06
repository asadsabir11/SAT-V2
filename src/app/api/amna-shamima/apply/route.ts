import { NextRequest, NextResponse } from "next/server";
import { appendData } from "@/lib/storage";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { createNotification } from "@/lib/notifications";
import { sendAmnaShamimaLeadAdminAlert, sendAmnaShamimaRegistrationWelcome } from "@/lib/email";
import { createUser, findUserByEmailAndProgram } from "@/lib/users";
import { createToken, AUTH_COOKIE } from "@/lib/auth";
import { isValidEmail, passwordStrengthError } from "@/lib/validators";

const REQUIRED_FIELDS = ["studentName", "studentEmail", "password", "whatsapp"];

// Public registration for the Amna Shamima Foundation AI course landing
// page. Creates a real student account (program: "amna-shamima") so the
// student can sign in later, same as the Punjab 9th Class flow — but this
// program has no fee/access-gating at all (it's sponsored by the
// foundation), so unlike that flow there's no pending/unlocked state: the
// account has full access to lectures and the online class the moment it's
// created. A dedicated, self-contained route so nothing about the other
// programs' registration flows is touched.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const allowed = await checkRateLimit(`amna-shamima-apply:${clientIp(req)}`, 5, 60);
    if (!allowed) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const missing = REQUIRED_FIELDS.filter((f) => typeof body[f] !== "string" || !body[f].trim());
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}` }, { status: 400 });
    }
    if (body.consent !== true) {
      return NextResponse.json({ error: "Please confirm the consent checkbox" }, { status: 400 });
    }

    const studentEmail = String(body.studentEmail).trim().toLowerCase();
    if (!isValidEmail(studentEmail)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    const pwError = passwordStrengthError(String(body.password));
    if (pwError) {
      return NextResponse.json({ error: `Password: ${pwError}` }, { status: 400 });
    }

    const existing = await findUserByEmailAndProgram(studentEmail, "amna-shamima");
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists. Please log in instead." }, { status: 409 });
    }

    const studentName = String(body.studentName).trim();
    const whatsapp = String(body.whatsapp).trim();
    const city = body.city?.trim() || null;

    const record = {
      id: crypto.randomUUID(),
      leadType: "amna-shamima",
      studentName,
      studentEmail,
      whatsapp,
      city,
      createdAt: new Date().toISOString(),
    };

    const userId = await createUser(studentEmail, String(body.password), "student", studentName, "amna-shamima");
    await appendData("leads-amna-shamima.json", record);

    await Promise.all([
      createNotification({
        type: "registration",
        audience: "admin",
        title: `New Amna Shamima AI course lead: ${studentName}`,
        body: `${whatsapp}${city ? " · " + city : ""}`,
        link: "/admin/amna-shamima-leads",
      }).catch(console.error),
      sendAmnaShamimaLeadAdminAlert({ studentName, studentEmail, whatsapp, city }).catch(console.error),
      sendAmnaShamimaRegistrationWelcome({ name: studentName, email: studentEmail }).catch(console.error),
    ]);

    const token = await createToken({ id: userId, email: studentEmail, role: "student", name: studentName, program: "amna-shamima" });
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
    console.error("Amna Shamima registration failed", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
