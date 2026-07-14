import { NextRequest, NextResponse } from "next/server";
import { sendToN8n } from "@/lib/n8n";
import { appendData } from "@/lib/storage";
import { createUser } from "@/lib/users";
import { createToken, AUTH_COOKIE } from "@/lib/auth";
import { sendNewStudentAlert } from "@/lib/email";

const webhooks: Record<string, string | undefined> = {
  student: process.env.N8N_STUDENT_REGISTRATION_WEBHOOK_URL,
  webinar: process.env.N8N_PARENT_WEBINAR_WEBHOOK_URL,
  partner: process.env.N8N_PARTNER_INQUIRY_WEBHOOK_URL,
  contact: process.env.N8N_CONTACT_WEBHOOK_URL,
};

export async function POST(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  try {
    const { type } = await params;
    const payload = await request.json();
    if (!payload || typeof payload !== "object")
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    // Strip password from the lead record before saving
    const { password, confirmPassword: _confirm, ...leadData } = payload as Record<string, string>;
    const record = { ...leadData, id: crypto.randomUUID(), leadType: type, createdAt: new Date().toISOString() };

    await appendData(`leads-${type}.json`, record);
    sendToN8n(webhooks[type], record).catch(console.error);

    // For student registrations: create a user account and set auth cookie
    if (type === "student" && password && leadData.studentEmail && leadData.studentName) {
      await createUser(leadData.studentEmail, password, "student", leadData.studentName);
      sendNewStudentAlert({
        name: leadData.studentName,
        email: leadData.studentEmail,
        country: leadData.country,
        packageType: leadData.packageType,
        grade: leadData.grade,
      }).catch(console.error);
      const token = await createToken({
        id: record.id,
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
