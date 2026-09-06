"use client";
import { useState } from "react";
import { isValidEmail, passwordStrengthError } from "@/lib/validators";

const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d0d7e3", fontSize: ".92rem" };
const labelStyle: React.CSSProperties = { display: "block", fontWeight: 700, fontSize: ".85rem", color: "#071b33", marginBottom: 6 };

export function AmnaShamimaRegistrationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!consent) {
      setError("Please confirm the consent checkbox below the form.");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const studentEmail = String(fd.get("studentEmail") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const confirmPassword = String(fd.get("confirmPassword") ?? "");

    if (!isValidEmail(studentEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    const pwError = passwordStrengthError(password);
    if (pwError) {
      setError(`Password: ${pwError}`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const body = {
      studentName: fd.get("studentName"),
      studentEmail,
      password,
      whatsapp: fd.get("whatsapp"),
      city: fd.get("city"),
      consent: true,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/amna-shamima/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      // Full page navigation so the Header picks up the new session cookie —
      // the account now exists and they're already signed in.
      window.location.href = "/amna-shamima/portal";
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ display: "grid", gap: 20 }}>
      <div className="form-grid">
        <div className="field"><label style={labelStyle}>Full name *</label><input name="studentName" required style={inputStyle} /></div>
        <div className="field"><label style={labelStyle}>Email *</label><input type="email" name="studentEmail" required autoComplete="email" style={inputStyle} /></div>
        <div className="field"><label style={labelStyle}>WhatsApp number *</label><input type="tel" name="whatsapp" required placeholder="03xx xxxxxxx" style={inputStyle} /></div>
        <div className="field"><label style={labelStyle}>City</label><input name="city" style={inputStyle} /></div>
      </div>

      <div>
        <p style={{ margin: "0 0 12px", fontWeight: 800, color: "#071b33", fontSize: ".95rem" }}>Create a password for your account</p>
        <div className="form-grid">
          <div className="field">
            <label style={labelStyle}>Password *</label>
            <input type="password" name="password" required autoComplete="new-password" placeholder="Min 8 chars, include a number" style={inputStyle} />
          </div>
          <div className="field">
            <label style={labelStyle}>Confirm password *</label>
            <input type="password" name="confirmPassword" required autoComplete="new-password" placeholder="Repeat your password" style={inputStyle} />
          </div>
        </div>
      </div>

      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: ".82rem", color: "#6b7c93", cursor: "pointer" }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3 }} />
        I confirm I am a student of the Amna Shamima Foundation and agree to receive class-related communication
        from The Digital Tutor through WhatsApp or email.
      </label>

      {error && <p style={{ color: "#dc2626", fontWeight: 600, fontSize: ".85rem" }}>⚠ {error}</p>}

      <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minHeight: 46 }}>
        {submitting ? "Submitting…" : "Register →"}
      </button>
    </form>
  );
}
