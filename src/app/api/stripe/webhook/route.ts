import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { grantAccess } from "@/lib/users";

// Grants full access on first successful payment. Access is a one-way flip
// (matches the existing WhatsApp/bank-transfer approval flow — there's no
// expiry or re-verification anywhere else in the app), so a Stripe
// subscription's later renewals/cancellations aren't tracked here. If that's
// ever needed, handle invoice.payment_failed / customer.subscription.deleted
// too and add revokeAccess() on the failure/cancel path.
export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const stripe = new Stripe(secretKey);
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.metadata?.email ?? session.customer_email;
    if (email) {
      await grantAccess(email, "stripe", `Stripe payment ${session.id}`);
    }
  }

  return NextResponse.json({ received: true });
}
