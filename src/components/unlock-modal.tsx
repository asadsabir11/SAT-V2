"use client";
import { useState } from "react";

export type AccessLevel = "free" | "pending" | "unlocked";

const WA_URL    = process.env.NEXT_PUBLIC_PAYMENT_WHATSAPP_URL ?? "#";
const AMOUNT    = process.env.NEXT_PUBLIC_PAYMENT_AMOUNT ?? "Contact us for pricing";
const BANK_NAME = process.env.NEXT_PUBLIC_PAYMENT_BANK_NAME ?? "";
const ACC_TITLE = process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_TITLE ?? "";
const ACC_NUM   = process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NUMBER ?? "";
const JAZZCASH  = process.env.NEXT_PUBLIC_PAYMENT_JAZZCASH ?? "";
const EASYPAISA = process.env.NEXT_PUBLIC_PAYMENT_EASYPAISA ?? "";

export function UnlockModal({
  accessLevel, onClose, onSubmitted,
  eyebrow = "Full Access",
  title = "Unlock The Digital Tutor",
  features = ["All Math lectures", "All English lectures", "Live Sessions", "Q&A Board", "AI Tutor", "Practice Tests"],
  endpoint = "/api/access/request",
  requestBody,
}: {
  accessLevel: AccessLevel;
  onClose: () => void;
  onSubmitted: () => void;
  eyebrow?: string;
  title?: string;
  features?: string[];
  endpoint?: string;
  requestBody?: Record<string, string>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(accessLevel === "pending");

  async function handleSubmit() {
    setSubmitting(true);
    await fetch(endpoint, {
      method: "POST",
      headers: requestBody ? { "Content-Type": "application/json" } : undefined,
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    });
    setDone(true);
    setSubmitting(false);
    onSubmitted();
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(7,27,51,.72)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, overflow: "hidden", boxShadow: "0 24px 80px rgba(7,27,51,.25)" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#071b33 0%,#1e3a5f 100%)", padding: "28px 28px 24px", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: ".72rem", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#93c5fd", marginBottom: 6 }}>{eyebrow}</div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 900, margin: 0, letterSpacing: "-.02em" }}>{title}</h2>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", color: "#fff", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
          </div>
          <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(255,255,255,.1)", borderRadius: 12, display: "inline-block" }}>
            <span style={{ fontSize: ".8rem", color: "#93c5fd" }}>Fee: </span>
            <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "#fff" }}>{AMOUNT}</span>
          </div>
        </div>

        <div style={{ padding: "24px 28px 28px" }}>
          {done ? (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>⏳</div>
              <h3 style={{ color: "#071b33", marginBottom: 8 }}>Payment under review</h3>
              <p style={{ color: "#6b7c93", lineHeight: 1.65, fontSize: ".92rem" }}>
                We received your request. Once your payment is verified via WhatsApp, your account will be unlocked — usually within a few hours.
              </p>
              <p style={{ color: "#6b7c93", fontSize: ".85rem", marginTop: 12 }}>
                Questions? Message us on{" "}
                <a href={WA_URL} target="_blank" rel="noreferrer" style={{ color: "#155eef", fontWeight: 700 }}>WhatsApp</a>.
              </p>
              <button onClick={onClose} className="btn btn-primary" style={{ marginTop: 20, minWidth: 160 }}>Close</button>
            </div>
          ) : (
            <>
              <h4 style={{ color: "#071b33", marginBottom: 14, fontWeight: 800, fontSize: ".95rem" }}>What you unlock</h4>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {features.map(f => (
                  <span key={f} style={{ padding: "4px 12px", borderRadius: 999, background: "#eff6ff", color: "#155eef", fontSize: ".78rem", fontWeight: 700 }}>✓ {f}</span>
                ))}
              </div>

              <h4 style={{ color: "#071b33", marginBottom: 14, fontWeight: 800, fontSize: ".95rem" }}>Payment methods</h4>
              <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
                {BANK_NAME && (
                  <div style={{ padding: "14px 16px", borderRadius: 12, background: "#f8fafc", border: "1.5px solid #e8eef6" }}>
                    <div style={{ fontSize: ".72rem", fontWeight: 800, color: "#6b7c93", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 }}>Bank Transfer</div>
                    <div style={{ fontSize: ".88rem", color: "#071b33", fontWeight: 700 }}>{BANK_NAME}</div>
                    {ACC_TITLE && <div style={{ fontSize: ".82rem", color: "#344054" }}>Account Title: <strong>{ACC_TITLE}</strong></div>}
                    {ACC_NUM   && <div style={{ fontSize: ".82rem", color: "#344054" }}>Account No: <strong>{ACC_NUM}</strong></div>}
                  </div>
                )}
                {JAZZCASH && (
                  <div style={{ padding: "14px 16px", borderRadius: 12, background: "#fff7ed", border: "1.5px solid #fed7aa" }}>
                    <div style={{ fontSize: ".72rem", fontWeight: 800, color: "#c2410c", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>JazzCash</div>
                    <div style={{ fontSize: ".88rem", color: "#071b33", fontWeight: 700 }}>{JAZZCASH}</div>
                  </div>
                )}
                {EASYPAISA && (
                  <div style={{ padding: "14px 16px", borderRadius: 12, background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
                    <div style={{ fontSize: ".72rem", fontWeight: 800, color: "#065f46", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>Easypaisa</div>
                    <div style={{ fontSize: ".88rem", color: "#071b33", fontWeight: 700 }}>{EASYPAISA}</div>
                  </div>
                )}
              </div>

              <div style={{ padding: "16px 18px", borderRadius: 12, background: "#f0fdf4", border: "1.5px solid #86efac", marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ fontSize: "1.4rem", lineHeight: 1 }}>💬</div>
                  <div>
                    <p style={{ fontWeight: 800, color: "#065f46", margin: "0 0 4px", fontSize: ".9rem" }}>After paying, send your screenshot to WhatsApp</p>
                    <p style={{ color: "#047857", fontSize: ".82rem", margin: "0 0 10px", lineHeight: 1.5 }}>
                      Include your registered email with the screenshot so we can match it to your account.
                    </p>
                    <a href={WA_URL} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#22c55e", color: "#fff", borderRadius: 8, fontWeight: 800, fontSize: ".85rem", textDecoration: "none" }}>
                      Open WhatsApp →
                    </a>
                  </div>
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: "100%", fontSize: ".95rem" }} onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting…" : "I've sent my payment — notify admin"}
              </button>
              <p style={{ color: "#a0aec0", fontSize: ".75rem", textAlign: "center", marginTop: 10 }}>
                Your account will show &quot;Pending&quot; and the admin will verify your payment.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function LockedBanner({
  accessLevel, onUnlock,
  title = "🔒 Full access required",
  subtitle = "Unlock all lectures, live sessions, Q&A, and more.",
  buttonLabel = "Unlock Full Access",
}: {
  accessLevel: AccessLevel;
  onUnlock: () => void;
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
}) {
  if (accessLevel === "pending") {
    return (
      <div style={{ padding: "16px 20px", borderRadius: 14, background: "#fffbeb", border: "1.5px solid #fde68a", marginBottom: 28, display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontSize: "1.3rem" }}>⏳</span>
        <div>
          <p style={{ fontWeight: 800, color: "#92400e", margin: "0 0 2px", fontSize: ".92rem" }}>Payment verification in progress</p>
          <p style={{ color: "#78350f", fontSize: ".83rem", margin: 0 }}>We&apos;re checking your WhatsApp payment. This usually takes a few hours.</p>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", padding: "16px 20px", borderRadius: 14, background: "linear-gradient(135deg,#071b33,#1e3a5f)", color: "#fff", marginBottom: 28 }}>
      <div>
        <p style={{ fontWeight: 800, fontSize: ".95rem", margin: "0 0 3px" }}>{title}</p>
        <p style={{ color: "#93c5fd", fontSize: ".83rem", margin: 0 }}>{subtitle}</p>
      </div>
      <button onClick={onUnlock} style={{ padding: "10px 22px", background: "#155eef", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: ".88rem", cursor: "pointer", whiteSpace: "nowrap" }}>
        {buttonLabel}
      </button>
    </div>
  );
}
