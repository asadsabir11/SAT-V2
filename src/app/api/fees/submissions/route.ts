import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getChallanById, createSubmission } from "@/lib/challans";
import { sendChallanSubmissionAck, sendChallanSubmissionAdminAlert } from "@/lib/email";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

const SUBJECT_LABELS: Record<string, string> = {
  "": "Full SAT Access",
  mathematics: "Mathematics",
  "english-language": "English Language",
  "computer-science": "Computer Science",
  islamiyat: "Islamiyat",
  "pakistan-studies": "Pakistan Studies",
  physics: "Physics",
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await checkRateLimit(`fee-submission:${clientIp(req)}`, 10, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = await req.json();
  const { challanIds, amountPaid, transactionReference, paymentScreenshotUrl } = body;

  if (!Array.isArray(challanIds) || challanIds.length === 0) {
    return NextResponse.json({ error: "Select at least one challan to pay for" }, { status: 400 });
  }
  if (!amountPaid || !transactionReference?.trim()) {
    return NextResponse.json({ error: "Amount and transaction reference are required" }, { status: 400 });
  }

  // Every referenced challan must actually belong to this student and still
  // be owed — otherwise a student could submit against someone else's
  // challan ID, or re-pay one that's already verified.
  const subjects: string[] = [];
  for (const id of challanIds) {
    const challan = await getChallanById(String(id));
    if (!challan || challan.student_user_id !== session.id) {
      return NextResponse.json({ error: "One of the selected challans is invalid" }, { status: 400 });
    }
    if (challan.status === "paid") {
      return NextResponse.json({ error: "One of the selected challans is already paid" }, { status: 409 });
    }
    subjects.push(SUBJECT_LABELS[challan.subject] ?? challan.subject);
  }

  const subjectsLabel = subjects.join(", ");

  const submission = await createSubmission({
    studentUserId: session.id,
    studentEmail: session.email,
    studentName: session.name,
    challanIds: challanIds.map(String),
    amountPaid: Number(amountPaid),
    transactionReference: transactionReference.trim(),
    paymentScreenshotUrl: paymentScreenshotUrl || null,
  });

  await Promise.all([
    sendChallanSubmissionAck({ email: session.email, name: session.name, amountPaid: Number(amountPaid), subjects: subjectsLabel }).catch(console.error),
    sendChallanSubmissionAdminAlert({ email: session.email, name: session.name, amountPaid: Number(amountPaid), subjects: subjectsLabel }).catch(console.error),
  ]);

  return NextResponse.json({ ok: true, submission });
}
