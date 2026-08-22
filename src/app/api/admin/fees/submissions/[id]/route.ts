import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSubmissionById, verifySubmission, rejectSubmission, getChallanById } from "@/lib/challans";
import { grantAccess } from "@/lib/users";
import { grantOLevelAccess } from "@/lib/olevelAccess";
import { sendChallanVerified } from "@/lib/email";

const SUBJECT_LABELS: Record<string, string> = {
  "": "Full SAT Access",
  mathematics: "Mathematics",
  "english-language": "English Language",
  "computer-science": "Computer Science",
  islamiyat: "Islamiyat",
  "pakistan-studies": "Pakistan Studies",
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action, notes } = body;

  const existing = await getSubmissionById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.status !== "pending") {
    return NextResponse.json({ error: "This submission has already been reviewed" }, { status: 409 });
  }

  if (action === "reject") {
    await rejectSubmission(id, session.email, notes);
    return NextResponse.json({ ok: true });
  }

  if (action !== "verify") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const challanIds = existing.challan_ids.split(",").filter(Boolean);
  const subjects: string[] = [];
  for (const challanId of challanIds) {
    const challan = await getChallanById(challanId);
    if (!challan) continue;
    subjects.push(SUBJECT_LABELS[challan.subject] ?? challan.subject);
    if (challan.program === "sat") {
      await grantAccess(challan.student_email, session.email, `Challan ${challan.period} verified via fee portal`);
    } else {
      await grantOLevelAccess(challan.student_email, challan.subject, session.email, `Challan ${challan.period} verified via fee portal`);
    }
  }

  const submission = await verifySubmission(id, session.email, notes);
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await sendChallanVerified({
    email: submission.student_email,
    name: submission.student_name,
    amountPaid: Number(submission.amount_paid),
    subjects: subjects.join(", "),
  }).catch(console.error);

  return NextResponse.json({ ok: true });
}
