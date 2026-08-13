"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  order_index: number;
}

interface BankQuestion {
  id: string;
  program: "sat" | "o-level";
  section: "math" | "reading_writing" | string;
  topic: string;
  passage?: string;
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation?: string;
}

interface Attempt {
  id: string;
  student_name: string;
  user_name: string | null;
  score: number;
  total: number;
  completed_at: string;
}

type QuizCategory = "math" | "english" | "general";

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  category: QuizCategory;
  time_limit_minutes: number | null;
  is_published: boolean;
}

const LETTERS = ["A", "B", "C", "D"];
const MATH_SUBJECTS    = ["Algebra", "Advanced Maths", "Problem-Solving & Data Analysis", "Geometry & Trigonometry"];
const ENGLISH_SUBJECTS = ["Non-Grammar Questions (Logic & Rhetoric)", "Punctuation & Sentence Structure", "Grammar & Standard English Conventions", "Appendix: Secondary & Advanced Concepts"];

const CATEGORY_META: Record<QuizCategory, { label: string; icon: string; color: string; bg: string }> = {
  math:    { label: "Math",              icon: "📐", color: "#155eef", bg: "#eff6ff" },
  english: { label: "Reading & Writing", icon: "📖", color: "#7c3aed", bg: "#f5f3ff" },
  general: { label: "General",           icon: "📝", color: "#475569", bg: "#f8fafc" },
};

const blank = { question_text: "", optionA: "", optionB: "", optionC: "", optionD: "", correct_answer: "A", explanation: "" };

export default function QuizEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quiz, setQuiz]         = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<"questions" | "results">("questions");
  const [editInfo, setEditInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({ title: "", description: "", category: "math" as QuizCategory, subject: "Algebra", time_limit_minutes: "" });
  const [savingInfo, setSavingInfo] = useState(false);
  const [published, setPublished] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [qForm, setQForm]       = useState(blank);
  const [addingQ, setAddingQ]   = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const [bankQuestions, setBankQuestions] = useState<BankQuestion[]>([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankFilter, setBankFilter] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const [selectedBankIds, setSelectedBankIds] = useState<Set<string>>(new Set());
  const [addingFromBank, setAddingFromBank] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/quizzes/${id}`)
      .then(r => r.json())
      .then(d => {
        setQuiz(d.quiz);
        setQuestions(d.questions ?? []);
        setAttempts(d.attempts ?? []);
        setPublished(d.quiz?.is_published ?? false);
        setInfoForm({
          title: d.quiz?.title ?? "",
          description: d.quiz?.description ?? "",
          category: (d.quiz?.category ?? "math") as QuizCategory,
          subject: d.quiz?.subject ?? "Algebra",
          time_limit_minutes: d.quiz?.time_limit_minutes ? String(d.quiz.time_limit_minutes) : "",
        });
        setLoading(false);
      });
  }, [id]);

  async function saveInfo() {
    setSavingInfo(true);
    const res = await fetch(`/api/admin/quizzes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...infoForm, time_limit_minutes: infoForm.time_limit_minutes ? Number(infoForm.time_limit_minutes) : null }),
    });
    const d = await res.json();
    setQuiz(d.quiz);
    setSavingInfo(false);
    setEditInfo(false);
  }

  async function togglePublish() {
    setToggling(true);
    const res = await fetch(`/api/admin/quizzes/${id}/publish`, { method: "POST" });
    const d = await res.json();
    setPublished(d.quiz.is_published);
    setToggling(false);
  }

  async function addQuestion() {
    if (!qForm.question_text.trim() || !qForm.optionA || !qForm.optionB || !qForm.optionC || !qForm.optionD) return;
    setAddingQ(true);
    const options = [qForm.optionA.trim(), qForm.optionB.trim(), qForm.optionC.trim(), qForm.optionD.trim()];
    const res = await fetch(`/api/admin/quizzes/${id}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_text: qForm.question_text.trim(), options, correct_answer: qForm.correct_answer, explanation: qForm.explanation.trim(), order_index: questions.length }),
    });
    const d = await res.json();
    setQuestions(q => [...q, d.question]);
    setQForm(blank);
    setShowAddForm(false);
    setAddingQ(false);
  }

  async function deleteQuestion(qid: string) {
    if (!confirm("Delete this question?")) return;
    await fetch(`/api/admin/quizzes/${id}/questions/${qid}`, { method: "DELETE" });
    setQuestions(q => q.filter(x => x.id !== qid));
  }

  async function openBank() {
    setShowBank(true);
    setSelectedBankIds(new Set());
    setBankSearch("");
    setBankLoading(true);
    const res = await fetch(`/api/question-bank`);
    const d = await res.json();
    setBankQuestions((d.questions ?? []).filter((q: BankQuestion) => q.program === "sat"));
    setBankLoading(false);
  }

  async function addFromBank() {
    if (selectedBankIds.size === 0) return;
    setAddingFromBank(true);
    const toAdd = bankQuestions.filter(q => selectedBankIds.has(q.id));
    let nextIndex = questions.length;
    for (const bq of toAdd) {
      const correctLetter = ["A", "B", "C", "D"][bq.correct];
      const res = await fetch(`/api/admin/quizzes/${id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: bq.text,
          options: bq.options,
          correct_answer: correctLetter,
          explanation: bq.explanation ?? "",
          order_index: nextIndex++,
        }),
      });
      const d = await res.json();
      setQuestions(q => [...q, d.question]);
    }
    setAddingFromBank(false);
    setShowBank(false);
    setSelectedBankIds(new Set());
  }

  const allTopics = Array.from(new Set(bankQuestions.map(q => q.topic))).sort();
  const filteredBank = bankQuestions.filter(q => {
    const matchTopic = !bankFilter || q.topic === bankFilter;
    const matchSearch = !bankSearch || q.text.toLowerCase().includes(bankSearch.toLowerCase()) || q.topic.toLowerCase().includes(bankSearch.toLowerCase());
    return matchTopic && matchSearch;
  });

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#6b7c93" }}>Loading…</div>;
  if (!quiz) return <div style={{ padding: 40 }}>Quiz not found.</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "32px 16px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin/quizzes" style={{ fontSize: ".82rem", color: "#6b7c93", textDecoration: "none", fontWeight: 600 }}>← All quizzes</Link>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginTop: 6, flexWrap: "wrap", gap: 10 }}>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#071b33", margin: 0, letterSpacing: "-.03em" }}>{quiz.title}</h1>
              <div style={{ fontSize: ".82rem", color: "#6b7c93", marginTop: 4 }}>
                {quiz.subject} · {questions.length} question{questions.length !== 1 ? "s" : ""}
                {quiz.time_limit_minutes ? ` · ${quiz.time_limit_minutes} min` : ""}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setEditInfo(true)} style={outlineBtn}>Edit info</button>
              <button onClick={togglePublish} disabled={toggling} style={{ padding: "9px 20px", border: "none", borderRadius: 10, fontWeight: 800, fontSize: ".88rem", cursor: "pointer", background: published ? "#fef3c7" : "#155eef", color: published ? "#92400e" : "#fff" }}>
                {toggling ? "…" : published ? "Unpublish" : "Publish quiz"}
              </button>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={{ padding: "3px 12px", borderRadius: 20, fontSize: ".72rem", fontWeight: 800, background: published ? "#dcfce7" : "#f1f5f9", color: published ? "#15803d" : "#6b7c93" }}>
              {published ? "PUBLISHED — students can see this" : "DRAFT — not visible to students"}
            </span>
          </div>
        </div>

        {/* Edit info modal */}
        {editInfo && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(7,27,51,.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: "32px", width: "100%", maxWidth: 460 }}>
              <h2 style={{ margin: "0 0 18px", fontWeight: 900, color: "#071b33" }}>Edit quiz info</h2>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Title</label>
                <input style={inp} value={infoForm.title} onChange={e => setInfoForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Description</label>
                <textarea style={{ ...inp, minHeight: 64, resize: "vertical" }} value={infoForm.description} onChange={e => setInfoForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              {/* Category */}
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Category</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["math", "english", "general"] as QuizCategory[]).map(cat => {
                    const m = CATEGORY_META[cat];
                    const active = infoForm.category === cat;
                    return (
                      <button key={cat} type="button"
                        onClick={() => setInfoForm(f => ({ ...f, category: cat, subject: cat === "math" ? MATH_SUBJECTS[0] : cat === "english" ? ENGLISH_SUBJECTS[0] : "General" }))}
                        style={{ flex: 1, padding: "9px 6px", borderRadius: 10, fontWeight: 700, fontSize: ".78rem", cursor: "pointer",
                          border: active ? `2px solid ${m.color}` : "2px solid #e8eef6",
                          background: active ? m.bg : "#f8fafc", color: active ? m.color : "#6b7c93" }}>
                        {m.icon} {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subcategory */}
              {infoForm.category !== "general" && (
                <div style={{ marginBottom: 12 }}>
                  <label style={lbl}>{infoForm.category === "math" ? "Math" : "Reading & Writing"} subcategory</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                    {(infoForm.category === "math" ? MATH_SUBJECTS : ENGLISH_SUBJECTS).map(sub => {
                      const active = infoForm.subject === sub;
                      const color  = infoForm.category === "math" ? "#155eef" : "#7c3aed";
                      const bg     = infoForm.category === "math" ? "#eff6ff" : "#f5f3ff";
                      return (
                        <button key={sub} type="button"
                          onClick={() => setInfoForm(f => ({ ...f, subject: sub }))}
                          style={{ padding: "8px 10px", borderRadius: 9, fontWeight: 700, fontSize: ".73rem", cursor: "pointer", textAlign: "left",
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
                <input style={inp} type="number" min="1" value={infoForm.time_limit_minutes} onChange={e => setInfoForm(f => ({ ...f, time_limit_minutes: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setEditInfo(false)} style={{ flex: 1, padding: "11px", border: "1.5px solid #dce5ef", borderRadius: 10, background: "#fff", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                <button onClick={saveInfo} disabled={savingInfo} style={{ flex: 2, padding: "11px", background: "#155eef", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer" }}>{savingInfo ? "Saving…" : "Save changes"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {(["questions", "results"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "9px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: ".88rem", background: tab === t ? "#155eef" : "#fff", color: tab === t ? "#fff" : "#6b7c93", boxShadow: tab === t ? "none" : "0 1px 4px rgba(7,27,51,.08)" }}>
              {t === "questions" ? `Questions (${questions.length})` : `Results (${attempts.length})`}
            </button>
          ))}
        </div>

        {tab === "questions" && (
          <>
            {/* Question list */}
            {questions.length === 0 ? (
              <div style={{ ...card, textAlign: "center", padding: "40px 24px", marginBottom: 16 }}>
                <p style={{ color: "#6b7c93", margin: 0 }}>No questions yet. Add your first question below.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                {questions.map((q, i) => (
                  <div key={q.id} style={{ ...card, position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: ".72rem", fontWeight: 800, color: "#9ca3af", marginBottom: 6 }}>Q{i + 1}</div>
                        <div style={{ fontWeight: 700, color: "#071b33", fontSize: ".95rem", lineHeight: 1.5, marginBottom: 10 }}>{q.question_text}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
                          {q.options.map((opt, idx) => (
                            <div key={idx} style={{ fontSize: ".85rem", color: LETTERS[idx] === q.correct_answer ? "#15803d" : "#344054", fontWeight: LETTERS[idx] === q.correct_answer ? 800 : 400 }}>
                              <span style={{ fontWeight: 800, marginRight: 4 }}>{LETTERS[idx]}.</span>{opt}
                              {LETTERS[idx] === q.correct_answer && <span style={{ marginLeft: 6, fontSize: ".72rem", background: "#dcfce7", color: "#15803d", padding: "1px 6px", borderRadius: 20, fontWeight: 800 }}>✓ correct</span>}
                            </div>
                          ))}
                        </div>
                        {q.explanation && <div style={{ marginTop: 8, fontSize: ".82rem", color: "#6b7c93", background: "#f8fafc", padding: "8px 12px", borderRadius: 8 }}>💡 {q.explanation}</div>}
                      </div>
                      <button onClick={() => deleteQuestion(q.id)} style={{ padding: "6px 12px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 8, fontWeight: 700, fontSize: ".78rem", cursor: "pointer", flexShrink: 0 }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add question */}
            {!showAddForm ? (
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowAddForm(true)} style={{ flex: 1, padding: "14px", border: "2px dashed #c3d4f5", borderRadius: 14, background: "#eff6ff", color: "#155eef", fontWeight: 800, fontSize: ".95rem", cursor: "pointer" }}>
                  + Add question
                </button>
                <button onClick={openBank} style={{ flex: 1, padding: "14px", border: "2px dashed #c4b5fd", borderRadius: 14, background: "#f5f3ff", color: "#7c3aed", fontWeight: 800, fontSize: ".95rem", cursor: "pointer" }}>
                  📚 Question Bank
                </button>
              </div>
            ) : (
              <div style={{ ...card, border: "2px solid #155eef" }}>
                <h3 style={{ margin: "0 0 16px", fontWeight: 900, color: "#071b33", fontSize: "1rem" }}>New question</h3>
                <div style={{ marginBottom: 12 }}>
                  <label style={lbl}>Question text *</label>
                  <textarea style={{ ...inp, minHeight: 72, resize: "vertical" }} placeholder="Type the question here…" value={qForm.question_text} onChange={e => setQForm(f => ({ ...f, question_text: e.target.value }))} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  {(["A", "B", "C", "D"] as const).map(letter => (
                    <div key={letter}>
                      <label style={lbl}>Option {letter} *</label>
                      <input style={inp} placeholder={`Option ${letter}`} value={qForm[`option${letter}` as "optionA"]} onChange={e => setQForm(f => ({ ...f, [`option${letter}`]: e.target.value }))} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10, marginBottom: 16 }}>
                  <div>
                    <label style={lbl}>Correct answer *</label>
                    <select style={inp} value={qForm.correct_answer} onChange={e => setQForm(f => ({ ...f, correct_answer: e.target.value }))}>
                      {LETTERS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Explanation (shown after submit)</label>
                    <input style={inp} placeholder="Why is this the correct answer?" value={qForm.explanation} onChange={e => setQForm(f => ({ ...f, explanation: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setShowAddForm(false); setQForm(blank); }} style={{ flex: 1, padding: "11px", border: "1.5px solid #dce5ef", borderRadius: 10, background: "#fff", fontWeight: 700, cursor: "pointer", color: "#344054" }}>Cancel</button>
                  <button onClick={addQuestion} disabled={addingQ || !qForm.question_text.trim() || !qForm.optionA || !qForm.optionB || !qForm.optionC || !qForm.optionD} style={{ flex: 2, padding: "11px", background: "#155eef", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer", opacity: addingQ ? .6 : 1 }}>
                    {addingQ ? "Adding…" : "Add question"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Question Bank Modal */}
        {showBank && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(7,27,51,.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 680, maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {/* Modal header */}
              <div style={{ padding: "22px 24px 16px", borderBottom: "1px solid #e8eef6", flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h2 style={{ margin: 0, fontWeight: 900, color: "#071b33", fontSize: "1.1rem" }}>📚 Question Bank</h2>
                  <button onClick={() => setShowBank(false)} style={{ background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: "#6b7c93", lineHeight: 1 }}>✕</button>
                </div>
                <input
                  style={{ ...inp, marginBottom: 10 }}
                  placeholder="Search questions…"
                  value={bankSearch}
                  onChange={e => setBankSearch(e.target.value)}
                />
                {allTopics.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button
                      onClick={() => setBankFilter("")}
                      style={{ padding: "4px 12px", borderRadius: 20, border: "1.5px solid " + (!bankFilter ? "#7c3aed" : "#dce5ef"), background: !bankFilter ? "#f5f3ff" : "#f8fafc", color: !bankFilter ? "#7c3aed" : "#6b7c93", fontWeight: 700, fontSize: ".75rem", cursor: "pointer" }}>
                      All
                    </button>
                    {allTopics.map(topic => (
                      <button key={topic}
                        onClick={() => setBankFilter(bankFilter === topic ? "" : topic)}
                        style={{ padding: "4px 12px", borderRadius: 20, border: "1.5px solid " + (bankFilter === topic ? "#7c3aed" : "#dce5ef"), background: bankFilter === topic ? "#f5f3ff" : "#f8fafc", color: bankFilter === topic ? "#7c3aed" : "#6b7c93", fontWeight: 700, fontSize: ".75rem", cursor: "pointer", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {topic}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Question list */}
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 24px" }}>
                {bankLoading ? (
                  <div style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>Loading questions…</div>
                ) : filteredBank.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>
                    {bankQuestions.length === 0
                      ? "No SAT questions in the bank yet. Add questions via the Question Bank page first."
                      : "No questions match your filter."}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {filteredBank.map(bq => {
                      const checked = selectedBankIds.has(bq.id);
                      return (
                        <div key={bq.id}
                          onClick={() => setSelectedBankIds(prev => { const s = new Set(prev); if (s.has(bq.id)) { s.delete(bq.id); } else { s.add(bq.id); } return s; })}
                          style={{ padding: "14px 16px", borderRadius: 12, border: `2px solid ${checked ? "#7c3aed" : "#e8eef6"}`, background: checked ? "#f5f3ff" : "#fff", cursor: "pointer", transition: "border-color .15s, background .15s" }}>
                          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${checked ? "#7c3aed" : "#c4b5fd"}`, background: checked ? "#7c3aed" : "#fff", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {checked && <span style={{ color: "#fff", fontSize: ".7rem", fontWeight: 900 }}>✓</span>}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: ".72rem", fontWeight: 800, color: "#9ca3af", marginBottom: 4 }}>
                                {bq.section === "math" ? "Math" : "Reading & Writing"} · {bq.topic}
                              </div>
                              <div style={{ fontWeight: 700, color: "#071b33", fontSize: ".88rem", lineHeight: 1.5, marginBottom: 6 }}>{bq.text}</div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 12px" }}>
                                {bq.options.map((opt, idx) => (
                                  <div key={idx} style={{ fontSize: ".8rem", color: idx === bq.correct ? "#15803d" : "#6b7c93", fontWeight: idx === bq.correct ? 800 : 400 }}>
                                    <span style={{ fontWeight: 800, marginRight: 3 }}>{LETTERS[idx]}.</span>{opt}
                                    {idx === bq.correct && <span style={{ marginLeft: 5, fontSize: ".68rem", background: "#dcfce7", color: "#15803d", padding: "1px 5px", borderRadius: 20, fontWeight: 800 }}>✓</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: "14px 24px", borderTop: "1px solid #e8eef6", display: "flex", gap: 10, flexShrink: 0 }}>
                <button onClick={() => setShowBank(false)} style={{ flex: 1, padding: "11px", border: "1.5px solid #dce5ef", borderRadius: 10, background: "#fff", fontWeight: 700, cursor: "pointer", color: "#344054" }}>Cancel</button>
                <button
                  onClick={addFromBank}
                  disabled={selectedBankIds.size === 0 || addingFromBank}
                  style={{ flex: 2, padding: "11px", background: selectedBankIds.size === 0 ? "#e8eef6" : "#7c3aed", color: selectedBankIds.size === 0 ? "#9ca3af" : "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: selectedBankIds.size === 0 ? "default" : "pointer", transition: "background .15s" }}>
                  {addingFromBank ? "Adding…" : selectedBankIds.size === 0 ? "Select questions to add" : `Add ${selectedBankIds.size} question${selectedBankIds.size !== 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "results" && (
          <div style={card}>
            <h3 style={{ margin: "0 0 16px", fontWeight: 900, color: "#071b33" }}>Student results</h3>
            {attempts.length === 0 ? (
              <p style={{ color: "#6b7c93", margin: 0 }}>No students have completed this quiz yet.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={th}>Student</th>
                      <th style={th}>Score</th>
                      <th style={th}>Percentage</th>
                      <th style={th}>Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map(a => {
                      const pct = Math.round((a.score / a.total) * 100);
                      return (
                        <tr key={a.id} style={{ borderBottom: "1px solid #f0f4f8" }}>
                          <td style={td}>{a.user_name ?? a.student_name ?? "Unknown"}</td>
                          <td style={td}><strong>{a.score}/{a.total}</strong></td>
                          <td style={td}>
                            <span style={{ padding: "2px 10px", borderRadius: 20, fontWeight: 800, fontSize: ".78rem", background: pct >= 80 ? "#dcfce7" : pct >= 60 ? "#fef3c7" : "#fee2e2", color: pct >= 80 ? "#15803d" : pct >= 60 ? "#92400e" : "#991b1b" }}>
                              {pct}%
                            </span>
                          </td>
                          <td style={td}>{new Date(a.completed_at).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const card: React.CSSProperties = { background: "#fff", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 8px rgba(7,27,51,.07)", border: "1px solid #e8eef6" };
const lbl: React.CSSProperties = { display: "block", fontWeight: 700, fontSize: ".82rem", color: "#344054", marginBottom: 5 };
const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #dce5ef", fontSize: ".9rem", boxSizing: "border-box", outline: "none" };
const outlineBtn: React.CSSProperties = { padding: "9px 18px", border: "1.5px solid #dce5ef", borderRadius: 10, background: "#fff", fontWeight: 700, fontSize: ".88rem", cursor: "pointer", color: "#344054" };
const th: React.CSSProperties = { textAlign: "left", padding: "10px 12px", fontWeight: 800, fontSize: ".78rem", color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em" };
const td: React.CSSProperties = { padding: "12px 12px", color: "#344054", verticalAlign: "middle" };
