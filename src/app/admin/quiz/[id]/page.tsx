"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";

type Section = "math" | "reading_writing";

interface Question {
  id: string;
  section: Section;
  topic: string;
  passage?: string;
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

interface QuizAttempt {
  id: string;
  student_name: string;
  student_email: string;
  math_score: number;
  rw_score: number;
  total_score: number;
  weak_areas: string[];
  completed_at: string;
}

const BLANK_Q: Omit<Question, "id"> = {
  section: "math",
  topic: "",
  passage: "",
  text: "",
  options: ["", "", "", ""],
  correct: 0,
};

export default function QuizEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState<"questions" | "results">("questions");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newQ, setNewQ] = useState<Omit<Question, "id">>({ ...BLANK_Q, options: ["", "", "", ""] });
  const [addingQ, setAddingQ] = useState(false);

  useEffect(() => {
    fetch(`/api/quiz/${id}`).then(r => r.json()).then(d => {
      if (d.quiz) {
        setTitle(d.quiz.title);
        setDescription(d.quiz.description ?? "");
        setIsActive(d.quiz.is_active);
        setQuestions(d.quiz.questions ?? []);
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (tab === "results") {
      fetch(`/api/quiz/${id}/results`).then(r => r.json()).then(d => setResults(d.results ?? []));
    }
  }, [tab, id]);

  async function saveQuiz() {
    setSaving(true);
    await fetch(`/api/quiz/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, questions }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function toggleActive() {
    const action = isActive ? "deactivate" : "activate";
    await fetch(`/api/quiz/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setIsActive(a => !a);
  }

  function addQuestion() {
    if (!newQ.text.trim() || newQ.options.some(o => !o.trim()) || !newQ.topic.trim()) return;
    const q: Question = { ...newQ, id: crypto.randomUUID() };
    const updated = [...questions, q];
    setQuestions(updated);
    setNewQ({ ...BLANK_Q, options: ["", "", "", ""] });
    setAddingQ(false);
    // Auto-save questions
    fetch(`/api/quiz/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions: updated }),
    });
  }

  function removeQuestion(qId: string) {
    if (!confirm("Remove this question?")) return;
    const updated = questions.filter(q => q.id !== qId);
    setQuestions(updated);
    fetch(`/api/quiz/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions: updated }),
    });
  }

  const mathCount = questions.filter(q => q.section === "math").length;
  const rwCount = questions.filter(q => q.section === "reading_writing").length;

  if (loading) return <section className="section"><div className="container"><div className="card"><p>Loading quiz…</p></div></div></section>;

  return (
    <section className="section">
      <div className="container">

        {/* Header */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <Link href="/admin/quiz" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← All quizzes</Link>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>{title || "Untitled quiz"}</h1>
            <p style={{ color: "#6b7c93", margin: 0, fontSize: ".88rem" }}>
              {questions.length} questions · {mathCount} Math · {rwCount} R&W ·{" "}
              <span style={{ color: isActive ? "#065f46" : "#92400e", fontWeight: 700 }}>
                {isActive ? "● ACTIVE (students can see this)" : "○ Draft (not visible to students)"}
              </span>
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={toggleActive}
              style={{ padding: "10px 20px", borderRadius: 10, fontWeight: 700, fontSize: ".88rem", cursor: "pointer", border: "2px solid", borderColor: isActive ? "#f59e0b" : "#10b981", background: isActive ? "#fef3c7" : "#d1fae5", color: isActive ? "#92400e" : "#065f46" }}>
              {isActive ? "Deactivate" : "Activate for students →"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "2px solid #e8eef6" }}>
          {(["questions", "results"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 20px", fontWeight: 700, fontSize: ".88rem", cursor: "pointer", border: "none", background: "none", color: tab === t ? "#155eef" : "#6b7c93", borderBottom: tab === t ? "2px solid #155eef" : "2px solid transparent", marginBottom: -2 }}>
              {t === "questions" ? `Questions (${questions.length})` : `Student Results (${results.length})`}
            </button>
          ))}
        </div>

        {tab === "questions" && (
          <>
            {/* Meta edit */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 14px", color: "#071b33" }}>Quiz details</h3>
              <div className="form-grid">
                <div className="field">
                  <label>Title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Quiz title" />
                </div>
                <div className="field">
                  <label>Description</label>
                  <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description" />
                </div>
              </div>
              <button className="btn btn-primary" onClick={saveQuiz} disabled={saving} style={{ marginTop: 8 }}>
                {saving ? "Saving…" : saved ? "✓ Saved!" : "Save changes"}
              </button>
            </div>

            {/* Existing questions */}
            {questions.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: 32, color: "#6b7c93", marginBottom: 20 }}>
                No questions yet. Add your first question below.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
                {questions.map((q, i) => (
                  <div key={q.id} className="card" style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 800, color: "#6b7c93", fontSize: ".78rem" }}>Q{i + 1}</span>
                          <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: q.section === "math" ? "#ede9fe" : "#fce7f3", color: q.section === "math" ? "#5b21b6" : "#9d174d" }}>
                            {q.section === "math" ? "Math" : "Reading & Writing"}
                          </span>
                          <span style={{ color: "#a0aec0", fontSize: ".78rem" }}>{q.topic}</span>
                        </div>
                        {q.passage && (
                          <p style={{ fontSize: ".82rem", color: "#6b7c93", fontStyle: "italic", borderLeft: "3px solid #dce5ef", paddingLeft: 10, margin: "0 0 8px", lineHeight: 1.6 }}>
                            {q.passage.length > 150 ? q.passage.slice(0, 150) + "…" : q.passage}
                          </p>
                        )}
                        <p style={{ fontWeight: 700, color: "#071b33", margin: "0 0 8px" }}>{q.text}</p>
                        <div style={{ display: "grid", gap: 4 }}>
                          {q.options.map((opt, oi) => (
                            <span key={oi} style={{ fontSize: ".82rem", color: oi === q.correct ? "#065f46" : "#6b7c93", fontWeight: oi === q.correct ? 700 : 400 }}>
                              {oi === q.correct ? "✓" : "○"} {String.fromCharCode(65 + oi)}. {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => removeQuestion(q.id)} style={{ background: "#fee2e2", border: "none", color: "#991b1b", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: ".78rem", flexShrink: 0 }}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add question */}
            {!addingQ ? (
              <button className="btn btn-primary" onClick={() => setAddingQ(true)} style={{ width: "100%" }}>
                + Add question
              </button>
            ) : (
              <div className="card" style={{ border: "2px solid #155eef" }}>
                <h3 style={{ margin: "0 0 16px", color: "#071b33" }}>New question</h3>
                <div className="form-grid" style={{ marginBottom: 12 }}>
                  <div className="field">
                    <label>Section *</label>
                    <select value={newQ.section} onChange={e => setNewQ(q => ({ ...q, section: e.target.value as Section }))}>
                      <option value="math">Math</option>
                      <option value="reading_writing">Reading & Writing</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Topic *</label>
                    <input value={newQ.topic} onChange={e => setNewQ(q => ({ ...q, topic: e.target.value }))} placeholder="e.g. Linear Equations, Main Idea" />
                  </div>
                </div>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label>Passage / Context (optional)</label>
                  <textarea value={newQ.passage ?? ""} onChange={e => setNewQ(q => ({ ...q, passage: e.target.value }))} placeholder="Paste a reading passage or context paragraph here (leave blank for standalone questions)" rows={3} style={{ resize: "vertical" }} />
                </div>
                <div className="field" style={{ marginBottom: 16 }}>
                  <label>Question text *</label>
                  <textarea value={newQ.text} onChange={e => setNewQ(q => ({ ...q, text: e.target.value }))} placeholder="Write your question here…" rows={2} style={{ resize: "vertical" }} />
                </div>
                <p style={{ fontWeight: 700, color: "#344054", fontSize: ".85rem", margin: "0 0 10px" }}>Answer options — select the correct one:</p>
                {(["A", "B", "C", "D"] as const).map((letter, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                    <input
                      type="radio"
                      name="correct"
                      checked={newQ.correct === i}
                      onChange={() => setNewQ(q => ({ ...q, correct: i as 0 | 1 | 2 | 3 }))}
                      style={{ accentColor: "#155eef", flexShrink: 0 }}
                    />
                    <span style={{ fontWeight: 700, color: "#344054", minWidth: 20 }}>{letter}.</span>
                    <input
                      value={newQ.options[i]}
                      onChange={e => {
                        const opts = [...newQ.options] as [string, string, string, string];
                        opts[i] = e.target.value;
                        setNewQ(q => ({ ...q, options: opts }));
                      }}
                      placeholder={`Option ${letter}`}
                      style={{ flex: 1 }}
                    />
                    {newQ.correct === i && <span style={{ color: "#065f46", fontSize: ".78rem", fontWeight: 700 }}>✓ Correct</span>}
                  </div>
                ))}
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button className="btn btn-primary" onClick={addQuestion} disabled={!newQ.text.trim() || newQ.options.some(o => !o.trim()) || !newQ.topic.trim()}>
                    Add question
                  </button>
                  <button onClick={() => { setAddingQ(false); setNewQ({ ...BLANK_Q, options: ["", "", "", ""] }); }} style={{ padding: "10px 20px", borderRadius: 10, background: "#f1f5f9", border: "none", fontWeight: 700, cursor: "pointer", color: "#6b7c93" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "results" && (
          <div>
            {results.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
                No students have completed this quiz yet.
              </div>
            ) : (
              <>
                <div className="grid grid-4" style={{ marginBottom: 24 }}>
                  <div className="card"><div className="eyebrow">Total attempts</div><div className="metric">{results.length}</div></div>
                  <div className="card"><div className="eyebrow">Avg total score</div><div className="metric">{Math.round(results.reduce((s, r) => s + r.total_score, 0) / results.length)}</div></div>
                  <div className="card"><div className="eyebrow">Avg math</div><div className="metric">{Math.round(results.reduce((s, r) => s + r.math_score, 0) / results.length)}</div></div>
                  <div className="card"><div className="eyebrow">Avg R&W</div><div className="metric">{Math.round(results.reduce((s, r) => s + r.rw_score, 0) / results.length)}</div></div>
                </div>
                <div className="card">
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr><th>Student</th><th>Email</th><th>Math</th><th>R&W</th><th>Total</th><th>Weak areas</th><th>Date</th></tr>
                      </thead>
                      <tbody>
                        {results.map(r => (
                          <tr key={r.id}>
                            <td>{r.student_name || "—"}</td>
                            <td>{r.student_email}</td>
                            <td>{r.math_score}</td>
                            <td>{r.rw_score}</td>
                            <td><strong>{r.total_score}</strong></td>
                            <td style={{ fontSize: ".8rem", color: "#6b7c93" }}>{r.weak_areas?.join(", ") || "None"}</td>
                            <td>{new Date(r.completed_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
