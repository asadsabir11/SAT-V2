"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type QuizCategory = "math" | "english" | "general";

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  category: QuizCategory;
  time_limit_minutes: number | null;
  question_count: number;
  last_score: number | null;
  last_total: number | null;
  last_attempt_at: string | null;
}

const MATH_SUBTABS    = ["Algebra", "Advanced Maths", "Problem-Solving & Data Analysis", "Geometry & Trigonometry"];
const ENGLISH_SUBTABS = ["Non-Grammar Questions (Logic & Rhetoric)", "Punctuation & Sentence Structure", "Grammar & Standard English Conventions", "Appendix: Secondary & Advanced Concepts"];

const CATEGORY_META = {
  math:    { label: "Math",              icon: "📐", color: "#1d4ed8", bg: "#dbeafe", shadow: "#1d4ed822" },
  english: { label: "Reading & Writing", icon: "📖", color: "#7c3aed", bg: "#ede9fe", shadow: "#7c3aed22" },
  general: { label: "General",           icon: "📝", color: "#475569", bg: "#f1f5f9", shadow: "#47556922" },
};

const SUBJECT_COLORS: Record<string, { bg: string; color: string }> = {
  "Algebra":                                       { bg: "#eff6ff", color: "#1d4ed8" },
  "Advanced Maths":                                { bg: "#e0e7ff", color: "#3730a3" },
  "Problem-Solving & Data Analysis":               { bg: "#f0fdf4", color: "#15803d" },
  "Geometry & Trigonometry":                       { bg: "#fff7ed", color: "#c2410c" },
  "Non-Grammar Questions (Logic & Rhetoric)":      { bg: "#fdf4ff", color: "#7e22ce" },
  "Punctuation & Sentence Structure":              { bg: "#fef9c3", color: "#854d0e" },
  "Grammar & Standard English Conventions":        { bg: "#eff6ff", color: "#0369a1" },
  "Appendix: Secondary & Advanced Concepts":       { bg: "#f5f3ff", color: "#6d28d9" },
};

export default function QuizzesPage() {
  const [quizzes, setQuizzes]   = useState<Quiz[]>([]);
  const [loading, setLoading]   = useState(true);
  const [unauth, setUnauth]     = useState(false);
  const [tab, setTab]           = useState<QuizCategory>("math");
  const [mathSub, setMathSub]   = useState<string | null>(null);
  const [engSub, setEngSub]     = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/quizzes").then(r => {
      if (r.status === 401) { setUnauth(true); setLoading(false); return null; }
      return r.json();
    }).then(d => { if (d) { setQuizzes(d.quizzes ?? []); setLoading(false); } });
  }, []);

  const byCategory = (cat: QuizCategory) => quizzes.filter(q => (q.category ?? "math") === cat);

  const mathQuizzes    = byCategory("math");
  const englishQuizzes = byCategory("english");

  const visible =
    tab === "math"
      ? (mathSub ? mathQuizzes.filter(q => q.subject === mathSub) : mathQuizzes)
      : tab === "english"
        ? (engSub ? englishQuizzes.filter(q => q.subject === engSub) : englishQuizzes)
        : byCategory("general");

  const mathSubCount    = (sub: string) => mathQuizzes.filter(q => q.subject === sub).length;
  const englishSubCount = (sub: string) => englishQuizzes.filter(q => q.subject === sub).length;

  if (unauth) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <p style={{ color: "#6b7c93" }}>Please sign in to view quizzes.</p>
      <Link href="/login?role=student" className="btn btn-primary">Sign in →</Link>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px 16px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <Link href="/dashboard" style={{ fontSize: ".82rem", color: "#6b7c93", textDecoration: "none", fontWeight: 600 }}>← Dashboard</Link>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#071b33", margin: "6px 0 6px", letterSpacing: "-.04em" }}>Quizzes</h1>
          <p style={{ color: "#6b7c93", fontSize: ".95rem", margin: 0 }}>Test your knowledge and track your progress.</p>
        </div>

        {/* Category tabs */}
        {!loading && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
            {(["math", "english", "general"] as QuizCategory[]).map(cat => {
              const m = CATEGORY_META[cat];
              const count = byCategory(cat).length;
              const active = tab === cat;
              return (
                <button key={cat}
                  onClick={() => { setTab(cat); setMathSub(null); setEngSub(null); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 12, fontWeight: 800, fontSize: ".92rem", cursor: "pointer", transition: "all .15s",
                    border: active ? `2px solid ${m.color}` : "2px solid #e8eef6",
                    background: active ? m.bg : "#fff",
                    color: active ? m.color : "#6b7c93",
                    boxShadow: active ? `0 2px 12px ${m.shadow}` : "none" }}>
                  <span style={{ fontSize: "1.1rem" }}>{m.icon}</span>
                  {m.label}
                  {count > 0 && (
                    <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: ".72rem", fontWeight: 800,
                      background: active ? m.color : "#e8eef6", color: active ? "#fff" : "#6b7c93" }}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Math sub-tabs */}
        {!loading && tab === "math" && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {MATH_SUBTABS.map(sub => {
              const active = mathSub === sub;
              const count  = mathSubCount(sub);
              return (
                <button key={sub}
                  onClick={() => setMathSub(active ? null : sub)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, fontWeight: 700, fontSize: ".83rem", cursor: "pointer", transition: "all .15s",
                    border: active ? "2px solid #1d4ed8" : "2px solid #e8eef6",
                    background: active ? "#dbeafe" : "#fff",
                    color: active ? "#1d4ed8" : "#6b7c93",
                    boxShadow: active ? "0 2px 10px #1d4ed822" : "none" }}>
                  {sub}
                  {count > 0 && (
                    <span style={{ padding: "1px 6px", borderRadius: 999, fontSize: ".7rem", fontWeight: 800,
                      background: active ? "#1d4ed8" : "#e8eef6", color: active ? "#fff" : "#6b7c93" }}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* English sub-tabs */}
        {!loading && tab === "english" && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {ENGLISH_SUBTABS.map(sub => {
              const active = engSub === sub;
              const count  = englishSubCount(sub);
              return (
                <button key={sub}
                  onClick={() => setEngSub(active ? null : sub)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, fontWeight: 700, fontSize: ".83rem", cursor: "pointer", transition: "all .15s",
                    border: active ? "2px solid #7c3aed" : "2px solid #e8eef6",
                    background: active ? "#ede9fe" : "#fff",
                    color: active ? "#7c3aed" : "#6b7c93",
                    boxShadow: active ? "0 2px 10px #7c3aed22" : "none" }}>
                  {sub}
                  {count > 0 && (
                    <span style={{ padding: "1px 6px", borderRadius: 999, fontSize: ".7rem", fontWeight: 800,
                      background: active ? "#7c3aed" : "#e8eef6", color: active ? "#fff" : "#6b7c93" }}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Quiz grid */}
        {loading ? (
          <p style={{ color: "#6b7c93", textAlign: "center", paddingTop: 60 }}>Loading quizzes…</p>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📝</div>
            <p style={{ color: "#6b7c93", margin: 0 }}>No quizzes here yet. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
            {visible.map(q => {
              const attempted = q.last_score !== null;
              const pct = attempted ? Math.round(((q.last_score ?? 0) / (q.last_total ?? 1)) * 100) : null;
              const subClr = SUBJECT_COLORS[q.subject] ?? { bg: "#f8fafc", color: "#475569" };
              return (
                <div key={q.id} style={{ background: "#fff", borderRadius: 18, padding: "22px 22px 18px", boxShadow: "0 2px 12px rgba(7,27,51,.08)", border: "1px solid #e8eef6", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: ".7rem", fontWeight: 800, background: subClr.bg, color: subClr.color }}>{q.subject}</span>
                    {attempted && pct !== null && (
                      <span style={{ fontSize: ".78rem", fontWeight: 800, padding: "3px 10px", borderRadius: 20,
                        background: pct >= 80 ? "#dcfce7" : pct >= 60 ? "#fef3c7" : "#fee2e2",
                        color:      pct >= 80 ? "#15803d" : pct >= 60 ? "#92400e" : "#991b1b" }}>
                        {pct}%
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: 900, fontSize: "1.05rem", color: "#071b33", marginBottom: 6, lineHeight: 1.3 }}>{q.title}</div>
                  {q.description && <div style={{ fontSize: ".82rem", color: "#6b7c93", marginBottom: 10, lineHeight: 1.5 }}>{q.description}</div>}
                  <div style={{ fontSize: ".78rem", color: "#9ca3af", marginBottom: 14 }}>
                    {q.question_count} question{q.question_count !== 1 ? "s" : ""}
                    {q.time_limit_minutes ? ` · ${q.time_limit_minutes} min` : ""}
                    {attempted && q.last_attempt_at ? ` · Last attempt ${new Date(q.last_attempt_at).toLocaleDateString()}` : ""}
                  </div>
                  <div style={{ marginTop: "auto" }}>
                    <Link href={`/quizzes/${q.id}`} style={{ display: "block", textAlign: "center", padding: "11px", background: attempted ? "#f1f5f9" : "#155eef", color: attempted ? "#344054" : "#fff", borderRadius: 10, fontWeight: 800, fontSize: ".9rem", textDecoration: "none" }}>
                      {attempted ? "Retake quiz →" : "Start quiz →"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
