import { NextRequest, NextResponse } from "next/server";
import { sendToN8n } from "@/lib/n8n";
import { appendData } from "@/lib/storage";
import { createUser, findUserByEmail } from "@/lib/users";
import { createToken, AUTH_COOKIE } from "@/lib/auth";
import { sendNewStudentAlert, sendWelcomeEmail } from "@/lib/email";

const webhooks: Record<string, string | undefined> = {
  student: process.env.N8N_STUDENT_REGISTRATION_WEBHOOK_URL,
  webinar: process.env.N8N_PARENT_WEBINAR_WEBHOOK_URL,
  partner: process.env.N8N_PARTNER_INQUIRY_WEBHOOK_URL,
  contact: process.env.N8N_CONTACT_WEBHOOK_URL,
};

// Required, non-empty fields per lead type. Unlisted types are not validated
// (keeps this endpoint open to future lead types without a code change).
const REQUIRED_FIELDS: Record<string, string[]> = {
  student: ["studentName", "parentName", "studentEmail", "whatsapp", "country", "city", "grade", "packageType", "password"],
  webinar: ["parentName", "email", "whatsapp", "country", "studentGrade", "interestedPackage", "mainConcern"],
  partner: ["organizationName", "contactName", "email", "country", "organizationType", "message"],
  contact: ["name", "email", "country", "role", "message"],
};

function findMissingFields(type: string, data: Record<string, unknown>): string[] {
  const required = REQUIRED_FIELDS[type];
  if (!required) return [];
  return required.filter((field) => {
    const value = data[field];
    return typeof value !== "string" || !value.trim();
  });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  try {
    const { type } = await params;
    const payload = await request.json();
    if (!payload || typeof payload !== "object")
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    const missing = findMissingFields(type, payload as Record<string, unknown>);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    // Strip password from the lead record before saving
    const { password, confirmPassword: _confirm, ...leadData } = payload as Record<string, string>;

    // For registrations that create an account: check duplicate email BEFORE saving anything
    if (type === "student" && leadData.studentEmail) {
      const existing = await findUserByEmail(leadData.studentEmail);
      if (existing) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please log in instead." },
          { status: 409 }
        );
      }
    }

    const record = { ...leadData, id: crypto.randomUUID(), leadType: type, createdAt: new Date().toISOString() };

    await appendData(`leads-${type}.json`, record);
    sendToN8n(webhooks[type], record).catch(console.error);

    if (type === "student" && password && leadData.studentEmail && leadData.studentName) {
      const userId = await createUser(leadData.studentEmail, password, "student", leadData.studentName, "sat");
      sendNewStudentAlert({
        name: leadData.studentName,
        email: leadData.studentEmail,
        country: leadData.country,
        packageType: leadData.packageType,
        grade: leadData.grade,
      }).catch(console.error);
      sendWelcomeEmail({ name: leadData.studentName, email: leadData.studentEmail }).catch(console.error);
      const token = await createToken({
        id: userId,
        email: leadData.studentEmail,
        role: "student",
        name: leadData.studentName,
      });
      const res = NextResponse.json({ ok: true });
      res.cookies.set(AUTH_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return res;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Lead submission failed", error);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
