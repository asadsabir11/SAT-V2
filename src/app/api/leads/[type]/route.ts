import { NextRequest, NextResponse } from "next/server";
import { sendToN8n } from "@/lib/n8n";
import { appendData } from "@/lib/storage";

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
    const record = { ...payload, id: crypto.randomUUID(), leadType: type, createdAt: new Date().toISOString() };
    try { appendData(`leads-${type}.json`, record); } catch { /* non-fatal on serverless */ }
    sendToN8n(webhooks[type], record).catch(console.error);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Lead submission failed", error);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
