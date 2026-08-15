"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email."); return; }
    setError("");
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong. Please try again."); setStatus("idle"); return; }
      setStatus("done");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px", background: "linear-gradient(160deg,#f0f5ff 0%,#f8fafc 60%,#f0fdf9 100%)" }}>
      <Link href="/" style={{ fontWeight: 900, fontSize: "1.15rem", letterSpacing: "-.04em", color: "#071b33", textDecoration: "none", marginBottom: 32 }}>
        <span style={{ color: "#155eef" }}>The Digital</span> Tutor
      </Link>

      <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 20, boxShadow: "0 4px 32px rgba(7,27,51,.10), 0 1px 4px rgba(7,27,51,.06)", padding: "40px 36px" }}>
        {status === "done" ? (
          <>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#071b33", margin: "0 0 6px", letterSpacing: "-.03em" }}>Check your email</h1>
            <p style={{ color: "#6b7c93", fontSize: ".9rem", margin: "0 0 24px", lineHeight: 1.6 }}>
              If an account exists for <strong>{email.trim()}</strong>, we&apos;ve sent a link to reset your password. It expires in 1 hour.
            </p>
            <Link href="/login" style={{ color: "#155eef", fontWeight: 700, textDecoration: "none", fontSize: ".9rem" }}>
              ← Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#071b33", margin: "0 0 6px", letterSpacing: "-.03em" }}>Forgot your password?</h1>
            <p style={{ color: "#6b7c93", fontSize: ".9rem", margin: "0 0 28px" }}>
              Enter the email on your student account and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: 24 }}>
                <label htmlFor="fp-email" style={{ display: "block", fontWeight: 700, fontSize: ".85rem", color: "#344054", marginBottom: 6 }}>
                  Email address
                </label>
                <input
                  id="fp-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@gmail.com"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #dce5ef", fontSize: ".95rem", boxSizing: "border-box", outline: "none" }}
                />
              </div>

              {error && (
                <div style={{ background: "#fff2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: "#c62828", fontSize: ".85rem", fontWeight: 600 }}>
                  ⚠ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="btn btn-primary"
                style={{ width: "100%", minHeight: 46, fontSize: "1rem", borderRadius: 12 }}
              >
                {status === "loading" ? "Sending…" : "Send reset link →"}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: 20, fontSize: ".85rem", color: "#6b7c93" }}>
              <Link href="/login" style={{ color: "#155eef", fontWeight: 700, textDecoration: "none" }}>
                ← Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
