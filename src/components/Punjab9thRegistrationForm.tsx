"use client";
import { useState } from "react";
import { isValidEmail, passwordStrengthError } from "@/lib/validators";

const PUNJAB_BOARDS = ["Lahore", "Gujranwala", "Rawalpindi", "Faisalabad", "Multan", "Sargodha", "Sahiwal", "Bahawalpur", "D.G. Khan", "Not sure"];

const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d0d7e3", fontSize: ".92rem" };
const labelStyle: React.CSSProperties = { display: "block", fontWeight: 700, fontSize: ".85rem", color: "#071b33", marginBottom: 6 };

export function Punjab9thRegistrationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [parentConsent, setParentConsent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!parentConsent) {
      setError("Please confirm the consent checkbox below the form.");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const studentEmail = String(fd.get("studentEmail") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const confirmPassword = String(fd.get("confirmPassword") ?? "");

    if (!isValidEmail(studentEmail)) {
      setError("Enter a valid student email address.");
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
      parentName: fd.get("parentName"),
      parentWhatsapp: fd.get("parentWhatsapp"),
      city: fd.get("city"),
      punjabBoard: fd.get("punjabBoard"),
      schoolName: fd.get("schoolName"),
      studyGroup: fd.get("studyGroup"),
      teachingMedium: fd.get("teachingMedium"),
      preferredClassTime: fd.get("preferredClassTime"),
      deviceAvailable: fd.get("deviceAvailable"),
      howHeard: fd.get("howHeard"),
      parentConsent: true,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/punjab-9th/apply", {
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
      window.location.href = "/punjab-board-9th-class/portal";
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ display: "grid", gap: 20 }}>
      <div className="form-grid">
        <div className="field"><label style={labelStyle}>Student&apos;s full name *</label><input name="studentName" required style={inputStyle} /></div>
        <div className="field"><label style={labelStyle}>Student&apos;s email *</label><input type="email" name="studentEmail" required autoComplete="email" style={inputStyle} /></div>
        <div className="field"><label style={labelStyle}>Parent/guardian&apos;s name *</label><input name="parentName" required style={inputStyle} /></div>
        <div className="field"><label style={labelStyle}>Parent&apos;s WhatsApp number *</label><input type="tel" name="parentWhatsapp" required placeholder="03xx xxxxxxx" style={inputStyle} /></div>
        <div className="field"><label style={labelStyle}>City *</label><input name="city" required style={inputStyle} /></div>
        <div className="field">
          <label style={labelStyle}>Punjab Board *</label>
          <select name="punjabBoard" required defaultValue="">
            <option value="" disabled>Select a board</option>
            {PUNJAB_BOARDS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="field"><label style={labelStyle}>School name</label><input name="schoolName" style={inputStyle} /></div>
        <div className="field">
          <label style={labelStyle}>Study group *</label>
          <select name="studyGroup" required defaultValue="">
            <option value="" disabled>Select a group</option>
            <option value="Biology">Biology</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Not sure">Not sure</option>
          </select>
        </div>
        <div className="field">
          <label style={labelStyle}>Teaching medium *</label>
          <select name="teachingMedium" required defaultValue="">
            <option value="" disabled>Select</option>
            <option value="English">English</option>
            <option value="Urdu">Urdu</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>
        <div className="field">
          <label style={labelStyle}>Preferred class time *</label>
          <select name="preferredClassTime" required defaultValue="">
            <option value="" disabled>Select</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
            <option value="Either">Either</option>
          </select>
        </div>
        <div className="field">
          <label style={labelStyle}>Device available</label>
          <select name="deviceAvailable" defaultValue="">
            <option value="">Prefer not to say</option>
            <option value="Mobile">Mobile</option>
            <option value="Tablet">Tablet</option>
            <option value="Laptop or computer">Laptop or computer</option>
          </select>
        </div>
        <div className="field">
          <label style={labelStyle}>How did you hear about us?</label>
          <select name="howHeard" defaultValue="">
            <option value="">Prefer not to say</option>
            <option value="Facebook">Facebook</option>
            <option value="Instagram">Instagram</option>
            <option value="Friend">Friend</option>
            <option value="School">School</option>
            <option value="Google">Google</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <p style={{ margin: "0 0 12px", fontWeight: 800, color: "#071b33", fontSize: ".95rem" }}>Create a password for the student account</p>
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
        <input type="checkbox" checked={parentConsent} onChange={(e) => setParentConsent(e.target.checked)} style={{ marginTop: 3 }} />
        I am the student&apos;s parent or legal guardian, or I have their permission to submit this information. I
        agree to receive admission and class-related communication from The Digital Tutor through WhatsApp,
        telephone or email.
      </label>

      {error && <p style={{ color: "#dc2626", fontWeight: 600, fontSize: ".85rem" }}>⚠ {error}</p>}

      <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minHeight: 46 }}>
        {submitting ? "Submitting…" : "Reserve My First Week →"}
      </button>
      <p style={{ margin: 0, color: "#a0aec0", fontSize: ".78rem", textAlign: "center" }}>
        No payment is required to submit this form.
      </p>
    </form>
  );
}
