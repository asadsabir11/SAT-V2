import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { requestOLevelAccess, getOLevelSubjectAccess } from "@/lib/olevelAccess";
import { OLEVEL_LECTURE_CATEGORIES, type OLevelLectureCategory } from "@/lib/lectures";
import { sendOLevelUnlockPaymentSubmittedAck, sendOLevelUnlockPaymentSubmittedAdminAlert } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { subject, paymentMethod, amountPaid, transactionReference, paymentDate, payerAccountName, paymentScreenshotUrl } = body;
  if (!subject || !OLEVEL_LECTURE_CATEGORIES.includes(subject)) {
    return NextResponse.json({ error: "A valid subject is required" }, { status: 400 });
  }
  if (!paymentMethod || !amountPaid || !transactionReference?.trim() || !paymentDate || !payerAccountName?.trim()) {
    return NextResponse.json({ error: "Please fill in all required payment fields" }, { status: 400 });
  }
  const sub = subject as OLevelLectureCategory;

  const current = await getOLevelSubjectAccess(session.email, sub);
  if (current === "unlocked") {
    return NextResponse.json({ ok: true, status: "unlocked" });
  }

  await requestOLevelAccess(session.email, sub, {
    paymentMethod,
    amountPaid: Number(amountPaid),
    transactionReference: transactionReference.trim(),
    paymentDate,
    payerAccountName: payerAccountName.trim(),
    paymentScreenshotUrl: paymentScreenshotUrl || null,
  });

  sendOLevelUnlockPaymentSubmittedAck({ email: session.email, name: session.name, subject: sub }).catch(console.error);
  sendOLevelUnlockPaymentSubmittedAdminAlert({ email: session.email, name: session.name, subject: sub }).catch(console.error);

  return NextResponse.json({ ok: true, status: "pending" });
}
