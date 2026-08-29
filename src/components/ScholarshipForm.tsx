"use client";
import { useState } from "react";
import Link from "next/link";
import { trackScholarshipApplication } from "@/lib/analyticsClient";

const OLEVEL_SUBJECTS: [string, string][] = [
  ["mathematics", "Mathematics"],
  ["english-language", "English Language"],
  ["computer-science", "Computer Science"],
  ["islamiyat", "Islamiyat"],
  ["pakistan-studies", "Pakistan Studies"],
  ["physics", "Physics"],
];

const INCOME_OPTIONS: [string, string][] = [
  ["under_50k", "Under PKR 50,000"],
  ["50k_100k", "PKR 50,000–100,000"],
  ["100k_150k", "PKR 100,001–150,000"],
  ["150k_250k", "PKR 150,001–250,000"],
  ["above_250k", "Above PKR 250,000"],
  ["prefer_not_to_say", "Prefer to discuss privately"],
];

const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d0d7e3", fontSize: ".92rem" };
const textareaStyle: React.CSSProperties = { ...inputStyle, resize: "vertical", fontFamily: "inherit" };
const labelStyle: React.CSSProperties = { display: "block", fontWeight: 700, fontSize: ".85rem", color: "#071b33", marginBottom: 6 };

export function ScholarshipForm({ defaultProgram, studentName: defaultStudentName }: { defaultProgram?: "sat" | "o-level"; studentName?: string }) {
  const [program, setProgram] = useState<"sat" | "o-level">(defaultProgram ?? "sat");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [agreesAttendanceWork, setAgreesAttendanceWork] = useState(false);
  const [agreesAssessmentsSupport, setAgreesAssessmentsSupport] = useState(false);
  const [parentCommitmentAgreed, setParentCommitmentAgreed] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!agreesAttendanceWork || !agreesAssessmentsSupport || !parentCommitmentAgreed || !privacyConsent) {
      setError("Please confirm all commitment and consent checkboxes below the form.");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const body = {
      program,
      studentName: fd.get("studentName"),
      studentEmail: fd.get("studentEmail"),
      age: fd.get("age"),
      city: fd.get("city"),
      school: fd.get("school"),
      grade: fd.get("grade"),
      subjectsRequired: fd.getAll("subjectsRequired")
        .map(v => OLEVEL_SUBJECTS.find(([value]) => value === v)?.[1] ?? v)
        .join(", ") || null,
      examSession: fd.get("examSession"),
      parentName: fd.get("parentName"),
      parentWhatsapp: fd.get("parentWhatsapp"),
      parentEmail: fd.get("parentEmail"),
      parentOccupation: fd.get("parentOccupation"),
      incomeRange: fd.get("incomeRange"),
      financialExplanation: fd.get("financialExplanation"),
      motivation: fd.get("motivation"),
      agreesAttendanceWork: true,
      agreesAssessmentsSupport: true,
      parentCommitmentAgreed: true,
      privacyConsent: true,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/scholarship/apply", {
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
      trackScholarshipApplication({ program });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "48px 32px", background: "linear-gradient(135deg,#eaf4ff,#f0fdf4)" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>🎓</div>
        <h2 style={{ margin: "0 0 10px", color: "#071b33" }}>Application Received</h2>
        <p style={{ color: "#344054", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 8px" }}>
          Thank you for applying for The Digital Tutor Opportunity Scholarship. We review scholarship applications
          individually and privately.
        </p>
        <p style={{ color: "#344054", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 20px" }}>
          If your application is shortlisted, our team will contact the student and parent/guardian for a short
          conversation. <strong>Being selected does not depend on perfect grades.</strong> We are looking for
          students who genuinely want to learn and are prepared to work.
        </p>
        <p style={{ color: "#6b7c93", fontSize: ".88rem" }}>
          Questions in the meantime? <a href="https://wa.me/" target="_blank" rel="noreferrer" style={{ color: "#155eef", fontWeight: 700 }}>Message us on WhatsApp</a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ display: "grid", gap: 20 }}>
      <div>
        <label style={labelStyle}>Program *</label>
        <div style={{ display: "flex", gap: 8, background: "#f1f5f9", borderRadius: 10, padding: 4, maxWidth: 320 }}>
          {(["sat", "o-level"] as const).map(p => (
            <button
              key={p} type="button" aria-pressed={program === p}
              onClick={() => setProgram(p)}
              style={{
                flex: 1, padding: "9px 8px", borderRadius: 7, border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: ".85rem", background: program === p ? "#fff" : "transparent",
                color: program === p ? "#155eef" : "#6b7c93",
                boxShadow: program === p ? "0 1px 6px rgba(7,27,51,.10)" : "none",
              }}>
              {p === "sat" ? "SAT Prep" : "O Level"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ margin: "0 0 12px", color: "#071b33", fontSize: "1rem" }}>Student information</h3>
        <div className="form-grid">
          <div className="field"><label>Student full name *</label><input name="studentName" required defaultValue={defaultStudentName} style={inputStyle} /></div>
          <div className="field"><label>Student email *</label><input type="email" name="studentEmail" required style={inputStyle} /></div>
          <div className="field"><label>Age *</label><input name="age" required style={inputStyle} /></div>
          <div className="field"><label>City *</label><input name="city" required style={inputStyle} /></div>
          <div className="field"><label>School</label><input name="school" style={inputStyle} /></div>
          <div className="field"><label>Current grade / year *</label><input name="grade" required style={inputStyle} /></div>
          <div className="field"><label>Expected exam date / session *</label><input name="examSession" required placeholder="e.g. May 2027" style={inputStyle} /></div>
          {program === "o-level" && (
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Subjects required</label>
              <select name="subjectsRequired" multiple size={5} style={{ ...inputStyle, height: "auto" }}>
                {OLEVEL_SUBJECTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <p style={{ margin: "6px 0 0", color: "#a0aec0", fontSize: ".78rem" }}>
                Hold Ctrl (Windows) or Cmd (Mac) to select more than one.
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 style={{ margin: "0 0 12px", color: "#071b33", fontSize: "1rem" }}>Parent / guardian</h3>
        <div className="form-grid">
          <div className="field"><label>Parent / guardian name *</label><input name="parentName" required style={inputStyle} /></div>
          <div className="field"><label>WhatsApp number *</label><input name="parentWhatsapp" required style={inputStyle} /></div>
          <div className="field"><label>Email *</label><input type="email" name="parentEmail" required style={inputStyle} /></div>
          <div className="field"><label>Occupation</label><input name="parentOccupation" style={inputStyle} /></div>
        </div>
      </div>

      <div>
        <h3 style={{ margin: "0 0 12px", color: "#071b33", fontSize: "1rem" }}>Financial need</h3>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Approximate monthly household income *</label>
          <select name="incomeRange" required defaultValue="">
            <option value="" disabled>Select a range</option>
            {INCOME_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="field">
          <label style={labelStyle}>Please briefly explain why paying the normal tuition fee would be difficult for your family. *</label>
          <textarea name="financialExplanation" required rows={3} style={textareaStyle} />
        </div>
      </div>

      <div>
        <h3 style={{ margin: "0 0 12px", color: "#071b33", fontSize: "1rem" }}>Student commitment</h3>
        <div className="field" style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Why do you want this scholarship, and what are you prepared to do to make the most of this opportunity? *</label>
          <textarea name="motivation" required rows={4} style={textareaStyle} />
        </div>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12, fontSize: ".88rem", color: "#344054", cursor: "pointer" }}>
          <input type="checkbox" checked={agreesAttendanceWork} onChange={e => setAgreesAttendanceWork(e.target.checked)} style={{ marginTop: 3 }} />
          If selected, I am willing to attend at least 90% of classes and complete at least 90% of assigned work.
        </label>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: ".88rem", color: "#344054", cursor: "pointer" }}>
          <input type="checkbox" checked={agreesAssessmentsSupport} onChange={e => setAgreesAssessmentsSupport(e.target.checked)} style={{ marginTop: 3 }} />
          I agree to take all required assessments and attend additional support / office hours when my teacher recommends them.
        </label>
      </div>

      <div>
        <h3 style={{ margin: "0 0 12px", color: "#071b33", fontSize: "1rem" }}>Parent commitment</h3>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: ".88rem", color: "#344054", cursor: "pointer" }}>
          <input type="checkbox" checked={parentCommitmentAgreed} onChange={e => setParentCommitmentAgreed(e.target.checked)} style={{ marginTop: 3 }} />
          I understand that this scholarship is based on financial need and student commitment. I will support the
          student&apos;s attendance and participation and communicate with The Digital Tutor if circumstances affect
          their ability to participate.
        </label>
      </div>

      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: ".82rem", color: "#6b7c93", cursor: "pointer" }}>
        <input type="checkbox" checked={privacyConsent} onChange={e => setPrivacyConsent(e.target.checked)} style={{ marginTop: 3 }} />
        I agree to the <Link href="/terms" style={{ color: "#155eef" }}>Terms of Service</Link> and{" "}
        <Link href="/privacy" style={{ color: "#155eef" }}>Privacy Policy</Link>, and consent to being contacted
        about this application. This application is private — participation in any future testimonial is always
        voluntary and has no effect on scholarship eligibility.
      </label>

      {error && <p style={{ color: "#dc2626", fontWeight: 600, fontSize: ".85rem" }}>⚠ {error}</p>}

      <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minHeight: 46 }}>
        {submitting ? "Submitting…" : "Apply for a 100% Opportunity Scholarship →"}
      </button>
      <p style={{ margin: 0, color: "#a0aec0", fontSize: ".78rem", textAlign: "center" }}>
        Applications are private. No financial documents required at this stage.
      </p>
    </form>
  );
}
