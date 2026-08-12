"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/site";

type OLevelSubject = "mathematics" | "computer-science" | "english-language" | "islamiyat" | "pakistan-studies";

const SUBJECTS: { value: OLevelSubject; label: string; icon: string }[] = [
  { value: "mathematics", label: "Mathematics", icon: "📐" },
  { value: "computer-science", label: "Computer Science", icon: "💻" },
  { value: "english-language", label: "English Language", icon: "📖" },
  { value: "islamiyat", label: "Islamiyat", icon: "🕌" },
  { value: "pakistan-studies", label: "Pakistan Studies", icon: "🌍" },
];
const subjectMeta = (s: string) => SUBJECTS.find((x) => x.value === s) ?? SUBJECTS[0];

interface QuizSummary {
  id: string;
  subject: OLevelSubject;
  title: string;
  description: string;
  is_published: boolean;
  question_count: number;
  created_at: string;
}

export default function OLevelQuizManager() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState<OLevelSubject>("mathematics");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | OLevelSubject>("all");

  async function load() {
    setLoading(true);
    const r = await fetch("/api/o-level/quizzes");
    const d = await r.json();
    setQuizzes(d.quizzes ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createQuiz() {
    if (!title.trim()) return;
    setCreating(true);
    const r = await fetch("/api/o-level/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, title: title.trim(), description: description.trim() }),
    });
    const d = await r.json();
    setCreating(false);
    if (d.id) window.location.href = `/admin/o-level-quizzes/${d.id}`;
  }

  async function togglePublish(id: string, isPublished: boolean) {
    await fetch(`/api/o-level/quizzes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: isPublished ? "unpublish" : "publish" }),
    });
    load();
  }

  async function deleteQuiz(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await fetch(`/api/o-level/quizzes/${id}`, { method: "DELETE" });
    load();
  }

  const visible = quizzes.filter((q) => filter === "all" || q.subject === filter);

  return (
    <>
      <PageHero eyebrow="O Level Quiz Management" title="Create & manage O Level quizzes">
        Build subject quizzes for O Level students. Unlike the SAT diagnostic, any number of quizzes can be published
        at once per subject — students see every published quiz for their subject.
      </PageHero>

      <section className="section">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ color: "#071b33", margin: 0 }}>All quizzes ({quizzes.length})</h2>
            <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
              {showForm ? "Cancel" : "+ Create new quiz"}
            </button>
          </div>

          {showForm && (
            <div className="card" style={{ marginBottom: 24, background: "#f8fafc", border: "1.5px solid #dce5ef" }}>
              <h3 style={{ margin: "0 0 16px", color: "#071b33" }}>New quiz</h3>
              <div className="field" style={{ marginBottom: 14 }}>
                <label>Subject *</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {SUBJECTS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setSubject(s.value)}
                      style={{
                        padding: "8px 14px", borderRadius: 8, fontWeight: 700, fontSize: ".82rem", cursor: "pointer",
                        border: subject === s.value ? "2px solid #155eef" : "2px solid #e8eef6",
                        background: subject === s.value ? "#eff6ff" : "#fff",
                        color: subject === s.value ? "#155eef" : "#6b7c93",
                      }}
                    >
                      {s.icon} {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label>Quiz title *</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Algebra — Topic Quiz 1" />
                </div>
                <div className="field">
                  <label>Description</label>
                  <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. 5 questions on linear equations" />
                </div>
              </div>
              <button className="btn btn-primary" onClick={createQuiz} disabled={creating || !title.trim()}>
                {creating ? "Creating…" : "Create & add questions →"}
              </button>
            </div>
          )}

          {!loading && quizzes.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <button
                onClick={() => setFilter("all")}
                style={{ padding: "7px 16px", borderRadius: 999, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", border: filter === "all" ? "2px solid #155eef" : "2px solid #e8eef6", background: filter === "all" ? "#eff6ff" : "#fff", color: filter === "all" ? "#155eef" : "#6b7c93" }}
              >
                All
              </button>
              {SUBJECTS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setFilter(s.value)}
                  style={{ padding: "7px 16px", borderRadius: 999, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", border: filter === s.value ? "2px solid #155eef" : "2px solid #e8eef6", background: filter === s.value ? "#eff6ff" : "#fff", color: filter === s.value ? "#155eef" : "#6b7c93" }}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="card"><p>Loading quizzes…</p></div>
          ) : visible.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 48 }}>
              <p style={{ color: "#6b7c93", marginBottom: 16 }}>No quizzes yet. Create your first one above.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {visible.map((q) => (
                <div key={q.id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", padding: "18px 24px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: "#f1f5f9", color: "#475569" }}>
                        {subjectMeta(q.subject).icon} {subjectMeta(q.subject).label}
                      </span>
                      <span style={{ fontWeight: 800, fontSize: "1rem", color: "#071b33" }}>{q.title}</span>
                      {q.is_published && (
                        <span style={{ background: "#d1fae5", color: "#065f46", fontSize: ".72rem", fontWeight: 800, padding: "2px 10px", borderRadius: 999, border: "1px solid #a7f3d0" }}>
                          PUBLISHED
                        </span>
                      )}
                    </div>
                    {q.description && <p style={{ color: "#6b7c93", fontSize: ".85rem", margin: "0 0 4px" }}>{q.description}</p>}
                    <p style={{ color: "#a0aec0", fontSize: ".78rem", margin: 0 }}>
                      {q.question_count ?? 0} questions · Created {new Date(q.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Link href={`/admin/o-level-quizzes/${q.id}`} style={{ padding: "8px 16px", borderRadius: 8, background: "#eaf1ff", color: "#155eef", fontWeight: 700, fontSize: ".82rem", textDecoration: "none" }}>
                      Edit questions
                    </Link>
                    <Link href={`/admin/o-level-quizzes/${q.id}?tab=results`} style={{ padding: "8px 16px", borderRadius: 8, background: "#f1f5f9", color: "#344054", fontWeight: 700, fontSize: ".82rem", textDecoration: "none" }}>
                      View results
                    </Link>
                    <button onClick={() => togglePublish(q.id, q.is_published)} style={{ padding: "8px 16px", borderRadius: 8, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", border: "none", background: q.is_published ? "#fef3c7" : "#d1fae5", color: q.is_published ? "#92400e" : "#065f46" }}>
                      {q.is_published ? "Unpublish" : "Publish"}
                    </button>
                    <button onClick={() => deleteQuiz(q.id, q.title)} style={{ padding: "8px 16px", borderRadius: 8, background: "#fee2e2", color: "#991b1b", fontWeight: 700, fontSize: ".82rem", cursor: "pointer", border: "none" }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 24 }}>
            <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".85rem", textDecoration: "none" }}>← Back to admin dashboard</Link>
          </div>
        </div>
      </section>
    </>
  );
}
