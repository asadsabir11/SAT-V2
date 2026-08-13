"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  order_index: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  time_limit_minutes: number | null;
}

interface Results {
  score: number;
  total: number;
  results: Record<string, { correct: boolean; correct_answer: string; explanation: string }>;
}

const LETTERS = ["A", "B", "C", "D"];

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quiz, setQuiz]           = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading]     = useState(true);
  const [answers, setAnswers]     = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults]     = useState<Results | null>(null);
  const [error, setError]         = useState("");
  const [timeLeft, setTimeLeft]   = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/quizzes/${id}`).then(r => r.json()).then(d => {
      if (d.error) { setError(d.error); setLoading(false); return; }
      setQuiz(d.quiz);
      setQuestions(d.questions ?? []);
      if (d.quiz.time_limit_minutes) setTimeLeft(d.quiz.time_limit_minutes * 60);
      setLoading(false);
    });
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || results) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const t = setTimeout(() => setTimeLeft(s => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, results]);

  async function handleSubmit() {
    if (submitting) return;
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0 && !confirm(`You have ${unanswered.length} unanswered question(s). Submit anyway?`)) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quizzes/${id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const d = await res.json();
      setResults(d);
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const answered  = Object.keys(answers).length;
  const total     = questions.length;
  const progress  = total > 0 ? Math.round((answered / total) * 100) : 0;

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "#6b7c93" }}>Loading quiz…</div>;
  if (error)   return <div style={{ padding: 60, textAlign: "center" }}><p style={{ color: "#c62828" }}>{error}</p><Link href="/quizzes" style={{ color: "#155eef" }}>← Back to quizzes</Link></div>;
  if (!quiz)   return null;

  // ── Results screen ──────────────────────────────────────────────────────────
  if (results) {
    const pct = Math.round((results.score / results.total) * 100);
    const pass = pct >= 70;
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px 16px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Link href="/quizzes" style={{ fontSize: ".82rem", color: "#6b7c93", textDecoration: "none", fontWeight: 600 }}>← Back to quizzes</Link>

          {/* Score banner */}
          <div style={{ marginTop: 16, marginBottom: 28, background: pass ? "linear-gradient(135deg,#052e16,#14532d)" : "linear-gradient(135deg,#450a0a,#7f1d1d)", borderRadius: 20, padding: "32px 28px", textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: ".75rem", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: pass ? "#86efac" : "#fca5a5", marginBottom: 8 }}>Quiz complete</div>
            <div style={{ fontSize: "3.5rem", fontWeight: 900, lineHeight: 1, marginBottom: 6 }}>{pct}%</div>
            <div style={{ fontSize: "1rem", color: pass ? "#bbf7d0" : "#fecaca" }}>{results.score} / {results.total} correct</div>
            <div style={{ marginTop: 10, fontSize: ".9rem", color: pass ? "#86efac" : "#fca5a5", fontWeight: 700 }}>
              {pct >= 90 ? "Excellent work!" : pct >= 70 ? "Good job — keep it up!" : "Keep practising — you've got this!"}
            </div>
          </div>

          {/* Per-question review */}
          <h2 style={{ fontWeight: 900, color: "#071b33", marginBottom: 16, fontSize: "1.1rem" }}>Answer review</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {questions.map((q, i) => {
              const r    = results.results[q.id];
              const sel  = answers[q.id];
              return (
                <div key={q.id} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", border: `1.5px solid ${r?.correct ? "#86efac" : "#fca5a5"}`, boxShadow: "0 1px 6px rgba(7,27,51,.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontWeight: 900, fontSize: ".72rem", color: "#9ca3af" }}>Q{i + 1}</span>
                    <span style={{ padding: "2px 10px", borderRadius: 20, fontWeight: 800, fontSize: ".72rem", background: r?.correct ? "#dcfce7" : "#fee2e2", color: r?.correct ? "#15803d" : "#991b1b" }}>
                      {r?.correct ? "✓ Correct" : "✗ Incorrect"}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, color: "#071b33", marginBottom: 10, lineHeight: 1.5 }}>{q.question_text}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
                    {q.options.map((opt, idx) => {
                      const letter = LETTERS[idx];
                      const isCorrect = letter === r?.correct_answer;
                      const isSelected = letter === sel;
                      let bg = "#f8fafc", color = "#344054", border = "1px solid #e8eef6";
                      if (isCorrect)              { bg = "#dcfce7"; color = "#15803d"; border = "1px solid #86efac"; }
                      else if (isSelected && !isCorrect) { bg = "#fee2e2"; color = "#991b1b"; border = "1px solid #fca5a5"; }
                      return (
                        <div key={idx} style={{ padding: "7px 10px", borderRadius: 8, background: bg, color, border, fontSize: ".84rem", fontWeight: isCorrect || isSelected ? 700 : 400 }}>
                          <span style={{ fontWeight: 900, marginRight: 4 }}>{letter}.</span>{opt}
                          {isCorrect && <span style={{ marginLeft: 4 }}>✓</span>}
                          {isSelected && !isCorrect && <span style={{ marginLeft: 4 }}>✗</span>}
                        </div>
                      );
                    })}
                  </div>
                  {r?.explanation && (
                    <div style={{ marginTop: 10, fontSize: ".82rem", color: "#6b7c93", background: "#f8fafc", padding: "8px 12px", borderRadius: 8, borderLeft: "3px solid #155eef" }}>
                      💡 {r.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
            <Link href="/quizzes" style={{ flex: 1, textAlign: "center", padding: "13px", border: "1.5px solid #dce5ef", borderRadius: 12, fontWeight: 700, color: "#344054", textDecoration: "none", background: "#fff" }}>
              ← All quizzes
            </Link>
            <button onClick={() => { setResults(null); setAnswers({}); if (quiz.time_limit_minutes) setTimeLeft(quiz.time_limit_minutes * 60); }} style={{ flex: 1, padding: "13px", background: "#155eef", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, cursor: "pointer" }}>
              Retake quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz taking screen ──────────────────────────────────────────────────────
  const mins = timeLeft !== null ? Math.floor(timeLeft / 60) : null;
  const secs = timeLeft !== null ? timeLeft % 60 : null;
  const timeWarning = timeLeft !== null && timeLeft <= 60;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "32px 16px 80px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Quiz header */}
        <div style={{ background: "#fff", borderRadius: 18, padding: "22px 24px", marginBottom: 20, boxShadow: "0 1px 8px rgba(7,27,51,.07)", border: "1px solid #e8eef6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
            <div>
              <Link href="/quizzes" style={{ fontSize: ".8rem", color: "#6b7c93", textDecoration: "none", fontWeight: 600 }}>← Quizzes</Link>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#071b33", margin: "4px 0 2px" }}>{quiz.title}</h1>
              {quiz.description && <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>{quiz.description}</p>}
            </div>
            {timeLeft !== null && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: ".7rem", fontWeight: 800, color: "#6b7c93", letterSpacing: ".06em", textTransform: "uppercase" }}>Time left</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 900, color: timeWarning ? "#dc2626" : "#071b33", fontVariantNumeric: "tabular-nums" }}>
                  {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                </div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".78rem", color: "#6b7c93", marginBottom: 5 }}>
              <span>{answered} of {total} answered</span>
              <span>{progress}%</span>
            </div>
            <div style={{ height: 6, background: "#e8eef6", borderRadius: 99 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "#155eef", borderRadius: 99, transition: "width .3s" }} />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {questions.map((q, i) => {
            const sel = answers[q.id];
            return (
              <div key={q.id} style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", boxShadow: "0 1px 8px rgba(7,27,51,.07)", border: `1.5px solid ${sel ? "#155eef" : "#e8eef6"}` }}>
                <div style={{ fontSize: ".72rem", fontWeight: 800, color: "#9ca3af", marginBottom: 8 }}>Question {i + 1} of {total}</div>
                <div style={{ fontWeight: 700, color: "#071b33", fontSize: ".97rem", lineHeight: 1.6, marginBottom: 14 }}>{q.question_text}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {q.options.map((opt, idx) => {
                    const letter = LETTERS[idx];
                    const chosen = sel === letter;
                    return (
                      <button
                        key={idx}
                        onClick={() => setAnswers(a => ({ ...a, [q.id]: letter }))}
                        style={{
                          display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                          borderRadius: 10, border: `2px solid ${chosen ? "#155eef" : "#e8eef6"}`,
                          background: chosen ? "#eff6ff" : "#fff", cursor: "pointer", textAlign: "left",
                          transition: ".15s",
                        }}
                      >
                        <span style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${chosen ? "#155eef" : "#dce5ef"}`, background: chosen ? "#155eef" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: ".78rem", color: chosen ? "#fff" : "#6b7c93", flexShrink: 0 }}>
                          {letter}
                        </span>
                        <span style={{ fontSize: ".9rem", color: chosen ? "#1e40af" : "#344054", fontWeight: chosen ? 700 : 400 }}>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit button */}
        <div style={{ marginTop: 24, background: "#fff", borderRadius: 16, padding: "20px 22px", boxShadow: "0 1px 8px rgba(7,27,51,.07)", border: "1px solid #e8eef6" }}>
          {answered < total && (
            <p style={{ color: "#6b7c93", fontSize: ".85rem", margin: "0 0 12px" }}>
              ⚠ {total - answered} question{total - answered !== 1 ? "s" : ""} unanswered
            </p>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ width: "100%", padding: "15px", background: "#155eef", color: "#fff", border: "none", borderRadius: 12, fontWeight: 900, fontSize: "1rem", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? .7 : 1 }}
          >
            {submitting ? "Submitting…" : `Submit quiz (${answered}/${total} answered)`}
          </button>
        </div>
      </div>
    </div>
  );
}
