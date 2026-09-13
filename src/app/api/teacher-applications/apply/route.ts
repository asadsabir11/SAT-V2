import { NextRequest, NextResponse } from "next/server";
import { appendData } from "@/lib/storage";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { createNotification } from "@/lib/notifications";
import { sendTeacherApplicationAdminAlert, sendTeacherApplicationConfirmation } from "@/lib/email";
import { isValidEmail } from "@/lib/validators";

// Public "hire teachers" form — pure lead capture, no account created. The
// admin reviews resumes at /admin/teacher-applications and reaches out to
// candidates by phone directly — the applicant only gets an automated
// "we received it" confirmation, no further status updates beyond that.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const allowed = await checkRateLimit(`teacher-apply:${clientIp(req)}`, 5, 60);
    if (!allowed) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const resumeUrl = String(body.resumeUrl ?? "").trim();

    if (!name || !email || !phone || !resumeUrl) {
      return NextResponse.json({ error: "Name, email, phone, and resume are all required" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }

    const record = {
      id: crypto.randomUUID(),
      leadType: "teacher-application",
      name,
      email,
      phone,
      resumeUrl,
      createdAt: new Date().toISOString(),
    };

    await appendData("teacher-applications.json", record);

    await Promise.all([
      createNotification({
        type: "teacher_application",
        audience: "admin",
        title: `New teacher application: ${name}`,
        body: `${email} · ${phone}`,
        link: "/admin/teacher-applications",
      }).catch(console.error),
      sendTeacherApplicationAdminAlert({ name, email, phone, resumeUrl }).catch(console.error),
      sendTeacherApplicationConfirmation({ name, email }).catch(console.error),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Teacher application failed", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
