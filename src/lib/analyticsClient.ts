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

// Fired once, when someone first types into a registration form — the top of
// the funnel that `generate_lead` (a completed registration) is measured
// against. Without both halves you can see completions but not drop-off.
//
// The once-per-program de-duplication lives here rather than in the form so
// callers can fire on every keystroke without needing a ref (which the React
// Compiler flags when read from a function it can't prove is event-only).
const startedPrograms = new Set<string>();

export function trackRegistrationStarted(params: { program: "sat" | "o-level" }) {
  if (typeof window === "undefined") return;
  if (startedPrograms.has(params.program)) return;
  startedPrograms.add(params.program);
  window.fbq?.("trackCustom", "RegistrationStarted", { content_name: `${params.program}-registration` });
  window.gtag?.("event", "registration_started", { item_name: `${params.program}-registration` });
}

export function trackScholarshipApplication(params: { program: "sat" | "o-level" }) {
  if (typeof window === "undefined") return;
  window.fbq?.("trackCustom", "ScholarshipApplication", { content_name: `${params.program}-scholarship` });
  window.gtag?.("event", "scholarship_application", { item_name: `${params.program}-scholarship` });
}

// Workbook downloads already increment an internal counter; this reports the
// same click to GA4/Meta so it can be attributed to an organic landing page.
export function trackWorkbookDownload(params: { title: string }) {
  if (typeof window === "undefined") return;
  window.fbq?.("trackCustom", "WorkbookDownload", { content_name: params.title });
  window.gtag?.("event", "workbook_download", { item_name: params.title });
}

// channel distinguishes the floating WhatsApp CTA from the contact form, so
// "which page produced a conversation" is answerable.
export function trackContactAction(params: { channel: "whatsapp" | "contact_form" }) {
  if (typeof window === "undefined") return;
  window.fbq?.("trackCustom", "Contact", { content_name: params.channel });
  window.gtag?.("event", "contact", { method: params.channel });
}
