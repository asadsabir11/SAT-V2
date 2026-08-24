"use client";
import { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Question {
  id: string;
  topic: string;
  passage?: string;
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation?: string;
}

interface BankQuestion extends Question {
  program: "sat" | "o-level";
  section: string;
}

interface Attempt {
  id: string;
  student_email: string;
  student_name: string;
  score: number;
  total: number;
  weak_topics: string[];
  completed_at: string;
}

const SUBJECT_META: Record<string, { label: string; icon: string }> = {
  mathematics: { label: "Mathematics", icon: "📐" },
  "computer-science": { label: "Computer Science", icon: "💻" },
  "english-language": { label: "English Language", icon: "📖" },
  islamiyat: { label: "Islamiyat", icon: "🕌" },
  "pakistan-studies": { label: "Pakistan Studies", icon: "🌍" },
  physics: { label: "Physics", icon: "⚛️" },
};

const BLANK_Q: Omit<Question, "id"> = { topic: "", passage: "", text: "", options: ["", "", "", ""], correct: 0, explanation: "" };

export default function OLevelQuizEditor({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<section className="section"><div className="container"><div className="card"><p>Loading…</p></div></div></section>}>
      <OLevelQuizEditorInner params={params} />
    </Suspense>
  );
}

function OLevelQuizEditorInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<"questions" | "results">(searchParams.get("tab") === "results" ? "results" : "questions");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(0);
  const [isPublished, setIsPublished] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newQ, setNewQ] = useState<Omit<Question, "id">>({ ...BLANK_Q, options: ["", "", "", ""] });
  const [addingQ, setAddingQ] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Omit<Question, "id"> | null>(null);
  const [showBank, setShowBank] = useState(false);
  const [bankQuestions, setBankQuestions] = useState<BankQuestion[]>([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankFilter, setBankFilter] = useState("");

  useEffect(() => {
    fetch(`/api/o-level/quizzes/${id}`)
      .then((r) => r.json())
      .then((d) => {
        const q = d.quiz;
        if (!q) return;
        setSubject(q.subject);
        setTitle(q.title);
        setDescription(q.description ?? "");
        setTimeLimitMinutes(q.time_limit_minutes ?? 0);
        setIsPublished(q.is_published);
        setQuestions(q.questions ?? []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (tab === "results") {
      fetch(`/api/o-level/quizzes/${id}/results`)
        .then((r) => r.json())
        .then((d) => setResults(d.attempts ?? []));
    }
  }, [tab, id]);

  async function saveMeta() {
    setSaving(true);
    await fetch(`/api/o-level/quizzes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, time_limit_minutes: timeLimitMinutes }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function togglePublish() {
    await fetch(`/api/o-level/quizzes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: isPublished ? "unpublish" : "publish" }),
    });
    setIsPublished((p) => !p);
  }

  async function persistQuestions(next: Question[]) {
    setQuestions(next);
    await fetch(`/api/o-level/quizzes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions: next }),
    });
  }

  function addQuestion() {
    if (!newQ.text.trim() || newQ.options.some((o) => !o.trim())) return;
    const q: Question = { ...newQ, id: crypto.randomUUID() };
    persistQuestions([...questions, q]);
    setNewQ({ ...BLANK_Q, options: ["", "", "", ""] });
    setAddingQ(false);
  }

  function removeQuestion(qId: string) {
    if (!confirm("Remove this question?")) return;
    persistQuestions(questions.filter((q) => q.id !== qId));
  }

  function startEdit(q: Question) {
    setEditingId(q.id);
    setEditDraft({ topic: q.topic, passage: q.passage ?? "", text: q.text, options: [...q.options] as [string, string, string, string], correct: q.correct, explanation: q.explanation ?? "" });
  }

  function saveEdit(qId: string) {
    if (!editDraft) return;
    persistQuestions(questions.map((q) => (q.id === qId ? { ...editDraft, id: qId } : q)));
    setEditingId(null);
    setEditDraft(null);
  }

  async function openBank() {
    setShowBank(true);
    if (bankQuestions.length === 0) {
      setBankLoading(true);
      const res = await fetch("/api/question-bank");
      const d = await res.json();
      setBankQuestions((d.questions ?? []).filter((q: BankQuestion) => q.program === "o-level" && q.section === subject));
      setBankLoading(false);
    }
  }

  function addFromBank(bq: BankQuestion) {
    if (questions.find((q) => q.id === bq.id || q.text === bq.text)) return;
    const q: Question = { id: bq.id, topic: bq.topic, passage: bq.passage, text: bq.text, options: bq.options, correct: bq.correct, explanation: bq.explanation };
    persistQuestions([...questions, q]);
  }

  const filteredBank = bankQuestions.filter((bq) =>
    !bankFilter || bq.topic.toLowerCase().includes(bankFilter.toLowerCase()) || bq.text.toLowerCase().includes(bankFilter.toLowerCase())
  );

  if (loading) return <section className="section"><div className="container"><div className="card"><p>Loading quiz…</p></div></div></section>;

  const meta = SUBJECT_META[subject] ?? { label: subject, icon: "📘" };

  return (
    <section className="section">
      <div className="container">
        <Link href="/admin/o-level-quizzes" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← All O Level quizzes</Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 0 20px", flexWrap: "wrap" }}>
          <span style={{ padding: "3px 12px", borderRadius: 999, fontSize: ".78rem", fontWeight: 700, background: "#f1f5f9", color: "#475569" }}>{meta.icon} {meta.label}</span>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#071b33", margin: 0 }}>{title || "Untitled quiz"}</h1>
          <span style={{ padding: "3px 12px", borderRadius: 999, fontSize: ".78rem", fontWeight: 800, background: isPublished ? "#d1fae5" : "#f3f4f6", color: isPublished ? "#065f46" : "#6b7c93" }}>
            {isPublished ? "● Published" : "○ Draft"}
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button onClick={() => setTab("questions")} style={{ padding: "8px 18px", borderRadius: 8, fontWeight: 700, fontSize: ".85rem", cursor: "pointer", border: "none", background: tab === "questions" ? "#155eef" : "#f1f5f9", color: tab === "questions" ? "#fff" : "#6b7c93" }}>Questions</button>
          <button onClick={() => setTab("results")} style={{ padding: "8px 18px", borderRadius: 8, fontWeight: 700, fontSize: ".85rem", cursor: "pointer", border: "none", background: tab === "results" ? "#155eef" : "#f1f5f9", color: tab === "results" ? "#fff" : "#6b7c93" }}>Results ({results.length || ""})</button>
        </div>

        {tab === "questions" ? (
          <>
            {/* Meta */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="form-grid" style={{ marginBottom: 14 }}>
                <div className="field">
                  <label>Quiz title *</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="field">
                  <label>Description</label>
                  <input value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>
              <div className="field" style={{ maxWidth: 220, marginBottom: 14 }}>
                <label>Time limit (minutes, 0 = none)</label>
                <input type="number" min={0} value={timeLimitMinutes} onChange={(e) => setTimeLimitMinutes(Number(e.target.value))} />
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button className="btn btn-primary" onClick={saveMeta} disabled={saving} style={{ padding: "8px 18px", fontSize: ".85rem" }}>
                  {saving ? "Saving…" : "Save details"}
                </button>
                {saved && <span style={{ color: "#15803d", fontSize: ".82rem", fontWeight: 700 }}>✓ Saved</span>}
                <button onClick={togglePublish} style={{ marginLeft: "auto", padding: "8px 18px", borderRadius: 8, fontWeight: 700, fontSize: ".85rem", cursor: "pointer", border: "none", background: isPublished ? "#fef3c7" : "#d1fae5", color: isPublished ? "#92400e" : "#065f46" }}>
                  {isPublished ? "Unpublish" : "Publish"}
                </button>
              </div>
            </div>

            {/* Question list */}
            <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
              {questions.map((q, i) => (
                <div key={q.id} className="card" style={{ padding: "16px 20px" }}>
                  {editingId === q.id && editDraft ? (
                    <div>
                      <div className="form-grid" style={{ marginBottom: 10 }}>
                        <div className="field"><label>Topic</label><input value={editDraft.topic} onChange={(e) => setEditDraft({ ...editDraft, topic: e.target.value })} /></div>
                        <div className="field"><label>Question *</label><input value={editDraft.text} onChange={(e) => setEditDraft({ ...editDraft, text: e.target.value })} /></div>
                      </div>
                      <div className="field" style={{ marginBottom: 10 }}>
                        <label>Passage / Context (optional)</label>
                        <textarea value={editDraft.passage ?? ""} onChange={(e) => setEditDraft({ ...editDraft, passage: e.target.value })} rows={3} style={{ resize: "vertical" }} />
                      </div>
                      <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
                        {editDraft.options.map((opt, oi) => (
                          <label key={oi} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input type="radio" checked={editDraft.correct === oi} onChange={() => setEditDraft({ ...editDraft, correct: oi as 0 | 1 | 2 | 3 })} />
                            <input
                              value={opt}
                              onChange={(e) => {
                                const opts = [...editDraft.options] as [string, string, string, string];
                                opts[oi] = e.target.value;
                                setEditDraft({ ...editDraft, options: opts });
                              }}
                              placeholder={`Option ${["A", "B", "C", "D"][oi]}`}
                              style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1.5px solid #d0dcea" }}
                            />
                          </label>
                        ))}
                      </div>
                      <div className="field" style={{ marginBottom: 10 }}>
                        <label>Explanation (optional)</label>
                        <input value={editDraft.explanation ?? ""} onChange={(e) => setEditDraft({ ...editDraft, explanation: e.target.value })} />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-primary" onClick={() => saveEdit(q.id)} style={{ padding: "8px 18px", fontSize: ".85rem" }}>Save</button>
                        <button onClick={() => { setEditingId(null); setEditDraft(null); }} style={{ padding: "8px 16px", borderRadius: 8, background: "#f1f5f9", border: "none", fontWeight: 700, cursor: "pointer", color: "#6b7c93", fontSize: ".85rem" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, color: "#6b7c93", fontSize: ".75rem" }}>Q{i + 1}</span>
                        {q.topic && <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: "#eff6ff", color: "#155eef" }}>{q.topic}</span>}
                      </div>
                      {q.passage && (
                        <p style={{ fontSize: ".82rem", color: "#6b7c93", fontStyle: "italic", borderLeft: "3px solid #dce5ef", paddingLeft: 10, margin: "0 0 8px", lineHeight: 1.6 }}>
                          {q.passage.length > 150 ? q.passage.slice(0, 150) + "…" : q.passage}
                        </p>
                      )}
                      <p style={{ fontWeight: 700, color: "#071b33", margin: "0 0 8px" }}>{q.text}</p>
                      <div style={{ display: "grid", gap: 4, marginBottom: 8 }}>
                        {q.options.map((opt, oi) => (
                          <span key={oi} style={{ fontSize: ".85rem", color: q.correct === oi ? "#15803d" : "#6b7c93", fontWeight: q.correct === oi ? 700 : 500 }}>
                            {["A", "B", "C", "D"][oi]}. {opt} {q.correct === oi && "✓"}
                          </span>
                        ))}
                      </div>
                      {q.explanation && <p style={{ fontSize: ".8rem", color: "#a0aec0", margin: "0 0 10px" }}>💡 {q.explanation}</p>}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => startEdit(q)} style={{ padding: "6px 12px", borderRadius: 8, background: "#eff6ff", border: "none", color: "#155eef", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>Edit</button>
                        <button onClick={() => removeQuestion(q.id)} style={{ padding: "6px 12px", borderRadius: 8, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {!addingQ && (
                <button className="btn btn-primary" onClick={() => setAddingQ(true)} style={{ flex: 1 }}>
                  + Add question manually
                </button>
              )}
              <button
                onClick={openBank}
                style={{ flex: 1, padding: "10px 20px", borderRadius: 10, fontWeight: 700, fontSize: ".88rem", cursor: "pointer", border: "2px solid #155eef", background: "#eff6ff", color: "#155eef" }}>
                📚 Pick from question bank
              </button>
            </div>

            {/* Question bank panel */}
            {showBank && (
              <div className="card" style={{ border: "2px solid #155eef", marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3 style={{ margin: 0, color: "#071b33" }}>Question Bank — {meta.label}</h3>
                  <button onClick={() => setShowBank(false)} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#6b7c93" }}>✕</button>
                </div>
                <input
                  value={bankFilter}
                  onChange={(e) => setBankFilter(e.target.value)}
                  placeholder="Filter by topic or keyword…"
                  style={{ marginBottom: 14, width: "100%" }}
                />
                {bankLoading ? (
                  <p style={{ color: "#6b7c93" }}>Loading bank…</p>
                ) : filteredBank.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px 0", color: "#6b7c93" }}>
                    {bankQuestions.length === 0
                      ? `No ${meta.label} questions in the bank yet. Go to Admin → Question Bank to add some.`
                      : "No questions match your filter."}
                    <br />
                    <Link href="/admin/question-bank" style={{ color: "#155eef", fontSize: ".85rem" }}>Manage question bank →</Link>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 10, maxHeight: 480, overflowY: "auto" }}>
                    {filteredBank.map((bq) => {
                      const alreadyAdded = questions.some((q) => q.id === bq.id || q.text === bq.text);
                      return (
                        <div key={bq.id} style={{ border: "1px solid #e8eef6", borderRadius: 10, padding: "12px 16px", display: "flex", gap: 12, alignItems: "flex-start", background: alreadyAdded ? "#f8fafc" : "#fff" }}>
                          <div style={{ flex: 1 }}>
                            <span style={{ color: "#a0aec0", fontSize: ".75rem" }}>{bq.topic}</span>
                            <p style={{ margin: "4px 0", fontWeight: 600, fontSize: ".85rem", color: "#344054" }}>{bq.text}</p>
                            <p style={{ margin: 0, fontSize: ".75rem", color: "#065f46" }}>
                              ✓ {String.fromCharCode(65 + bq.correct)}. {bq.options[bq.correct]}
                            </p>
                          </div>
                          <button
                            onClick={() => addFromBank(bq)}
                            disabled={alreadyAdded}
                            style={{ padding: "7px 14px", borderRadius: 8, fontWeight: 700, fontSize: ".78rem", cursor: alreadyAdded ? "default" : "pointer", border: "none", background: alreadyAdded ? "#e5e7eb" : "#d1fae5", color: alreadyAdded ? "#9ca3af" : "#065f46", flexShrink: 0 }}>
                            {alreadyAdded ? "Added" : "+ Add"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Add question */}
            {addingQ && (
              <div className="card" style={{ border: "2px solid #155eef" }}>
                <h3 style={{ margin: "0 0 14px", color: "#071b33", fontSize: "1rem" }}>New question</h3>
                <div className="form-grid" style={{ marginBottom: 10 }}>
                  <div className="field"><label>Topic</label><input value={newQ.topic} onChange={(e) => setNewQ({ ...newQ, topic: e.target.value })} placeholder="e.g. Algebra" /></div>
                  <div className="field"><label>Question *</label><input value={newQ.text} onChange={(e) => setNewQ({ ...newQ, text: e.target.value })} /></div>
                </div>
                <div className="field" style={{ marginBottom: 10 }}>
                  <label>Passage / Context (optional)</label>
                  <textarea value={newQ.passage ?? ""} onChange={(e) => setNewQ({ ...newQ, passage: e.target.value })} rows={3} style={{ resize: "vertical" }} />
                </div>
                <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
                  {newQ.options.map((opt, oi) => (
                    <label key={oi} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input type="radio" checked={newQ.correct === oi} onChange={() => setNewQ({ ...newQ, correct: oi as 0 | 1 | 2 | 3 })} />
                      <input
                        value={opt}
                        onChange={(e) => {
                          const opts = [...newQ.options] as [string, string, string, string];
                          opts[oi] = e.target.value;
                          setNewQ({ ...newQ, options: opts });
                        }}
                        placeholder={`Option ${["A", "B", "C", "D"][oi]}`}
                        style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1.5px solid #d0dcea" }}
                      />
                    </label>
                  ))}
                </div>
                <div className="field" style={{ marginBottom: 14 }}>
                  <label>Explanation (optional)</label>
                  <input value={newQ.explanation ?? ""} onChange={(e) => setNewQ({ ...newQ, explanation: e.target.value })} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-primary" onClick={addQuestion} disabled={!newQ.text.trim() || newQ.options.some((o) => !o.trim())} style={{ padding: "8px 18px", fontSize: ".85rem" }}>Add question</button>
                  <button onClick={() => setAddingQ(false)} style={{ padding: "8px 16px", borderRadius: 8, background: "#f1f5f9", border: "none", fontWeight: 700, cursor: "pointer", color: "#6b7c93", fontSize: ".85rem" }}>Cancel</button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Results */
          results.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>No attempts yet.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Student</th><th>Email</th><th>Score</th><th>Weak topics</th><th>Completed</th></tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id}>
                      <td>{r.student_name || "—"}</td>
                      <td>{r.student_email}</td>
                      <td>{r.score}/{r.total}</td>
                      <td>{r.weak_topics.join(", ") || "—"}</td>
                      <td>{new Date(r.completed_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </section>
  );
}
