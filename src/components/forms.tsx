"use client";
import React, { useState } from "react";

const COUNTRIES = ["Pakistan","Bangladesh","Nigeria","Indonesia","Malaysia","South Korea","Haiti","Vietnam","Nepal","Ghana","Kenya","Philippines","Egypt","Sri Lanka","India","Morocco","Other"];
const PACKAGES  = ["Free","Founder Core","Premium","Sponsored/NGO"];
const GRADES    = ["Grade 8","Grade 9","Grade 10","Grade 11","Grade 12","College Freshman","College Sophomore","Other"];

// ── Validators ────────────────────────────────────────────────────────────────
function vName(v: string) {
  if (!v.trim()) return "Required";
  if (v.trim().length < 2) return "Minimum 2 characters";
  if (v.trim().length > 100) return "Maximum 100 characters";
  if (!/^[a-zA-Z\s\-'.]+$/.test(v.trim())) return "Letters, spaces and hyphens only";
  return "";
}
function vEmail(v: string) {
  if (!v.trim()) return "Required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return "Enter a valid email address (e.g. name@gmail.com)";
  return "";
}
function vPhone(v: string) {
  if (!v.trim()) return "Required";
  const digits = v.replace(/\D/g, "");
  if (digits.length < 7) return "Include country code, e.g. +92 300 1234567";
  if (digits.length > 15) return "Number too long";
  if (!/^[+\d\s\-().]+$/.test(v)) return "Invalid characters in phone number";
  return "";
}
function vCity(v: string) {
  if (!v.trim()) return "Required";
  if (v.trim().length < 2) return "Minimum 2 characters";
  if (v.trim().length > 100) return "Maximum 100 characters";
  return "";
}
function vSelect(v: string) {
  if (!v) return "Please select an option";
  return "";
}
function vSatScore(v: string) {
  if (!v) return "";
  const n = Number(v);
  if (isNaN(n) || !Number.isInteger(n)) return "Must be a whole number";
  if (n < 400 || n > 1600) return "Must be between 400 and 1600";
  if (n % 10 !== 0) return "SAT scores are multiples of 10 (e.g. 1200, 1350)";
  return "";
}
function vFutureDate(v: string) {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "Invalid date";
  if (d < new Date()) return "Target date must be in the future";
  return "";
}

// ── Error message component ───────────────────────────────────────────────────
function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <span style={{ color: "#c62828", fontSize: ".77rem", marginTop: 4, display: "block", fontWeight: 600 }}>
      ⚠ {msg}
    </span>
  );
}

function errStyle(hasError: boolean): React.CSSProperties {
  return hasError
    ? { borderColor: "#e53935", boxShadow: "0 0 0 2px rgba(229,57,53,.15)", background: "#fff8f8" }
    : {};
}

// ── useSubmit hook ────────────────────────────────────────────────────────────
function useSubmit(endpoint: string, onSuccess?: (p: Record<string, string>) => void) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  async function submit(payload: Record<string, string>) {
    setStatus("loading");
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error();
      setStatus("success");
      onSuccess?.(payload);
    } catch {
      setStatus("error");
    }
  }
  return { status, submit };
}

// ── Registration Form ─────────────────────────────────────────────────────────
type RegFields = {
  studentName: string; parentName: string;
  studentEmail: string; parentEmail: string;
  whatsapp: string; country: string;
  city: string; grade: string;
  targetSatDate: string; currentScore: string; targetScore: string;
  packageType: string; preferredClassTime: string; source: string;
  consent: boolean;
};

const REG_INIT: RegFields = {
  studentName: "", parentName: "", studentEmail: "", parentEmail: "",
  whatsapp: "", country: "", city: "", grade: "",
  targetSatDate: "", currentScore: "", targetScore: "",
  packageType: "Founder Core", preferredClassTime: "", source: "",
  consent: false,
};

export function RegistrationForm() {
  const { status, submit } = useSubmit("/api/leads/student", (p) => {
    localStorage.setItem("sat_student_email", p.studentEmail);
    localStorage.setItem("sat_student_name", p.studentName);
    localStorage.setItem("sat_student_data", JSON.stringify({
      studentName: p.studentName, country: p.country,
      packageType: p.packageType, targetScore: p.targetScore, grade: p.grade,
    }));
  });

  const [fields, setFields] = useState<RegFields>(REG_INIT);
  const [errors, setErrors] = useState<Partial<Record<keyof RegFields, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof RegFields, boolean>>>({});

  function validateField(name: keyof RegFields, value: string | boolean): string {
    switch (name) {
      case "studentName": case "parentName": return vName(value as string);
      case "studentEmail": case "parentEmail": return vEmail(value as string);
      case "whatsapp": return vPhone(value as string);
      case "city": return vCity(value as string);
      case "country": case "grade": return vSelect(value as string);
      case "packageType": return vSelect(value as string);
      case "currentScore": case "targetScore": return vSatScore(value as string);
      case "targetSatDate": return vFutureDate(value as string);
      case "consent": return value ? "" : "You must consent to proceed";
      default: return "";
    }
  }

  function change(name: keyof RegFields, value: string | boolean) {
    setFields(f => ({ ...f, [name]: value }));
    if (touched[name]) {
      setErrors(e => ({ ...e, [name]: validateField(name, value) }));
    }
  }

  function blur(name: keyof RegFields) {
    setTouched(t => ({ ...t, [name]: true }));
    setErrors(e => ({ ...e, [name]: validateField(name, fields[name]) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const required: (keyof RegFields)[] = [
      "studentName","parentName","studentEmail","parentEmail",
      "whatsapp","country","city","grade","packageType","consent",
    ];
    const optional: (keyof RegFields)[] = ["currentScore","targetScore","targetSatDate"];
    const allErrors: Partial<Record<keyof RegFields, string>> = {};
    const allTouched: Partial<Record<keyof RegFields, boolean>> = {};
    [...required, ...optional].forEach(name => {
      allTouched[name] = true;
      allErrors[name] = validateField(name, fields[name]);
    });

    // Cross-field: target score must be >= current score
    if (fields.currentScore && fields.targetScore) {
      const cur = Number(fields.currentScore);
      const tar = Number(fields.targetScore);
      if (!isNaN(cur) && !isNaN(tar) && tar < cur) {
        allErrors.targetScore = "Target score should be higher than current score";
      }
    }

    setTouched(allTouched);
    setErrors(allErrors);
    if (Object.values(allErrors).some(e => e)) return;

    submit({
      studentName: fields.studentName.trim(),
      parentName: fields.parentName.trim(),
      studentEmail: fields.studentEmail.trim().toLowerCase(),
      parentEmail: fields.parentEmail.trim().toLowerCase(),
      whatsapp: fields.whatsapp.trim(),
      country: fields.country,
      city: fields.city.trim(),
      grade: fields.grade,
      targetSatDate: fields.targetSatDate,
      currentScore: fields.currentScore,
      targetScore: fields.targetScore,
      packageType: fields.packageType,
      preferredClassTime: fields.preferredClassTime.trim(),
      source: fields.source.trim(),
      consent: "true",
    });
  }

  const text = (name: keyof RegFields, placeholder?: string) => ({
    id: name, name,
    value: fields[name] as string,
    placeholder,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => change(name, e.target.value),
    onBlur: () => blur(name),
    style: errStyle(!!errors[name]),
  });

  const sel = (name: keyof RegFields) => ({
    id: name, name,
    value: fields[name] as string,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => change(name, e.target.value),
    onBlur: () => blur(name),
    style: errStyle(!!errors[name]),
  });

  if (status === "success") return (
    <div style={{ padding: 28, borderRadius: 16, background: "linear-gradient(135deg,#d4faf5,#eaf4ff)", border: "1px solid rgba(24,169,153,.2)" }}>
      <p style={{ color: "#075a50", fontWeight: 700, fontSize: "1.05rem", margin: "0 0 6px" }}>You&apos;re registered!</p>
      <p style={{ color: "#2d6b60", margin: "0 0 20px", lineHeight: 1.65 }}>
        We received your information. Your student dashboard is ready — go there now to take your free diagnostic test and see your personalised study plan.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <a href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#155eef,#18a999)", color: "#fff", fontWeight: 800, padding: "12px 22px", borderRadius: 999, fontSize: ".95rem", textDecoration: "none" }}>
          Go to my dashboard →
        </a>
        <a href="/diagnostic" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", color: "#071b33", fontWeight: 700, padding: "12px 22px", borderRadius: 999, fontSize: ".95rem", border: "1.5px solid #dce5ef", textDecoration: "none" }}>
          Take free diagnostic
        </a>
      </div>
    </div>
  );

  return (
    <form className="form card" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">

        <div className="field">
          <label htmlFor="studentName">Student full name *</label>
          <input type="text" {...text("studentName", "e.g. Fatima Khan")} />
          <Err msg={touched.studentName ? errors.studentName : undefined} />
        </div>

        <div className="field">
          <label htmlFor="parentName">Parent full name *</label>
          <input type="text" {...text("parentName", "e.g. Ahmed Khan")} />
          <Err msg={touched.parentName ? errors.parentName : undefined} />
        </div>

        <div className="field">
          <label htmlFor="studentEmail">Student email *</label>
          <input type="email" {...text("studentEmail", "student@gmail.com")} />
          <Err msg={touched.studentEmail ? errors.studentEmail : undefined} />
        </div>

        <div className="field">
          <label htmlFor="parentEmail">Parent email *</label>
          <input type="email" {...text("parentEmail", "parent@gmail.com")} />
          <Err msg={touched.parentEmail ? errors.parentEmail : undefined} />
        </div>

        <div className="field">
          <label htmlFor="whatsapp">WhatsApp number *</label>
          <input type="tel" {...text("whatsapp", "+92 300 1234567")} />
          <Err msg={touched.whatsapp ? errors.whatsapp : undefined} />
        </div>

        <div className="field">
          <label htmlFor="country">Country *</label>
          <select {...sel("country")}>
            <option value="">Select country</option>
            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <Err msg={touched.country ? errors.country : undefined} />
        </div>

        <div className="field">
          <label htmlFor="city">City *</label>
          <input type="text" {...text("city", "e.g. Lahore")} />
          <Err msg={touched.city ? errors.city : undefined} />
        </div>

        <div className="field">
          <label htmlFor="grade">Grade / year *</label>
          <select {...sel("grade")}>
            <option value="">Select grade</option>
            {GRADES.map(g => <option key={g}>{g}</option>)}
          </select>
          <Err msg={touched.grade ? errors.grade : undefined} />
        </div>

        <div className="field">
          <label htmlFor="targetSatDate">Target SAT date</label>
          <input type="date" {...text("targetSatDate")} />
          <Err msg={touched.targetSatDate ? errors.targetSatDate : undefined} />
        </div>

        <div className="field">
          <label htmlFor="currentScore">Current SAT score</label>
          <input type="number" min={400} max={1600} step={10} {...text("currentScore", "400 – 1600")} />
          <Err msg={touched.currentScore ? errors.currentScore : undefined} />
        </div>

        <div className="field">
          <label htmlFor="targetScore">Target SAT score</label>
          <input type="number" min={400} max={1600} step={10} {...text("targetScore", "400 – 1600")} />
          <Err msg={touched.targetScore ? errors.targetScore : undefined} />
        </div>

        <div className="field">
          <label htmlFor="packageType">Preferred package *</label>
          <select {...sel("packageType")}>
            {PACKAGES.map(p => <option key={p}>{p}</option>)}
          </select>
          <Err msg={touched.packageType ? errors.packageType : undefined} />
        </div>

        <div className="field">
          <label htmlFor="preferredClassTime">Preferred class time</label>
          <input type="text" {...text("preferredClassTime", "e.g. Weekday evenings (PKT)")} />
        </div>

        <div className="field">
          <label htmlFor="source">How did you hear about us?</label>
          <input type="text" {...text("source", "e.g. WhatsApp, Instagram, friend")} />
        </div>

      </div>

      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", marginTop: 4 }}>
        <input
          type="checkbox"
          name="consent"
          checked={fields.consent}
          onChange={e => change("consent", e.target.checked)}
          onBlur={() => blur("consent")}
          style={{ marginTop: 3, flexShrink: 0 }}
        />
        <span>I consent to being contacted about the diagnostic, cohort, and regional study group.</span>
      </label>
      {touched.consent && <Err msg={errors.consent} />}

      <button className="btn btn-primary" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Submitting…" : "Register now"}
      </button>

      {status === "error" && (
        <div className="note">Something went wrong. Please try again or contact us directly.</div>
      )}
    </form>
  );
}

// ── Webinar Form ──────────────────────────────────────────────────────────────
export function WebinarForm() {
  const { status, submit } = useSubmit("/api/leads/webinar");
  return (
    <form className="form card" onSubmit={e => { e.preventDefault(); submit(Object.fromEntries(new FormData(e.currentTarget)) as Record<string,string>); }}>
      <div className="form-grid">
        <div className="field"><label>Parent name *</label><input name="parentName" required minLength={2} maxLength={100} /></div>
        <div className="field"><label>Email *</label><input name="email" type="email" required /></div>
        <div className="field"><label>WhatsApp *</label><input name="whatsapp" type="tel" required placeholder="+92 300 1234567" /></div>
        <div className="field"><label>Country *</label><select name="country" required defaultValue=""><option value="" disabled>Select country</option>{COUNTRIES.map(c=><option key={c}>{c}</option>)}</select></div>
        <div className="field"><label>Student grade *</label><select name="studentGrade" required defaultValue=""><option value="" disabled>Select grade</option>{GRADES.map(g=><option key={g}>{g}</option>)}</select></div>
        <div className="field"><label>Interested package *</label><select name="interestedPackage" required defaultValue=""><option value="" disabled>Select one</option>{PACKAGES.map(p=><option key={p}>{p}</option>)}</select></div>
      </div>
      <div className="field"><label>Main concern *</label><textarea name="mainConcern" required minLength={10} placeholder="Tell us what you hope your child will get out of this program…" /></div>
      <button className="btn btn-primary" disabled={status==="loading"}>{status==="loading"?"Saving your seat…":"Register for free webinar"}</button>
      {status==="success"&&<div className="success">You&apos;re registered. We&apos;ll send webinar details and a practical parent guide.</div>}
      {status==="error"&&<div className="note">Could not submit. Please try again.</div>}
    </form>
  );
}

// ── Partner Inquiry Form ──────────────────────────────────────────────────────
export function PartnerInquiryForm() {
  const { status, submit } = useSubmit("/api/leads/partner");
  return (
    <form className="form card" onSubmit={e => { e.preventDefault(); submit(Object.fromEntries(new FormData(e.currentTarget)) as Record<string,string>); }}>
      <div className="form-grid">
        <div className="field"><label>Organization name *</label><input name="organizationName" required minLength={2} /></div>
        <div className="field"><label>Contact person *</label><input name="contactName" required minLength={2} /></div>
        <div className="field"><label>Email *</label><input name="email" type="email" required /></div>
        <div className="field"><label>Country *</label><select name="country" required defaultValue=""><option value="" disabled>Select country</option>{COUNTRIES.map(c=><option key={c}>{c}</option>)}</select></div>
        <div className="field"><label>Organization type *</label><select name="organizationType" required defaultValue=""><option value="" disabled>Select type</option>{["School","NGO","Scholarship Program","Diaspora Organization","Community Organization","Corporate CSR","Other"].map(t=><option key={t}>{t}</option>)}</select></div>
        <div className="field"><label>Estimated students</label><input name="estimatedStudents" type="number" min={1} max={100000} placeholder="e.g. 50" /></div>
      </div>
      <div className="field"><label>Message *</label><textarea name="message" required minLength={20} placeholder="Describe your organization and what you are looking for…" /></div>
      <button className="btn btn-primary" disabled={status==="loading"}>{status==="loading"?"Sending…":"Start a partnership conversation"}</button>
      {status==="success"&&<div className="success">Thank you. We received your inquiry and will follow up with cohort options.</div>}
      {status==="error"&&<div className="note">Could not submit. Please try again.</div>}
    </form>
  );
}

// ── Contact Form ──────────────────────────────────────────────────────────────
export function ContactForm() {
  const { status, submit } = useSubmit("/api/leads/contact");
  return (
    <form className="form card" onSubmit={e => { e.preventDefault(); submit(Object.fromEntries(new FormData(e.currentTarget)) as Record<string,string>); }}>
      <div className="form-grid">
        <div className="field"><label>Name *</label><input name="name" required minLength={2} /></div>
        <div className="field"><label>Email *</label><input name="email" type="email" required /></div>
        <div className="field"><label>Country *</label><select name="country" required defaultValue=""><option value="" disabled>Select country</option>{COUNTRIES.map(c=><option key={c}>{c}</option>)}</select></div>
        <div className="field"><label>I am a… *</label><select name="role" required defaultValue=""><option value="" disabled>Select role</option>{["Student","Parent","Teacher","School","NGO","Sponsor","Other"].map(r=><option key={r}>{r}</option>)}</select></div>
      </div>
      <div className="field"><label>Message *</label><textarea name="message" required minLength={10} placeholder="How can we help you?" /></div>
      <button className="btn btn-primary" disabled={status==="loading"}>{status==="loading"?"Sending…":"Send message"}</button>
      {status==="success"&&<div className="success">Message received. We&apos;ll be in touch.</div>}
      {status==="error"&&<div className="note">Could not submit. Please try again.</div>}
    </form>
  );
}
