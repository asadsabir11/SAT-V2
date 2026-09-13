"use client";
import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { isValidEmail } from "@/lib/validators";

const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d0d7e3", fontSize: ".92rem" };
const labelStyle: React.CSSProperties = { display: "block", fontWeight: 700, fontSize: ".85rem", color: "#071b33", marginBottom: 6 };

export function TeacherApplicationForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !phone.trim() || !resume) {
      setError("Please fill in all fields and attach your resume.");
      return;
    }
    if (!isValidEmail(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      setUploadPct(1);
      const blob = await upload(resume.name, resume, {
        access: "public",
        handleUploadUrl: "/api/teacher-applications/upload",
        onUploadProgress: ({ percentage }) => setUploadPct(Math.round(percentage)),
      }).catch((err) => {
        throw new Error(`Resume upload failed: ${err?.message ?? err}`);
      });
      setUploadPct(0);

      const res = await fetch("/api/teacher-applications/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          resumeUrl: blob.url,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 40, background: "linear-gradient(135deg,#d4faf5,#eaf4ff)" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
        <p style={{ fontWeight: 800, color: "#075a50", marginBottom: 8, fontSize: "1.05rem" }}>Thank you for applying!</p>
        <p style={{ color: "#2d6b60", lineHeight: 1.65, maxWidth: 460, margin: "0 auto" }}>
          We&apos;ve received your application and resume. If your profile is a good fit, our team will contact you
          directly by phone.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ display: "grid", gap: 20 }}>
      <div className="form-grid">
        <div className="field">
          <label style={labelStyle}>Full name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        </div>
        <div className="field">
          <label style={labelStyle}>Email *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" style={inputStyle} />
        </div>
        <div className="field">
          <label style={labelStyle}>Phone number *</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03xx xxxxxxx" style={inputStyle} />
        </div>
      </div>

      <div className="field">
        <label style={labelStyle}>Resume * (PDF or Word, max 10MB)</label>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style={{ display: "none" }} onChange={(e) => setResume(e.target.files?.[0] ?? null)} />
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button type="button" onClick={() => fileRef.current?.click()} style={{ padding: "8px 14px", border: "1.5px solid #dce5ef", borderRadius: 9, background: "#fff", fontWeight: 700, fontSize: ".82rem", cursor: "pointer", color: "#344054" }}>
            {resume ? "Change file" : "Choose file"}
          </button>
          {resume && <span style={{ fontSize: ".8rem", color: "#344054", fontWeight: 600 }}>{resume.name}</span>}
        </div>
        {uploadPct > 0 && <p style={{ fontSize: ".75rem", color: "#6b7c93", marginTop: 6 }}>Uploading… {uploadPct}%</p>}
      </div>

      {error && <p style={{ color: "#dc2626", fontWeight: 600, fontSize: ".85rem" }}>⚠ {error}</p>}

      <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minHeight: 46 }}>
        {submitting ? "Submitting…" : "Submit Application →"}
      </button>
    </form>
  );
}
