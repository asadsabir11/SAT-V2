"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { passwordStrengthError } from "@/lib/validators";

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const roleParam = params.get("role");
  const role = roleParam === "parent" || roleParam === "founder" || roleParam === "teacher" ? roleParam : "student";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");
  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!token) { setError("This reset link is missing its token. Please request a new one."); return; }
    const pwError = passwordStrengthError(password);
    if (pwError) { setError(pwError); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setError("");
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
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
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#071b33", margin: "0 0 6px", letterSpacing: "-.03em" }}>Password updated</h1>
            <p style={{ color: "#6b7c93", fontSize: ".9rem", margin: "0 0 24px", lineHeight: 1.6 }}>
              Your password has been reset. You can now sign in with your new password.
            </p>
            <Link href={`/login?role=${role}`} className="btn btn-primary" style={{ display: "inline-flex", minHeight: 46, alignItems: "center", justifyContent: "center", width: "100%", fontSize: "1rem", borderRadius: 12, textDecoration: "none", boxSizing: "border-box" }}>
              Sign in →
            </Link>
          </>
        ) : !token ? (
          <>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#071b33", margin: "0 0 6px", letterSpacing: "-.03em" }}>Invalid link</h1>
            <p style={{ color: "#6b7c93", fontSize: ".9rem", margin: "0 0 24px", lineHeight: 1.6 }}>
              This reset link is missing or malformed. Please request a new one.
            </p>
            <Link href="/forgot-password" style={{ color: "#155eef", fontWeight: 700, textDecoration: "none", fontSize: ".9rem" }}>
              ← Request a new link
            </Link>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#071b33", margin: "0 0 6px", letterSpacing: "-.03em" }}>Set a new password</h1>
            <p style={{ color: "#6b7c93", fontSize: ".9rem", margin: "0 0 28px" }}>
              Choose a new password for your account.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="rp-password" style={{ display: "block", fontWeight: 700, fontSize: ".85rem", color: "#344054", marginBottom: 6 }}>
                  New password
                </label>
                <input
                  id="rp-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 8 chars, include a number"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #dce5ef", fontSize: ".95rem", boxSizing: "border-box", outline: "none" }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label htmlFor="rp-confirm" style={{ display: "block", fontWeight: 700, fontSize: ".85rem", color: "#344054", marginBottom: 6 }}>
                  Confirm new password
                </label>
                <input
                  id="rp-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
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
                {status === "loading" ? "Updating…" : "Reset password →"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
