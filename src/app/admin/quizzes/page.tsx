"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type QuizCategory = "math" | "english" | "general";

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  category: QuizCategory;
  time_limit_minutes: number | null;
  is_published: boolean;
  question_count: number;
  attempt_count: number;
  created_at: string;
}

const MATH_SUBJECTS = ["Algebra", "Advanced Maths", "Problem-Solving & Data Analysis", "Geometry & Trigonometry"];
const ENGLISH_SUBJECTS = ["Non-Grammar Questions (Logic & Rhetoric)", "Punctuation & Sentence Structure", "Grammar & Standard English Conventions", "Appendix: Secondary & Advanced Concepts"];

const CATEGORY_META: Record<QuizCategory, { label: string; icon: string; color: string; bg: string }> = {
  math:    { label: "Math",              icon: "📐", color: "#155eef", bg: "#eff6ff" },
  english: { label: "Reading & Writing", icon: "📖", color: "#7c3aed", bg: "#f5f3ff" },
  general: { label: "General",           icon: "📝", color: "#475569", bg: "#f8fafc" },
};

export default function AdminQuizzes() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "math" as QuizCategory, subject: "Algebra", time_limit_minutes: "" });

  useEffect(() => {
    fetch("/api/admin/quizzes").then(r => r.json()).then(d => { setQuizzes(d.quizzes ?? []); setLoading(false); });
  }, []);

  async function createQuiz() {
    if (!form.title.trim()) return;
    setCreating(true);
    const res = await fetch("/api/admin/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, time_limit_minutes: form.time_limit_minutes ? Number(form.time_limit_minutes) : null }),
    });
    const d = await res.json();
    if (d.quiz) router.push(`/admin/quizzes/${d.quiz.id}`);
    setCreating(false);
  }

  async function deleteQuiz(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This also removes all its questions and student results.`)) return;
    await fetch(`/api/admin/quizzes/${id}`, { method: "DELETE" });
    setQuizzes(q => q.filter(x => x.id !== id));
  }

  async function togglePublish(id: string) {
    const res = await fetch(`/api/admin/quizzes/${id}/publish`, { method: "POST" });
    const d = await res.json();
    setQuizzes(q => q.map(x => x.id === id ? { ...x, is_published: d.quiz.is_published } : x));
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "32px 16px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <Link href="/admin" style={{ fontSize: ".82rem", color: "#6b7c93", textDecoration: "none", fontWeight: 600 }}>← Admin</Link>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "4px 0 0", letterSpacing: "-.03em" }}>Quiz Portal</h1>
            <p style={{ color: "#6b7c93", fontSize: ".9rem", margin: 0 }}>Create and manage quizzes for students</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{ padding: "12px 24px", background: "#155eef", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, fontSize: ".95rem", cursor: "pointer" }}
          >
            + Create quiz
          </button>
        </div>

        {/* Create modal */}
        {showCreate && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(7,27,51,.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: "36px 32px", width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(7,27,51,.2)" }}>
              <h2 style={{ margin: "0 0 20px", fontSize: "1.2rem", fontWeight: 900, color: "#071b33" }}>New quiz</h2>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Quiz title *</label>
                <input style={inp} placeholder="e.g. Week 3 Algebra Quiz" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Description (optional)</label>
                <textarea style={{ ...inp, minHeight: 72, resize: "vertical" }} placeholder="What is this quiz about?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              {/* Category */}
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Category *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["math", "english", "general"] as QuizCategory[]).map(cat => {
                    const m = CATEGORY_META[cat];
                    const active = form.category === cat;
                    return (
                      <button key={cat} type="button"
                        onClick={() => setForm(f => ({ ...f, category: cat, subject: cat === "math" ? MATH_SUBJECTS[0] : cat === "english" ? ENGLISH_SUBJECTS[0] : "General" }))}
                        style={{ flex: 1, padding: "9px 8px", borderRadius: 10, fontWeight: 700, fontSize: ".82rem", cursor: "pointer",
                          border: active ? `2px solid ${m.color}` : "2px solid #e8eef6",
                          background: active ? m.bg : "#f8fafc", color: active ? m.color : "#6b7c93" }}>
                        {m.icon} {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subcategory */}
              {form.category !== "general" && (
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>{form.category === "math" ? "Math" : "Reading & Writing"} subcategory *</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                    {(form.category === "math" ? MATH_SUBJECTS : ENGLISH_SUBJECTS).map(sub => {
                      const active = form.subject === sub;
                      const color = form.category === "math" ? "#155eef" : "#7c3aed";
                      const bg    = form.category === "math" ? "#eff6ff" : "#f5f3ff";
                      return (
                        <button key={sub} type="button"
                          onClick={() => setForm(f => ({ ...f, subject: sub }))}
                          style={{ padding: "8px 10px", borderRadius: 9, fontWeight: 700, fontSize: ".75rem", cursor: "pointer", textAlign: "left",
                            border: active ? `2px solid ${color}` : "2px solid #e8eef6",
                            background: active ? bg : "#f8fafc", color: active ? color : "#6b7c93" }}>
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Time limit (mins, optional)</label>
                <input style={inp} type="number" min="1" placeholder="e.g. 30" value={form.time_limit_minutes} onChange={e => setForm(f => ({ ...f, time_limit_minutes: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: "12px", border: "1.5px solid #dce5ef", borderRadius: 10, background: "#fff", fontWeight: 700, cursor: "pointer", color: "#344054" }}>Cancel</button>
                <button onClick={createQuiz} disabled={creating || !form.title.trim()} style={{ flex: 2, padding: "12px", background: "#155eef", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer", opacity: creating || !form.title.trim() ? .6 : 1 }}>
                  {creating ? "Creating…" : "Create & add questions →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quiz list */}
        {loading ? (
          <div style={card}><p style={{ color: "#6b7c93" }}>Loading…</p></div>
        ) : quizzes.length === 0 ? (
          <div style={{ ...card, textAlign: "center", padding: "52px 24px" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📝</div>
            <p style={{ color: "#6b7c93", margin: 0 }}>No quizzes yet. Create your first one above.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {quizzes.map(q => (
              <div key={q.id} style={{ ...card, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{
                      padding: "2px 10px", borderRadius: 20, fontSize: ".72rem", fontWeight: 800, letterSpacing: ".04em",
                      background: q.is_published ? "#dcfce7" : "#f1f5f9",
                      color: q.is_published ? "#15803d" : "#6b7c93",
                    }}>
                      {q.is_published ? "PUBLISHED" : "DRAFT"}
                    </span>
                    {(() => { const m = CATEGORY_META[q.category ?? "general"]; return (
                      <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: ".72rem", fontWeight: 700, background: m.bg, color: m.color }}>{m.icon} {m.label}</span>
                    ); })()}
                    {q.subject && q.subject !== "General" && q.subject !== "general" && (
                      <span style={{ fontSize: ".72rem", color: "#9ca3af", background: "#f1f5f9", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{q.subject}</span>
                    )}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: "#071b33" }}>{q.title}</div>
                  {q.description && <div style={{ fontSize: ".82rem", color: "#6b7c93", marginTop: 2 }}>{q.description}</div>}
                  <div style={{ fontSize: ".78rem", color: "#9ca3af", marginTop: 6 }}>
                    {q.question_count} question{q.question_count !== 1 ? "s" : ""}
                    {q.time_limit_minutes ? ` · ${q.time_limit_minutes} min` : ""}
                    {" · "}
                    {q.attempt_count} attempt{q.attempt_count !== 1 ? "s" : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Link href={`/admin/quizzes/${q.id}`} style={{ padding: "8px 16px", background: "#eff6ff", color: "#155eef", borderRadius: 9, fontWeight: 700, fontSize: ".84rem", textDecoration: "none" }}>
                    Edit →
                  </Link>
                  <button onClick={() => togglePublish(q.id)} style={{ padding: "8px 16px", background: q.is_published ? "#fef3c7" : "#dcfce7", color: q.is_published ? "#92400e" : "#15803d", border: "none", borderRadius: 9, fontWeight: 700, fontSize: ".84rem", cursor: "pointer" }}>
                    {q.is_published ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => deleteQuiz(q.id, q.title)} style={{ padding: "8px 14px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 9, fontWeight: 700, fontSize: ".84rem", cursor: "pointer" }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const card: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 1px 8px rgba(7,27,51,.07)", border: "1px solid #e8eef6" };
const lbl: React.CSSProperties = { display: "block", fontWeight: 700, fontSize: ".82rem", color: "#344054", marginBottom: 5 };
const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #dce5ef", fontSize: ".9rem", boxSizing: "border-box", outline: "none", background: "#fff" };
