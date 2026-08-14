// Server-side "Purchase" conversion events, fired only when an admin marks an
// application payment_verified/enrolled — there is no browser present at that
// moment, so these can't go through the client pixel/gtag. Both are no-ops
// until their respective tokens are configured. Deliberately sent WITHOUT any
// PII (no names, emails, phone numbers, banking details) — subject/value/
// currency only, per the launch spec's analytics requirements.

import crypto from "crypto";

export async function sendMetaPurchaseEvent(params: {
  applicationId: string;
  subject: string;
  value: number;
  currency?: string;
}) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CONVERSIONS_API_TOKEN;
  if (!pixelId || !token) return;

  try {
    // event_id lets Meta dedupe against any client-side event for the same
    // conversion; we don't fire one client-side for Purchase, but this keeps
    // the event stable/idempotent if the admin action is retried.
    const eventId = crypto.createHash("sha256").update(`purchase:${params.applicationId}`).digest("hex");
    await fetch(`https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [{
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: "system_generated",
          custom_data: {
            content_name: params.subject,
            value: params.value,
            currency: params.currency ?? "PKR",
          },
        }],
      }),
    });
  } catch (err) {
    console.error("Meta Conversions API call failed (non-fatal):", err);
  }
}

export async function sendGA4PurchaseEvent(params: {
  applicationId: string;
  subject: string;
  value: number;
  currency?: string;
}) {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;
  if (!measurementId || !apiSecret) return;

  try {
    // GA4 Measurement Protocol requires a client_id; we don't have the
    // browser's actual one at this point, so use a stable per-application
    // pseudo-id — good enough for server-side conversion counting.
    const clientId = crypto.createHash("sha256").update(params.applicationId).digest("hex").slice(0, 32);
    await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
      method: "POST",
      body: JSON.stringify({
        client_id: clientId,
        events: [{
          name: "purchase",
          params: {
            transaction_id: params.applicationId,
            value: params.value,
            currency: params.currency ?? "PKR",
            item_name: params.subject,
          },
        }],
      }),
    });
  } catch (err) {
    console.error("GA4 Measurement Protocol call failed (non-fatal):", err);
  }
}
