"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SUBJECT_OPTIONS, TARGET_EXAM_SESSIONS, amountDueForSubject, type SubjectOption } from "@/lib/olevelApplicationOptions";
import { trackLead, trackRegistrationStarted, trackContactAction } from "@/lib/analyticsClient";
import { isValidEmail, passwordStrengthError } from "@/lib/validators";

const COUNTRIES = ["Pakistan","Bangladesh","Nigeria","Indonesia","Malaysia","South Korea","Haiti","Vietnam","Nepal","Ghana","Kenya","Philippines","Egypt","Sri Lanka","India","Morocco","Other"];
const PACKAGES  = ["Free","Core Plan"];
const GRADES    = ["Grade 8","Grade 9","Grade 10","Grade 11","Grade 12","College Freshman","College Sophomore","Other"];

// ── Validators ────────────────────────────────────────────────────────────────
export function vName(v: string) {
  if (!v.trim()) return "Required";
  if (v.trim().length < 2) return "Minimum 2 characters";
  if (v.trim().length > 100) return "Maximum 100 characters";
  if (!/^[a-zA-Z\s\-'.]+$/.test(v.trim())) return "Letters, spaces and hyphens only";
  return "";
}
export function vEmail(v: string) {
  if (!v.trim()) return "Required";
  if (!isValidEmail(v)) return "Enter a valid email address (e.g. name@gmail.com)";
  return "";
}
export function vPhone(v: string) {
  if (!v.trim()) return "Required";
  const digits = v.replace(/\D/g, "");
  if (digits.length < 7) return "Include country code, e.g. +92 300 1234567";
  if (digits.length > 15) return "Number too long";
  if (!/^[+\d\s\-().]+$/.test(v)) return "Invalid characters in phone number";
  return "";
}
export function vCity(v: string) {
  if (!v.trim()) return "Required";
  if (v.trim().length < 2) return "Minimum 2 characters";
  if (v.trim().length > 100) return "Maximum 100 characters";
  return "";
}
export function vSelect(v: string) {
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
function vPassword(v: string) {
  return passwordStrengthError(v);
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
export function useSubmit(endpoint: string, onSuccess?: (p: Record<string, string>) => void) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  async function submit(payload: Record<string, string>) {
    setStatus("loading");
    setErrorMessage("");
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        setErrorMessage(data.error ?? "");
        throw new Error();
      }
      setStatus("success");
      onSuccess?.(payload);
    } catch {
      setStatus("error");
    }
  }
  return { status, submit, errorMessage };
}

// ── Registration Form ─────────────────────────────────────────────────────────
type RegFields = {
  studentName: string; parentName: string;
  studentEmail: string; parentEmail: string;
  whatsapp: string; country: string;
  city: string; grade: string;
  targetSatDate: string; currentScore: string; targetScore: string;
  packageType: string; preferredClassTime: string; source: string;
  password: string; confirmPassword: string;
  consent: boolean;
};

const REG_INIT: RegFields = {
  studentName: "", parentName: "", studentEmail: "", parentEmail: "",
  whatsapp: "", country: "", city: "", grade: "",
  targetSatDate: "", currentScore: "", targetScore: "",
  packageType: "Core Plan", preferredClassTime: "", source: "",
  password: "", confirmPassword: "",
  consent: false,
};

export function RegistrationForm() {
  const { status, submit, errorMessage } = useSubmit("/api/leads/student", (p) => {
    // SAT registrations previously fired no analytics event at all, so organic
    // SAT signups were invisible next to the O-Level ones.
    trackLead({ subject: "sat-registration" });
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
      case "studentEmail": return vEmail(value as string);
      case "parentEmail": return (value as string).trim() ? vEmail(value as string) : "";
      case "whatsapp": return vPhone(value as string);
      case "city": return vCity(value as string);
      case "country": case "grade": return vSelect(value as string);
      case "packageType": return vSelect(value as string);
      case "currentScore": case "targetScore": return vSatScore(value as string);
      case "targetSatDate": return vFutureDate(value as string);
      case "password": return vPassword(value as string);
      case "confirmPassword": return (value as string) ? "" : "Required";
      case "consent": return value ? "" : "You must consent to proceed";
      default: return "";
    }
  }

  function change(name: keyof RegFields, value: string | boolean) {
    trackRegistrationStarted({ program: "sat" }); // no-ops after the first call
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
      "studentName","parentName","studentEmail",
      "whatsapp","country","city","grade","packageType",
      "password","confirmPassword","consent",
    ];
    const optional: (keyof RegFields)[] = ["parentEmail","currentScore","targetScore","targetSatDate"];
    const allErrors: Partial<Record<keyof RegFields, string>> = {};
    const allTouched: Partial<Record<keyof RegFields, boolean>> = {};
    [...required, ...optional].forEach(name => {
      allTouched[name] = true;
      allErrors[name] = validateField(name, fields[name]);
    });

    // Cross-field: passwords must match
    if (fields.password && fields.confirmPassword && fields.password !== fields.confirmPassword) {
      allErrors.confirmPassword = "Passwords do not match";
    }

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
      password: fields.password,
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
          <label htmlFor="parentEmail">Parent email</label>
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

      {/* Password section */}
      <div style={{ borderTop: "1px solid #edf2f7", paddingTop: 20, marginTop: 4 }}>
        <p style={{ fontWeight: 700, color: "#344054", fontSize: ".88rem", margin: "0 0 14px" }}>
          Create a password for your student account
        </p>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="password">Password *</label>
            <input type="password" {...text("password", "Min 8 chars, include a number")} autoComplete="new-password" />
            <Err msg={touched.password ? errors.password : undefined} />
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Confirm password *</label>
            <input type="password" {...text("confirmPassword", "Repeat your password")} autoComplete="new-password" />
            <Err msg={touched.confirmPassword ? errors.confirmPassword : undefined} />
          </div>
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
        <div className="note">{errorMessage || "Something went wrong. Please try again or contact us directly."}</div>
      )}
    </form>
  );
}

// ── Contact Form ──────────────────────────────────────────────────────────────
export function ContactForm() {
  const { status, submit } = useSubmit("/api/leads/contact", () => trackContactAction({ channel: "contact_form" }));
  return (
    <form className="form card" onSubmit={e => { e.preventDefault(); submit(Object.fromEntries(new FormData(e.currentTarget)) as Record<string,string>); }}>
      <div className="form-grid">
        <div className="field"><label>Name *</label><input name="name" required minLength={2} /></div>
        <div className="field"><label>Email *</label><input name="email" type="email" required /></div>
        <div className="field"><label>Country *</label><select name="country" required defaultValue=""><option value="" disabled>Select country</option>{COUNTRIES.map(c=><option key={c}>{c}</option>)}</select></div>
        <div className="field"><label>I am a… *</label><select name="role" required defaultValue=""><option value="" disabled>Select role</option>{["Student","Parent","Teacher","Other"].map(r=><option key={r}>{r}</option>)}</select></div>
      </div>
      <div className="field"><label>Message *</label><textarea name="message" required minLength={10} placeholder="How can we help you?" /></div>
      <button className="btn btn-primary" disabled={status==="loading"}>{status==="loading"?"Sending…":"Send message"}</button>
      {status==="success"&&<div className="success">Message received. We&apos;ll be in touch.</div>}
      {status==="error"&&<div className="note">Could not submit. Please try again.</div>}
    </form>
  );
}

// ── O-Level Registration Form ───────────────────────────────────────────────
// Self-serve, like SAT: student registers free with a password, browses
// locked content, then pays to unlock a subject from within the dashboard.
type OLevelRegFields = {
  studentName: string; studentEmail: string; password: string; confirmPassword: string;
  parentName: string; parentEmail: string; parentWhatsapp: string;
  studentGrade: string; schoolName: string; city: string; targetExamSession: string;
  source: string; consent: boolean; studyGroupConsent: boolean;
};

const OLEVEL_REG_INIT: OLevelRegFields = {
  studentName: "", studentEmail: "", password: "", confirmPassword: "",
  parentName: "", parentEmail: "", parentWhatsapp: "",
  studentGrade: "", schoolName: "", city: "", targetExamSession: "",
  source: "", consent: false, studyGroupConsent: false,
};

export function OLevelRegistrationForm() {
  const [fields, setFields] = useState<OLevelRegFields>(OLEVEL_REG_INIT);
  const [errors, setErrors] = useState<Partial<Record<keyof OLevelRegFields, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof OLevelRegFields, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function validateField(name: keyof OLevelRegFields, value: string | boolean): string {
    switch (name) {
      case "studentName": case "parentName": return vName(value as string);
      case "studentEmail": return vEmail(value as string);
      case "parentEmail": {
        const err = vEmail(value as string);
        if (err) return err;
        if ((value as string).trim().toLowerCase() === fields.studentEmail.trim().toLowerCase()) {
          return "Must be different from the student email";
        }
        return "";
      }
      case "parentWhatsapp": return vPhone(value as string);
      case "city": return vCity(value as string);
      case "studentGrade": return vSelect(value as string);
      case "targetExamSession": return vSelect(value as string);
      case "password": return passwordStrengthError(value as string);
      case "confirmPassword": return (value as string) ? "" : "Required";
      case "consent": return value ? "" : "You must consent to proceed";
      default: return "";
    }
  }

  function change(name: keyof OLevelRegFields, value: string | boolean) {
    trackRegistrationStarted({ program: "o-level" }); // no-ops after the first call
    setFields(f => ({ ...f, [name]: value }));
    if (touched[name]) setErrors(e => ({ ...e, [name]: validateField(name, value) }));
  }

  function blur(name: keyof OLevelRegFields) {
    setTouched(t => ({ ...t, [name]: true }));
    setErrors(e => ({ ...e, [name]: validateField(name, fields[name]) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const required: (keyof OLevelRegFields)[] = [
      "studentName", "studentEmail", "password", "confirmPassword",
      "parentName", "parentEmail", "parentWhatsapp",
      "studentGrade", "city", "targetExamSession", "consent",
    ];
    const allErrors: Partial<Record<keyof OLevelRegFields, string>> = {};
    const allTouched: Partial<Record<keyof OLevelRegFields, boolean>> = {};
    required.forEach(name => {
      allTouched[name] = true;
      allErrors[name] = validateField(name, fields[name]);
    });
    if (fields.password && fields.confirmPassword && fields.password !== fields.confirmPassword) {
      allErrors.confirmPassword = "Passwords do not match";
    }
    setTouched(allTouched);
    setErrors(allErrors);
    if (Object.values(allErrors).some(e => e)) return;

    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/o-level/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: fields.studentName.trim(),
          studentEmail: fields.studentEmail.trim().toLowerCase(),
          password: fields.password,
          parentName: fields.parentName.trim(),
          parentEmail: fields.parentEmail.trim().toLowerCase(),
          parentWhatsapp: fields.parentWhatsapp.trim(),
          studentGrade: fields.studentGrade.trim(),
          schoolName: fields.schoolName.trim(),
          city: fields.city.trim(),
          targetExamSession: fields.targetExamSession,
          source: fields.source.trim(),
          consent: "true",
          studyGroupConsent: fields.studyGroupConsent ? "true" : "false",
            }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      trackLead({ subject: "o-level-registration" });
      // Full page reload so the Header re-fetches the session cookie
      window.location.href = "/dashboard";
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  const text = (name: keyof OLevelRegFields, placeholder?: string) => ({
    id: name, name,
    value: fields[name] as string,
    placeholder,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => change(name, e.target.value),
    onBlur: () => blur(name),
    style: errStyle(!!errors[name]),
  });

  const sel = (name: keyof OLevelRegFields) => ({
    id: name, name,
    value: fields[name] as string,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => change(name, e.target.value),
    onBlur: () => blur(name),
    style: errStyle(!!errors[name]),
  });

  return (
    <form className="form card" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="studentName">Student first name *</label>
          <input type="text" {...text("studentName", "e.g. Fatima")} />
          <Err msg={touched.studentName ? errors.studentName : undefined} />
        </div>
        <div className="field">
          <label htmlFor="studentEmail">Student email *</label>
          <input type="email" {...text("studentEmail", "student@gmail.com")} />
          <Err msg={touched.studentEmail ? errors.studentEmail : undefined} />
        </div>
        <div className="field">
          <label htmlFor="parentName">Parent full name *</label>
          <input type="text" {...text("parentName", "e.g. Ahmed Khan")} />
          <Err msg={touched.parentName ? errors.parentName : undefined} />
        </div>
        <div className="field">
          <label htmlFor="parentEmail">Parent email *</label>
          <input type="email" {...text("parentEmail", "parent@gmail.com")} />
          <Err msg={touched.parentEmail ? errors.parentEmail : undefined} />
        </div>
        <div className="field">
          <label htmlFor="parentWhatsapp">Parent WhatsApp number *</label>
          <input type="tel" {...text("parentWhatsapp", "+92 300 1234567")} />
          <Err msg={touched.parentWhatsapp ? errors.parentWhatsapp : undefined} />
        </div>
        <div className="field">
          <label htmlFor="studentGrade">Student grade / year *</label>
          <select {...sel("studentGrade")}>
            <option value="">Select grade</option>
            {GRADES.map(g => <option key={g}>{g}</option>)}
          </select>
          <Err msg={touched.studentGrade ? errors.studentGrade : undefined} />
        </div>
        <div className="field">
          <label htmlFor="schoolName">School name</label>
          <input type="text" {...text("schoolName", "Optional")} />
        </div>
        <div className="field">
          <label htmlFor="city">City *</label>
          <input type="text" {...text("city", "e.g. Lahore")} />
          <Err msg={touched.city ? errors.city : undefined} />
        </div>
        <div className="field">
          <label htmlFor="targetExamSession">Target exam session *</label>
          <select {...sel("targetExamSession")}>
            <option value="">Select session</option>
            {TARGET_EXAM_SESSIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <Err msg={touched.targetExamSession ? errors.targetExamSession : undefined} />
        </div>
        <div className="field">
          <label htmlFor="source">How did you hear about us?</label>
          <input type="text" {...text("source", "e.g. Facebook, Instagram, friend")} />
        </div>
      </div>

      <div style={{ borderTop: "1px solid #edf2f7", paddingTop: 20, marginTop: 4 }}>
        <p style={{ fontWeight: 700, color: "#344054", fontSize: ".88rem", margin: "0 0 14px" }}>
          Create a password for the student account
        </p>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="password">Password *</label>
            <input type="password" {...text("password", "Min 8 chars, include a number")} autoComplete="new-password" />
            <Err msg={touched.password ? errors.password : undefined} />
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Confirm password *</label>
            <input type="password" {...text("confirmPassword", "Repeat your password")} autoComplete="new-password" />
            <Err msg={touched.confirmPassword ? errors.confirmPassword : undefined} />
          </div>
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
        <span>
          I agree that The Digital Tutor may contact me by WhatsApp, phone or email regarding the O Level program. I
          have reviewed the{" "}
          <a href="/privacy" style={{ color: "#155eef" }}>Privacy Policy</a> and{" "}
          <a href="/terms" style={{ color: "#155eef" }}>Terms of Service</a>.
        </span>
      </label>
      {touched.consent && <Err msg={errors.consent} />}

      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
        <input
          type="checkbox"
          name="studyGroupConsent"
          checked={fields.studyGroupConsent}
          onChange={e => change("studyGroupConsent", e.target.checked)}
          style={{ marginTop: 3, flexShrink: 0 }}
        />
        <span>
          I would also like to be added to a regional WhatsApp/Telegram study group with other O Level parents and
          students (optional).
        </span>
      </label>

      <button className="btn btn-primary" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Creating your account…" : "Create Free Account"}
      </button>

      {status === "error" && (
        <div className="note">{errorMessage || "Something went wrong. Please try again or contact us directly."}</div>
      )}

      <p style={{ textAlign: "center", marginTop: 4, fontSize: ".85rem", color: "#6b7c93" }}>
        Already registered?{" "}
        <a href="/login?role=student" style={{ color: "#155eef", fontWeight: 700, textDecoration: "none" }}>
          Sign in →
        </a>
      </p>
    </form>
  );
}

// ── O-Level Application Form (legacy — no longer linked from the site) ─────
// No password / account creation here — the parent applies, then is sent to
// /o-level/payment. An account is only created once payment is verified.
type OLevelAppFields = {
  parentName: string; parentEmail: string; parentWhatsapp: string;
  studentName: string; studentGrade: string; schoolName: string; city: string;
  subject: string; preferredClassTime: string; targetExamSession: string;
  source: string; consent: boolean; studyGroupConsent: boolean;
};

const OLEVEL_APP_INIT: OLevelAppFields = {
  parentName: "", parentEmail: "", parentWhatsapp: "",
  studentName: "", studentGrade: "", schoolName: "", city: "",
  subject: "", preferredClassTime: "", targetExamSession: "",
  source: "", consent: false, studyGroupConsent: false,
};

export function OLevelEnrollmentForm({ defaultSubject }: { defaultSubject?: string }) {
  const router = useRouter();
  const [fields, setFields] = useState<OLevelAppFields>({
    ...OLEVEL_APP_INIT,
    subject: defaultSubject && SUBJECT_OPTIONS.some(s => s.value === defaultSubject) ? defaultSubject : "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof OLevelAppFields, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof OLevelAppFields, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function validateField(name: keyof OLevelAppFields, value: string | boolean): string {
    switch (name) {
      case "parentName": case "studentName": return vName(value as string);
      case "parentEmail": return vEmail(value as string);
      case "parentWhatsapp": return vPhone(value as string);
      case "city": return vCity(value as string);
      case "studentGrade": return vSelect(value as string);
      case "subject": return vSelect(value as string);
      case "preferredClassTime": return (value as string).trim() ? "" : "Required";
      case "targetExamSession": return vSelect(value as string);
      case "consent": return value ? "" : "You must consent to proceed";
      default: return "";
    }
  }

  function change(name: keyof OLevelAppFields, value: string | boolean) {
    setFields(f => ({ ...f, [name]: value }));
    if (touched[name]) setErrors(e => ({ ...e, [name]: validateField(name, value) }));
  }

  function blur(name: keyof OLevelAppFields) {
    setTouched(t => ({ ...t, [name]: true }));
    setErrors(e => ({ ...e, [name]: validateField(name, fields[name]) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const required: (keyof OLevelAppFields)[] = ["parentName", "parentEmail", "parentWhatsapp", "studentName", "studentGrade", "city", "subject", "preferredClassTime", "targetExamSession", "consent"];
    const allErrors: Partial<Record<keyof OLevelAppFields, string>> = {};
    const allTouched: Partial<Record<keyof OLevelAppFields, boolean>> = {};
    required.forEach(name => {
      allTouched[name] = true;
      allErrors[name] = validateField(name, fields[name]);
    });
    setTouched(allTouched);
    setErrors(allErrors);
    if (Object.values(allErrors).some(e => e)) return;

    setStatus("loading");
    setErrorMessage("");
    try {
      const params = new URLSearchParams(window.location.search);
      const res = await fetch("/api/o-level/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName: fields.parentName.trim(),
          parentEmail: fields.parentEmail.trim().toLowerCase(),
          parentWhatsapp: fields.parentWhatsapp.trim(),
          studentName: fields.studentName.trim(),
          studentGrade: fields.studentGrade.trim(),
          schoolName: fields.schoolName.trim(),
          city: fields.city.trim(),
          subject: fields.subject,
          preferredClassTime: fields.preferredClassTime.trim(),
          targetExamSession: fields.targetExamSession,
          source: fields.source.trim(),
          consent: "true",
          utm_source: params.get("utm_source") ?? "",
          utm_medium: params.get("utm_medium") ?? "",
          utm_campaign: params.get("utm_campaign") ?? "",
          utm_content: params.get("utm_content") ?? "",
          utm_term: params.get("utm_term") ?? "",
          fbclid: params.get("fbclid") ?? "",
          studyGroupConsent: fields.studyGroupConsent ? "true" : "false",
            }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      trackLead({ subject: fields.subject, value: amountDueForSubject(fields.subject as SubjectOption) ?? undefined });
      router.push(`/o-level/payment?applicationId=${data.id}`);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  const text = (name: keyof OLevelAppFields, placeholder?: string) => ({
    id: name, name,
    value: fields[name] as string,
    placeholder,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => change(name, e.target.value),
    onBlur: () => blur(name),
    style: errStyle(!!errors[name]),
  });

  const sel = (name: keyof OLevelAppFields) => ({
    id: name, name,
    value: fields[name] as string,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => change(name, e.target.value),
    onBlur: () => blur(name),
    style: errStyle(!!errors[name]),
  });

  return (
    <form className="form card" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="parentName">Parent full name *</label>
          <input type="text" {...text("parentName", "e.g. Ahmed Khan")} />
          <Err msg={touched.parentName ? errors.parentName : undefined} />
        </div>
        <div className="field">
          <label htmlFor="parentEmail">Parent email *</label>
          <input type="email" {...text("parentEmail", "parent@gmail.com")} />
          <Err msg={touched.parentEmail ? errors.parentEmail : undefined} />
        </div>
        <div className="field">
          <label htmlFor="parentWhatsapp">Parent WhatsApp number *</label>
          <input type="tel" {...text("parentWhatsapp", "+92 300 1234567")} />
          <Err msg={touched.parentWhatsapp ? errors.parentWhatsapp : undefined} />
        </div>
        <div className="field">
          <label htmlFor="studentName">Student first name *</label>
          <input type="text" {...text("studentName", "e.g. Fatima")} />
          <Err msg={touched.studentName ? errors.studentName : undefined} />
        </div>
        <div className="field">
          <label htmlFor="studentGrade">Student grade / year *</label>
          <select {...sel("studentGrade")}>
            <option value="">Select grade</option>
            {GRADES.map(g => <option key={g}>{g}</option>)}
          </select>
          <Err msg={touched.studentGrade ? errors.studentGrade : undefined} />
        </div>
        <div className="field">
          <label htmlFor="schoolName">School name</label>
          <input type="text" {...text("schoolName", "Optional")} />
        </div>
        <div className="field">
          <label htmlFor="city">City *</label>
          <input type="text" {...text("city", "e.g. Lahore")} />
          <Err msg={touched.city ? errors.city : undefined} />
        </div>
        <div className="field">
          <label htmlFor="subject">Subject of interest *</label>
          <select {...sel("subject")}>
            <option value="">Select subject</option>
            {SUBJECT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <Err msg={touched.subject ? errors.subject : undefined} />
        </div>
        <div className="field">
          <label htmlFor="preferredClassTime">Preferred class time *</label>
          <input type="text" {...text("preferredClassTime", "e.g. Weekday evenings (PKT)")} />
          <Err msg={touched.preferredClassTime ? errors.preferredClassTime : undefined} />
        </div>
        <div className="field">
          <label htmlFor="targetExamSession">Target exam session *</label>
          <select {...sel("targetExamSession")}>
            <option value="">Select session</option>
            {TARGET_EXAM_SESSIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <Err msg={touched.targetExamSession ? errors.targetExamSession : undefined} />
        </div>
        <div className="field">
          <label htmlFor="source">How did you hear about us?</label>
          <input type="text" {...text("source", "e.g. Facebook, Instagram, friend")} />
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
        <span>
          I agree that The Digital Tutor may contact me by WhatsApp, phone or email regarding the selected O Level
          program. I have reviewed the{" "}
          <a href="/privacy" style={{ color: "#155eef" }}>Privacy Policy</a> and{" "}
          <a href="/terms" style={{ color: "#155eef" }}>Terms of Service</a>.
        </span>
      </label>
      {touched.consent && <Err msg={errors.consent} />}

      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
        <input
          type="checkbox"
          name="studyGroupConsent"
          checked={fields.studyGroupConsent}
          onChange={e => change("studyGroupConsent", e.target.checked)}
          style={{ marginTop: 3, flexShrink: 0 }}
        />
        <span>
          I would also like to be added to a regional WhatsApp/Telegram study group with other O Level parents and
          students (optional).
        </span>
      </label>

      <button className="btn btn-primary" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Submitting…" : "Submit Application and View Payment Options"}
      </button>

      {status === "error" && (
        <div className="note">{errorMessage || "Something went wrong. Please try again or contact us directly."}</div>
      )}
    </form>
  );
}
