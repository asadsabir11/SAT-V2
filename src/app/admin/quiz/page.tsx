"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/site";

interface QuizSummary {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  created_by: string;
  question_count: number;
  created_at: string;
}

export default function QuizManager() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/quiz");
    const d = await r.json();
    setQuizzes(d.quizzes ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createQuiz() {
    if (!title.trim()) return;
    setCreating(true);
    const r = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), description: description.trim() }),
    });
    const d = await r.json();
    setCreating(false);
    if (d.id) {
      window.location.href = `/admin/quiz/${d.id}`;
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/quiz/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: isActive ? "deactivate" : "activate" }),
    });
    load();
  }

  async function deleteQuiz(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await fetch(`/api/quiz/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <>
      <PageHero eyebrow="Quiz Management" title="Create & manage diagnostic quizzes">
        Build quizzes with Math and Reading &amp; Writing questions. Activate one quiz at a time — students see the active quiz on their diagnostic page.
      </PageHero>

      <section className="section">
        <div className="container">

          {/* Create button */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ color: "#071b33", margin: 0 }}>All quizzes ({quizzes.length})</h2>
            <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
              {showForm ? "Cancel" : "+ Create new quiz"}
            </button>
          </div>

          {/* Create form */}
          {showForm && (
            <div className="card" style={{ marginBottom: 24, background: "#f8fafc", border: "1.5px solid #dce5ef" }}>
              <h3 style={{ margin: "0 0 16px", color: "#071b33" }}>New quiz</h3>
              <div className="form-grid">
                <div className="field">
                  <label>Quiz title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. SAT Diagnostic Test — July 2026" />
                </div>
                <div className="field">
                  <label>Description</label>
                  <input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. 10 questions, 5 Math + 5 RW" />
                </div>
              </div>
              <button className="btn btn-primary" onClick={createQuiz} disabled={creating || !title.trim()}>
                {creating ? "Creating…" : "Create & add questions →"}
              </button>
            </div>
          )}

          {/* Quiz list */}
          {loading ? (
            <div className="card"><p>Loading quizzes…</p></div>
          ) : quizzes.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 48 }}>
              <p style={{ color: "#6b7c93", marginBottom: 16 }}>No quizzes yet. Create your first one above.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {quizzes.map(q => (
                <div key={q.id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", padding: "18px 24px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: "1rem", color: "#071b33" }}>{q.title}</span>
                      {q.is_active && (
                        <span style={{ background: "#d1fae5", color: "#065f46", fontSize: ".72rem", fontWeight: 800, padding: "2px 10px", borderRadius: 999, border: "1px solid #a7f3d0" }}>
                          ACTIVE
                        </span>
                      )}
                    </div>
                    {q.description && <p style={{ color: "#6b7c93", fontSize: ".85rem", margin: "0 0 4px" }}>{q.description}</p>}
                    <p style={{ color: "#a0aec0", fontSize: ".78rem", margin: 0 }}>
                      {q.question_count ?? 0} questions · Created {new Date(q.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Link href={`/admin/quiz/${q.id}`}
                      style={{ padding: "8px 16px", borderRadius: 8, background: "#eaf1ff", color: "#155eef", fontWeight: 700, fontSize: ".82rem", textDecoration: "none" }}>
                      Edit questions
                    </Link>
                    <Link href={`/admin/quiz/${q.id}?tab=results`}
                      style={{ padding: "8px 16px", borderRadius: 8, background: "#f1f5f9", color: "#344054", fontWeight: 700, fontSize: ".82rem", textDecoration: "none" }}>
                      View results
                    </Link>
                    <button
                      onClick={() => toggleActive(q.id, q.is_active)}
                      style={{ padding: "8px 16px", borderRadius: 8, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", border: "none", background: q.is_active ? "#fef3c7" : "#d1fae5", color: q.is_active ? "#92400e" : "#065f46" }}>
                      {q.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => deleteQuiz(q.id, q.title)}
                      style={{ padding: "8px 16px", borderRadius: 8, background: "#fee2e2", color: "#991b1b", fontWeight: 700, fontSize: ".82rem", cursor: "pointer", border: "none" }}>
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
