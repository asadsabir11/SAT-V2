"use client";
import { useState } from "react";
import Link from "next/link";

export type AccessLevel = "free" | "pending" | "unlocked";

const AMOUNT = process.env.NEXT_PUBLIC_PAYMENT_AMOUNT ?? "PKR 5,300";

export function UnlockModal({
  accessLevel, onClose,
  eyebrow = "Full Access",
  title = "Unlock The Digital Tutor",
  features = ["All Math lectures", "All English lectures", "Live Sessions", "Q&A Board", "AI Tutor", "Practice Tests"],
}: {
  accessLevel: AccessLevel;
  onClose: () => void;
  eyebrow?: string;
  title?: string;
  features?: string[];
}) {
  const done = accessLevel === "pending";
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState("");

  async function handleStripeCheckout() {
    setStripeLoading(true);
    setStripeError("");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const d = await res.json();
      if (d.url) {
        window.location.href = d.url;
      } else {
        setStripeError(d.error ?? "Could not start payment. Please try again.");
        setStripeLoading(false);
      }
    } catch {
      setStripeError("Network error. Please check your connection and try again.");
      setStripeLoading(false);
    }
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
                We received your payment details. Once verified, your account will be unlocked — usually within a business day.
              </p>
              <p style={{ color: "#6b7c93", fontSize: ".85rem", marginTop: 12 }}>
                Need to fix something? You can{" "}
                <Link href="/unlock" style={{ color: "#155eef", fontWeight: 700 }}>resubmit your payment details</Link>.
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

              <div style={{ padding: "16px 18px", borderRadius: 12, background: "linear-gradient(135deg,#eff6ff,#e0e7ff)", border: "1.5px solid #bfdbfe", marginBottom: 20 }}>
                <div style={{ fontSize: ".72rem", fontWeight: 800, color: "#1d4ed8", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 }}>💳 Pay by Card (Instant Access)</div>
                <div style={{ fontSize: ".82rem", color: "#1e40af", marginBottom: 12, lineHeight: 1.5 }}>
                  Pay securely online with Stripe. Your account unlocks automatically after payment.
                </div>
                <button
                  onClick={handleStripeCheckout}
                  disabled={stripeLoading}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#155eef", color: "#fff", borderRadius: 9, fontWeight: 800, fontSize: ".88rem", cursor: stripeLoading ? "not-allowed" : "pointer", border: "none", opacity: stripeLoading ? .7 : 1 }}
                >
                  {stripeLoading ? "Redirecting…" : "Pay with Card →"}
                </button>
                {stripeError && <p style={{ color: "#dc2626", fontSize: ".78rem", fontWeight: 700, margin: "8px 0 0" }}>{stripeError}</p>}
              </div>

              <div style={{ padding: "16px 18px", borderRadius: 12, background: "#fff7ed", border: "1.5px solid #fed7aa" }}>
                <div style={{ fontSize: ".72rem", fontWeight: 800, color: "#c2410c", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 }}>🇵🇰 Pakistan — Bank / JazzCash / Easypaisa</div>
                <div style={{ fontSize: ".82rem", color: "#9a3412", marginBottom: 12, lineHeight: 1.5 }}>
                  Pay via bank transfer, JazzCash or Easypaisa, then submit your payment details for verification.
                  Your account unlocks once we verify it — usually within a business day.
                </div>
                <Link
                  href="/unlock"
                  onClick={onClose}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#c2410c", color: "#fff", borderRadius: 9, fontWeight: 800, fontSize: ".88rem", textDecoration: "none" }}
                >
                  Submit Payment Details →
                </Link>
              </div>
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
          <p style={{ color: "#78350f", fontSize: ".83rem", margin: 0 }}>We&apos;re verifying your payment. This usually takes a few hours.</p>
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
