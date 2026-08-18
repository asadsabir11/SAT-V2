import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession } from "@/lib/auth";

const APP_URL = "https://academy.thedigitaltutor.net";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!secretKey || !priceId) {
    return NextResponse.json({ error: "Card payment is not configured yet." }, { status: 503 });
  }

  const stripe = new Stripe(secretKey);

  // The existing Stripe price could be one-time or recurring depending on how
  // it was set up in the dashboard — read it back so Checkout mode always
  // matches, instead of assuming and erroring at checkout time.
  const price = await stripe.prices.retrieve(priceId);
  const mode: Stripe.Checkout.SessionCreateParams.Mode = price.recurring ? "subscription" : "payment";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: session.email,
    metadata: { email: session.email },
    success_url: `${APP_URL}/payment/success`,
    cancel_url: `${APP_URL}/payment/cancel`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
