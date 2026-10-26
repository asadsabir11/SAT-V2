import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getALevelAccessLevel, requestALevelAccess } from "@/lib/aLevelAccess";
import { sendALevelPaymentSubmittedAck, sendALevelPaymentSubmittedAdminAlert } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "a-level") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const current = await getALevelAccessLevel(session.email);
  if (current === "unlocked") {
    return NextResponse.json({ ok: true, access_level: "unlocked" });
  }

  const body = await req.json().catch(() => ({}));
  const { paymentMethod, amountPaid, transactionReference, paymentDate, payerAccountName, paymentScreenshotUrl } = body;
  if (!paymentMethod || !amountPaid || !transactionReference?.trim() || !paymentDate || !payerAccountName?.trim()) {
    return NextResponse.json({ error: "Please fill in all required payment fields" }, { status: 400 });
  }

  await requestALevelAccess(session.email, {
    paymentMethod,
    amountPaid: Number(amountPaid),
    transactionReference: transactionReference.trim(),
    paymentDate,
    payerAccountName: payerAccountName.trim(),
    paymentScreenshotUrl: paymentScreenshotUrl || null,
  });

  await Promise.all([
    sendALevelPaymentSubmittedAck({ email: session.email, name: session.name }).catch(console.error),
    sendALevelPaymentSubmittedAdminAlert({ email: session.email, name: session.name }).catch(console.error),
    createNotification({
      type: "access_request",
      audience: "admin",
      title: `A Level access request: ${session.name}`,
      body: `PKR ${Number(amountPaid).toLocaleString()} · ${paymentMethod}`,
      link: "/admin/a-level-access",
    }).catch(console.error),
  ]);

  return NextResponse.json({ ok: true, access_level: "pending" });
}
