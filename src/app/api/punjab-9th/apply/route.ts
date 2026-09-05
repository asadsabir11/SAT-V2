import { NextRequest, NextResponse } from "next/server";
import { appendData } from "@/lib/storage";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { createNotification } from "@/lib/notifications";
import { sendPunjab9thLeadAdminAlert } from "@/lib/email";

const REQUIRED_FIELDS = [
  "studentName", "parentName", "parentWhatsapp", "city",
  "punjabBoard", "studyGroup", "teachingMedium", "preferredClassTime",
];

// Public, account-free lead capture for the Punjab Board 9th Class landing
// page — unlike SAT/O-Level registration, this creates no user account and
// no password. The admissions team follows up with the parent over
// WhatsApp; this just saves the lead and alerts admin. A dedicated,
// self-contained route (rather than extending the shared /api/leads/[type]
// route) so nothing about SAT/O-Level's existing lead flows is touched.
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

    const record = {
      id: crypto.randomUUID(),
      leadType: "punjab-9th",
      studentName: String(body.studentName).trim(),
      parentName: String(body.parentName).trim(),
      parentWhatsapp: String(body.parentWhatsapp).trim(),
      city: String(body.city).trim(),
      punjabBoard: String(body.punjabBoard).trim(),
      schoolName: body.schoolName?.trim() || null,
      studyGroup: String(body.studyGroup).trim(),
      teachingMedium: String(body.teachingMedium).trim(),
      preferredClassTime: String(body.preferredClassTime).trim(),
      deviceAvailable: body.deviceAvailable?.trim() || null,
      subjectsNeedingHelp: Array.isArray(body.subjectsNeedingHelp) ? body.subjectsNeedingHelp.map(String) : [],
      howHeard: body.howHeard?.trim() || null,
      createdAt: new Date().toISOString(),
    };

    await appendData("leads-punjab-9th", record);

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

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Punjab 9th Class lead submission failed", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
