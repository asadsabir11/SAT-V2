"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Program = "sat" | "o-level";
type Section = "math" | "reading_writing" | "mathematics" | "computer-science" | "english-language" | "islamiyat" | "pakistan-studies";

interface BankQuestion {
  id: string;
  program: Program;
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

type SectionMeta = { value: Section; label: string; color: string; bg: string };
const SAT_SECTIONS: SectionMeta[] = [
  { value: "math", label: "Math", color: "#5b21b6", bg: "#ede9fe" },
  { value: "reading_writing", label: "Reading & Writing", color: "#9d174d", bg: "#fce7f3" },
];
const OLEVEL_SECTIONS: SectionMeta[] = [
  { value: "mathematics", label: "Mathematics", color: "#155eef", bg: "#eff6ff" },
  { value: "computer-science", label: "Computer Science", color: "#7c3aed", bg: "#f5f3ff" },
  { value: "english-language", label: "English Language", color: "#0e7490", bg: "#ecfeff" },
  { value: "islamiyat", label: "Islamiyat", color: "#15803d", bg: "#dcfce7" },
  { value: "pakistan-studies", label: "Pakistan Studies", color: "#b45309", bg: "#fef3c7" },
];
const ALL_SECTIONS = [...SAT_SECTIONS, ...OLEVEL_SECTIONS];
const sectionMeta = (s: Section): SectionMeta => ALL_SECTIONS.find((x) => x.value === s) ?? SAT_SECTIONS[0];
const sectionsFor = (p: Program) => (p === "o-level" ? OLEVEL_SECTIONS : SAT_SECTIONS);

const BLANK: Omit<BankQuestion, "id" | "created_by" | "created_at"> = {
  program: "sat",
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
  const [programFilter, setProgramFilter] = useState<"all" | Program>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Omit<BankQuestion, "id" | "created_by" | "created_at"> | null>(null);

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
    (programFilter === "all" || q.program === programFilter) &&
    (!filter ||
      q.topic.toLowerCase().includes(filter.toLowerCase()) ||
      q.text.toLowerCase().includes(filter.toLowerCase()))
  );

  const satCount = questions.filter(q => q.program === "sat").length;
  const olevelCount = questions.filter(q => q.program === "o-level").length;

  return (
    <section className="section">
      <div className="container">

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
          <div>
            <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>Question Bank</h1>
            <p style={{ color: "#6b7c93", margin: 0, fontSize: ".88rem" }}>
              {questions.length} questions saved · {satCount} SAT · {olevelCount} O Level
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
            <div className="field" style={{ marginBottom: 12 }}>
              <label>Program *</label>
              <div style={{ display: "flex", gap: 8 }}>
                {(["sat", "o-level"] as Program[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, program: p, section: sectionsFor(p)[0].value }))}
                    style={{ flex: 1, padding: "8px 14px", borderRadius: 8, fontWeight: 700, fontSize: ".85rem", cursor: "pointer", border: form.program === p ? "2px solid #155eef" : "2px solid #e8eef6", background: form.program === p ? "#eff6ff" : "#fff", color: form.program === p ? "#155eef" : "#6b7c93" }}>
                    {p === "sat" ? "🎓 SAT" : "📘 O Level"}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-grid" style={{ marginBottom: 12 }}>
              <div className="field">
                <label>{form.program === "o-level" ? "Subject *" : "Section *"}</label>
                <select value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value as Section }))}>
                  {sectionsFor(form.program).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
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
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {([["all", "All"], ["sat", "🎓 SAT"], ["o-level", "📘 O Level"]] as [typeof programFilter, string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setProgramFilter(val)}
                  style={{ padding: "7px 16px", borderRadius: 999, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", border: programFilter === val ? "2px solid #155eef" : "2px solid #e8eef6", background: programFilter === val ? "#eff6ff" : "#fff", color: programFilter === val ? "#155eef" : "#6b7c93" }}
                >
                  {label}
                </button>
              ))}
            </div>
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
            {filtered.map((q, i) => {
              const isEditing = editingId === q.id;
              const draft = isEditing ? editDraft! : null;

              if (isEditing && draft) {
                return (
                  <div key={q.id} className="card" style={{ border: "2px solid #155eef", padding: "18px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <span style={{ fontWeight: 800, color: "#155eef", fontSize: ".82rem" }}>Editing #{i + 1}</span>
                      <button onClick={() => { setEditingId(null); setEditDraft(null); }} style={{ background: "none", border: "none", fontSize: "1.1rem", cursor: "pointer", color: "#6b7c93" }}>✕</button>
                    </div>
                    <div className="field" style={{ marginBottom: 12 }}>
                      <label>Program *</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        {(["sat", "o-level"] as Program[]).map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setEditDraft(d => ({ ...d!, program: p, section: sectionsFor(p)[0].value }))}
                            style={{ flex: 1, padding: "7px 14px", borderRadius: 8, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", border: draft.program === p ? "2px solid #155eef" : "2px solid #e8eef6", background: draft.program === p ? "#eff6ff" : "#fff", color: draft.program === p ? "#155eef" : "#6b7c93" }}>
                            {p === "sat" ? "🎓 SAT" : "📘 O Level"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-grid" style={{ marginBottom: 12 }}>
                      <div className="field">
                        <label>{draft.program === "o-level" ? "Subject *" : "Section *"}</label>
                        <select value={draft.section} onChange={e => setEditDraft(d => ({ ...d!, section: e.target.value as Section }))}>
                          {sectionsFor(draft.program).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                      <div className="field">
                        <label>Topic *</label>
                        <input value={draft.topic} onChange={e => setEditDraft(d => ({ ...d!, topic: e.target.value }))} placeholder="e.g. Linear Equations" />
                      </div>
                    </div>
                    <div className="field" style={{ marginBottom: 12 }}>
                      <label>Passage / Context (optional)</label>
                      <textarea value={draft.passage ?? ""} onChange={e => setEditDraft(d => ({ ...d!, passage: e.target.value }))} rows={3} style={{ resize: "vertical" }} />
                    </div>
                    <div className="field" style={{ marginBottom: 14 }}>
                      <label>Question text *</label>
                      <textarea value={draft.text} onChange={e => setEditDraft(d => ({ ...d!, text: e.target.value }))} rows={2} style={{ resize: "vertical" }} />
                    </div>
                    <p style={{ fontWeight: 700, color: "#344054", fontSize: ".85rem", margin: "0 0 10px" }}>Answer options — select the correct one:</p>
                    {(["A", "B", "C", "D"] as const).map((letter, oi) => (
                      <div key={oi} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                        <input type="radio" name={`bank-edit-correct-${q.id}`} checked={draft.correct === oi} onChange={() => setEditDraft(d => ({ ...d!, correct: oi as 0 | 1 | 2 | 3 }))} style={{ accentColor: "#155eef", flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, color: "#344054", minWidth: 20 }}>{letter}.</span>
                        <input
                          value={draft.options[oi]}
                          onChange={e => {
                            const opts = [...draft.options] as [string, string, string, string];
                            opts[oi] = e.target.value;
                            setEditDraft(d => ({ ...d!, options: opts }));
                          }}
                          placeholder={`Option ${letter}`}
                          style={{ flex: 1 }}
                        />
                        {draft.correct === oi && <span style={{ color: "#065f46", fontSize: ".78rem", fontWeight: 700 }}>✓ Correct</span>}
                      </div>
                    ))}
                    <div className="field" style={{ marginTop: 14 }}>
                      <label>Explanation</label>
                      <textarea value={draft.explanation ?? ""} onChange={e => setEditDraft(d => ({ ...d!, explanation: e.target.value }))} rows={2} style={{ resize: "vertical" }} />
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                      <button
                        className="btn btn-primary"
                        disabled={!draft.text.trim() || draft.options.some(o => !o.trim()) || !draft.topic.trim()}
                        onClick={async () => {
                          await fetch(`/api/question-bank/${q.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
                          setQuestions(qs => qs.map(qq => qq.id === q.id ? { ...qq, ...draft } : qq));
                          setEditingId(null);
                          setEditDraft(null);
                        }}>
                        Save changes
                      </button>
                      <button onClick={() => { setEditingId(null); setEditDraft(null); }} style={{ padding: "10px 20px", borderRadius: 10, background: "#f1f5f9", border: "none", fontWeight: 700, cursor: "pointer", color: "#6b7c93" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={q.id} className="card" style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, color: "#6b7c93", fontSize: ".78rem" }}>#{i + 1}</span>
                        <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: q.program === "o-level" ? "#fef3c7" : "#f1f5f9", color: q.program === "o-level" ? "#92400e" : "#475569" }}>
                          {q.program === "o-level" ? "📘 O Level" : "🎓 SAT"}
                        </span>
                        <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: sectionMeta(q.section).bg, color: sectionMeta(q.section).color }}>
                          {sectionMeta(q.section).label}
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
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => { setEditingId(q.id); setEditDraft({ program: q.program, section: q.section, topic: q.topic, passage: q.passage ?? "", text: q.text, options: [...q.options] as [string,string,string,string], correct: q.correct, explanation: q.explanation ?? "" }); }}
                        style={{ background: "#eff6ff", border: "none", color: "#155eef", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: ".78rem" }}>
                        Edit
                      </button>
                      <button
                        onClick={() => deleteQuestion(q.id)}
                        style={{ background: "#fee2e2", border: "none", color: "#991b1b", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: ".78rem" }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
