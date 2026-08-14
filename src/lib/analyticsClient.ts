"use client";

// Thin wrapper around fbq/gtag — safe no-op if either script isn't loaded
// (e.g. NEXT_PUBLIC_META_PIXEL_ID / NEXT_PUBLIC_GA_MEASUREMENT_ID unset).
// Never pass PII (names, emails, phone numbers, banking details) through
// these — only content/value/currency-type parameters.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackViewContent(params: { content_name: string; content_category?: string }) {
  if (typeof window === "undefined") return;
  window.fbq?.("track", "ViewContent", params);
  window.gtag?.("event", "view_item", { item_name: params.content_name, item_category: params.content_category });
}

export function trackLead(params: { subject: string; value?: number; currency?: string }) {
  if (typeof window === "undefined") return;
  window.fbq?.("track", "Lead", { content_name: params.subject, value: params.value, currency: params.currency ?? "PKR" });
  window.gtag?.("event", "generate_lead", { item_name: params.subject, value: params.value, currency: params.currency ?? "PKR" });
}

export function trackInitiateCheckout(params: { subject: string; value?: number; currency?: string }) {
  if (typeof window === "undefined") return;
  window.fbq?.("track", "InitiateCheckout", { content_name: params.subject, value: params.value, currency: params.currency ?? "PKR" });
  window.gtag?.("event", "begin_checkout", { item_name: params.subject, value: params.value, currency: params.currency ?? "PKR" });
}

export function trackPaymentSubmitted(params: { subject: string; value?: number; currency?: string }) {
  if (typeof window === "undefined") return;
  window.fbq?.("trackCustom", "PaymentSubmitted", { content_name: params.subject, value: params.value, currency: params.currency ?? "PKR" });
  window.gtag?.("event", "payment_submitted", { item_name: params.subject, value: params.value, currency: params.currency ?? "PKR" });
}
