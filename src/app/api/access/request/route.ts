import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { requestAccess, getStudentAccessLevel } from "@/lib/users";
import { sendSatUnlockPaymentSubmittedAck, sendSatUnlockPaymentSubmittedAdminAlert } from "@/lib/email";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const current = await getStudentAccessLevel(session.email);
  if (current === "unlocked") {
    return NextResponse.json({ ok: true, access_level: "unlocked" });
  }

  const body = await req.json().catch(() => ({}));
  const { paymentMethod, amountPaid, transactionReference, paymentDate, payerAccountName, paymentScreenshotUrl } = body;
  if (!paymentMethod || !amountPaid || !transactionReference?.trim() || !paymentDate || !payerAccountName?.trim()) {
    return NextResponse.json({ error: "Please fill in all required payment fields" }, { status: 400 });
  }

  await requestAccess(session.email, {
    paymentMethod,
    amountPaid: Number(amountPaid),
    transactionReference: transactionReference.trim(),
    paymentDate,
    payerAccountName: payerAccountName.trim(),
    paymentScreenshotUrl: paymentScreenshotUrl || null,
  });

  sendSatUnlockPaymentSubmittedAck({ email: session.email, name: session.name }).catch(console.error);
  sendSatUnlockPaymentSubmittedAdminAlert({ email: session.email, name: session.name }).catch(console.error);

  return NextResponse.json({ ok: true, access_level: "pending" });
}
