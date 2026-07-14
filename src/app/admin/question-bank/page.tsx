"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Section = "math" | "reading_writing";

interface BankQuestion {
  id: string;
  section: Section;
  topic: string;
  passage?: string;
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation?: string;
  created_by: string;
  created_at: string;
}

const BLANK: Omit<BankQuestion, "id" | "created_by" | "created_at"> = {
  section: "math",
  topic: "",
  passage: "",
  text: "",
  options: ["", "", "", ""],
  correct: 0,
  explanation: "",
};

export default function QuestionBank() {
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...BLANK, options: ["", "", "", ""] as [string, string, string, string] });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/question-bank")
      .then(r => r.json())
      .then(d => setQuestions(d.questions ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function addQuestion() {
    if (!form.text.trim() || form.options.some(o => !o.trim()) || !form.topic.trim()) return;
    setSaving(true);
    const res = await fetch("/api/question-bank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json();
    const newQ: BankQuestion = {
      ...form,
      id: d.id,
      created_by: "",
      created_at: new Date().toISOString(),
    };
    setQuestions(qs => [newQ, ...qs]);
    setForm({ ...BLANK, options: ["", "", "", ""] });
    setShowForm(false);
    setSaving(false);
  }

  async function deleteQuestion(id: string) {
    if (!confirm("Delete this question from the bank?")) return;
    await fetch(`/api/question-bank/${id}`, { method: "DELETE" });
    setQuestions(qs => qs.filter(q => q.id !== id));
  }

  const filtered = questions.filter(q =>
    !filter ||
    q.topic.toLowerCase().includes(filter.toLowerCase()) ||
    q.text.toLowerCase().includes(filter.toLowerCase())
  );

  const mathCount = questions.filter(q => q.section === "math").length;
  const rwCount = questions.filter(q => q.section === "reading_writing").length;

  return (
    <section className="section">
      <div className="container">

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
          <div>
            <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>Question Bank</h1>
            <p style={{ color: "#6b7c93", margin: 0, fontSize: ".88rem" }}>
              {questions.length} questions saved · {mathCount} Math · {rwCount} R&W
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/admin/quiz" style={{ padding: "10px 18px", borderRadius: 10, fontWeight: 700, fontSize: ".85rem", border: "2px solid #e8eef6", background: "#fff", color: "#344054", textDecoration: "none" }}>
              ← Quiz builder
            </Link>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(s => !s)}
              style={{ padding: "10px 20px" }}>
              {showForm ? "Cancel" : "+ Add question"}
            </button>
          </div>
        </div>

        {/* Add question form */}
        {showForm && (
          <div className="card" style={{ border: "2px solid #155eef", marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 16px", color: "#071b33" }}>New question</h3>
            <div className="form-grid" style={{ marginBottom: 12 }}>
              <div className="field">
                <label>Section *</label>
                <select value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value as Section }))}>
                  <option value="math">Math</option>
                  <option value="reading_writing">Reading & Writing</option>
                </select>
              </div>
              <div className="field">
                <label>Topic *</label>
                <input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="e.g. Linear Equations, Main Idea" />
              </div>
            </div>
            <div className="field" style={{ marginBottom: 12 }}>
              <label>Passage / Context (optional)</label>
              <textarea value={form.passage ?? ""} onChange={e => setForm(f => ({ ...f, passage: e.target.value }))} placeholder="Paste a reading passage or context paragraph here" rows={3} style={{ resize: "vertical" }} />
            </div>
            <div className="field" style={{ marginBottom: 16 }}>
              <label>Question text *</label>
              <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="Write your question here…" rows={2} style={{ resize: "vertical" }} />
            </div>
            <p style={{ fontWeight: 700, color: "#344054", fontSize: ".85rem", margin: "0 0 10px" }}>Answer options — select the correct one:</p>
            {(["A", "B", "C", "D"] as const).map((letter, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                <input
                  type="radio"
                  name="bank-correct"
                  checked={form.correct === i}
                  onChange={() => setForm(f => ({ ...f, correct: i as 0 | 1 | 2 | 3 }))}
                  style={{ accentColor: "#155eef", flexShrink: 0 }}
                />
                <span style={{ fontWeight: 700, color: "#344054", minWidth: 20 }}>{letter}.</span>
                <input
                  value={form.options[i]}
                  onChange={e => {
                    const opts = [...form.options] as [string, string, string, string];
                    opts[i] = e.target.value;
                    setForm(f => ({ ...f, options: opts }));
                  }}
                  placeholder={`Option ${letter}`}
                  style={{ flex: 1 }}
                />
                {form.correct === i && <span style={{ color: "#065f46", fontSize: ".78rem", fontWeight: 700 }}>✓ Correct</span>}
              </div>
            ))}
            <div className="field" style={{ marginTop: 14 }}>
              <label>Explanation (shown to students after submitting)</label>
              <textarea
                value={form.explanation ?? ""}
                onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                placeholder="Explain why the correct answer is right…"
                rows={2}
                style={{ resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                className="btn btn-primary"
                onClick={addQuestion}
                disabled={saving || !form.text.trim() || form.options.some(o => !o.trim()) || !form.topic.trim()}>
                {saving ? "Saving…" : "Save to bank"}
              </button>
              <button
                onClick={() => { setShowForm(false); setForm({ ...BLANK, options: ["", "", "", ""] }); }}
                style={{ padding: "10px 20px", borderRadius: 10, background: "#f1f5f9", border: "none", fontWeight: 700, cursor: "pointer", color: "#6b7c93" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filter */}
        {questions.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <input
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Filter by topic or keyword…"
              style={{ maxWidth: 400 }}
            />
          </div>
        )}

        {/* Questions list */}
        {loading ? (
          <div className="card"><p>Loading…</p></div>
        ) : questions.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
            <p>No questions in the bank yet.</p>
            <p style={{ fontSize: ".88rem" }}>Add questions here to reuse them across multiple quizzes.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: 12 }}>
              + Add first question
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 32, color: "#6b7c93" }}>
            No questions match your filter.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filtered.map((q, i) => (
              <div key={q.id} className="card" style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 800, color: "#6b7c93", fontSize: ".78rem" }}>#{i + 1}</span>
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
                    <div style={{ display: "grid", gap: 3, marginBottom: q.explanation ? 8 : 0 }}>
                      {q.options.map((opt, oi) => (
                        <span key={oi} style={{ fontSize: ".82rem", color: oi === q.correct ? "#065f46" : "#6b7c93", fontWeight: oi === q.correct ? 700 : 400 }}>
                          {oi === q.correct ? "✓" : "○"} {String.fromCharCode(65 + oi)}. {opt}
                        </span>
                      ))}
                    </div>
                    {q.explanation && (
                      <p style={{ fontSize: ".78rem", color: "#155eef", background: "#eff6ff", borderRadius: 6, padding: "6px 10px", margin: 0 }}>
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    style={{ background: "#fee2e2", border: "none", color: "#991b1b", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: ".78rem", flexShrink: 0 }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
