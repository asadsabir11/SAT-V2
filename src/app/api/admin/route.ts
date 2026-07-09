import { NextResponse } from "next/server";
import { readData } from "@/lib/storage";

export async function GET() {
  const [students, webinar, partners, contacts, diagnostics] = await Promise.all([
    readData<Record<string, string>>("leads-student.json"),
    readData<Record<string, string>>("leads-webinar.json"),
    readData<Record<string, string>>("leads-partner.json"),
    readData<Record<string, string>>("leads-contact.json"),
    readData<Record<string, unknown>>("diagnostics.json"),
  ]);

  const metrics = {
    totalLeads: students.length,
    freeSignups: students.filter((s) => s.packageType === "Free").length,
    paidFounderCohortStudents: students.filter((s) => s.packageType === "Founder Core").length,
    premiumStudents: students.filter((s) => s.packageType === "Premium").length,
    parentWebinarRegistrations: webinar.length,
    partnershipLeads: partners.length,
    contactMessages: contacts.length,
    diagnosticCompletions: diagnostics.length,
    diagnosticCompletionRate: students.length
      ? Math.round((diagnostics.length / students.length) * 100)
      : 0,
  };

  return NextResponse.json({ metrics, students, webinar, partners, diagnostics });
}
