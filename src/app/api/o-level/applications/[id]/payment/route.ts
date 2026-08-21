import { NextRequest, NextResponse } from "next/server";
import { getApplicationById, submitPayment } from "@/lib/olevelApplications";
import { sendOLevelPaymentSubmittedAck, sendOLevelPaymentSubmittedAdminAlert } from "@/lib/email";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

const VALID_METHODS = new Set(["jazzcash", "easypaisa", "bank_transfer"]);

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const allowed = await checkRateLimit(`o-level-payment:${clientIp(req)}`, 8, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Too many submissions. Please try again later or contact us on WhatsApp." }, { status: 429 });
  }

  const { id } = await params;
  const existing = await getApplicationById(id);
  if (!existing) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  const body = await req.json();
  const { paymentMethod, amountPaid, transactionReference, paymentDate, payerAccountName, paymentScreenshotUrl, note } = body ?? {};

  if (!VALID_METHODS.has(paymentMethod)) {
    return NextResponse.json({ error: "Select a valid payment method" }, { status: 400 });
  }
  const amount = Number(amountPaid);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Enter a valid amount paid" }, { status: 400 });
  }
  if (!transactionReference?.trim()) {
    return NextResponse.json({ error: "Transaction ID / reference number is required" }, { status: 400 });
  }
  if (!paymentDate?.trim()) {
    return NextResponse.json({ error: "Payment date is required" }, { status: 400 });
  }
  if (!payerAccountName?.trim()) {
    return NextResponse.json({ error: "Name on the sending account is required" }, { status: 400 });
  }

  const updated = await submitPayment(id, {
    payment_method: paymentMethod,
    amount_paid: amount,
    transaction_reference: transactionReference.trim(),
    payment_date: paymentDate,
    payer_account_name: payerAccountName.trim(),
    payment_screenshot_url: paymentScreenshotUrl?.trim() || null,
    payment_note: note?.trim() || null,
  });
  if (!updated) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  await Promise.all([
    sendOLevelPaymentSubmittedAck(updated).catch(console.error),
    sendOLevelPaymentSubmittedAdminAlert(updated).catch(console.error),
  ]);

  return NextResponse.json({ ok: true });
}
