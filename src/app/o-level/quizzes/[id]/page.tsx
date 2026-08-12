"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";

interface Question {
  id: string;
  topic: string;
  passage?: string;
  text: string;
  options: [string, string, string, string];
}

interface Quiz {
  id: string;
  subject: string;
  title: string;
  description: string;
  time_limit_minutes: number;
  questions: Question[];
}

interface QuizResult {
  id: string;
  correct: boolean;
  correctAnswer: number;
  userAnswer: number | null;
}

const SUBJECT_META: Record<string, { label: string; icon: string }> = {
  mathematics: { label: "Mathematics", icon: "📐" },
  "computer-science": { label: "Computer Science", icon: "💻" },
  "english-language": { label: "English Language", icon: "📖" },
  islamiyat: { label: "Islamiyat", icon: "🕌" },
  "pakistan-studies": { label: "Pakistan Studies", icon: "🌍" },
};

export default function TakeOLevelQuiz({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<QuizResult[]>([]);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [bestScore, setBestScore] = useState<{ score: number; total: number } | null>(null);
  const [state, setState] = useState<"ready" | "submitted">("ready");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/o-level/quizzes/${id}`)
      .then((r) => ({ status: r.status, data: r.json() }))
      .then(async ({ status, data }) => {
        const d = await data;
        if (status !== 200 || d.error) { setNotFound(true); return; }
        setQuiz(d.quiz);
        setBestScore(d.best_score ?? null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function submit() {
    if (submitting || !quiz) return;
    setSubmitting(true);
    try {
      const r = await fetch(`/api/o-level/quizzes/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const d = await r.json();
      setScore(d.score);
      setTotal(d.total);
      setResults(d.results ?? []);
      setBestScore((prev) => (!prev || d.score > prev.score ? { score: d.score, total: d.total } : prev));
      setState("submitted");
    } finally {
      setSubmitting(false);
    }
  }

  function retake() {
    setAnswers({});
    setResults([]);
    setState("ready");
  }

  const scoreColor = (s: number, t: number) => {
    const pct = t > 0 ? s / t : 0;
    if (pct >= 0.8) return "#15803d";
    if (pct >= 0.6) return "#b45309";
    return "#dc2626";
  };

  if (loading) return <section className="section"><div className="container"><div className="card" style={{ maxWidth: 400 }}><p>Loading quiz…</p></div></div></section>;

  if (notFound || !quiz) return (
    <section className="section"><div className="container">
      <div className="card" style={{ maxWidth: 400, textAlign: "center", padding: 40 }}>
        <p style={{ fontWeight: 700, marginBottom: 12 }}>Quiz not found.</p>
        <Link href="/o-level/quizzes" style={{ color: "#155eef", fontWeight: 700 }}>← All quizzes</Link>
      </div>
    </div></section>
  );

  const meta = SUBJECT_META[quiz.subject] ?? { label: quiz.subject, icon: "📘" };

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <Link href="/o-level/quizzes" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none", display: "inline-block", marginBottom: 16 }}>← All quizzes</Link>

        <div className="eyebrow">{meta.icon} {meta.label}</div>
        <h1 className="title" style={{ marginTop: 6 }}>{quiz.title}</h1>
        {quiz.description && <p className="lead">{quiz.description}</p>}
        {quiz.time_limit_minutes > 0 && (
          <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>⏱ Suggested time: {quiz.time_limit_minutes} minutes</p>
        )}

        {bestScore && state !== "submitted" && (
          <div style={{ padding: "10px 16px", borderRadius: 10, background: "#f0fdf4", border: "1.5px solid #86efac", margin: "16px 0", display: "flex", alignItems: "center", gap: 10 }}>
            <span>🏆</span>
            <span style={{ fontSize: ".88rem", color: "#15803d", fontWeight: 700 }}>Your best score: {bestScore.score}/{bestScore.total}</span>
          </div>
        )}

        {state === "ready" && (
          <div className="card" style={{ marginTop: 20 }}>
            {quiz.questions.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>This quiz has no questions yet — check back soon.</p>
            ) : (
              <>
                <p style={{ fontWeight: 800, color: "#071b33", marginBottom: 20, fontSize: ".95rem" }}>Answer all {quiz.questions.length} questions:</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {quiz.questions.map((q, qi) => (
                    <div key={q.id}>
                      {q.passage && (
                        <p style={{ fontSize: ".85rem", color: "#6b7c93", fontStyle: "italic", borderLeft: "3px solid #dce5ef", paddingLeft: 12, margin: "0 0 10px", lineHeight: 1.65 }}>
                          {q.passage}
                        </p>
                      )}
                      <p style={{ fontWeight: 700, color: "#071b33", marginBottom: 10, fontSize: ".92rem" }}>{qi + 1}. {q.text}</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {q.options.map((opt, oi) => {
                          const selected = answers[q.id] === oi;
                          return (
                            <label key={oi} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${selected ? "#155eef" : "#e8eef6"}`, background: selected ? "#eff6ff" : "#fff", cursor: "pointer", fontSize: ".88rem", fontWeight: selected ? 700 : 500, color: selected ? "#1d4ed8" : "#344054" }}>
                              <input type="radio" name={q.id} checked={selected} onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))} style={{ accentColor: "#155eef" }} />
                              <span style={{ fontWeight: 700, color: selected ? "#1d4ed8" : "#6b7c93", minWidth: 18 }}>{["A", "B", "C", "D"][oi]}.</span> {opt}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={submit}
                  disabled={submitting || Object.keys(answers).length < quiz.questions.length}
                  style={{ marginTop: 24, width: "100%", padding: 12, background: Object.keys(answers).length < quiz.questions.length ? "#e8eef6" : "#155eef", color: Object.keys(answers).length < quiz.questions.length ? "#9ca3af" : "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: ".95rem", cursor: Object.keys(answers).length < quiz.questions.length ? "not-allowed" : "pointer" }}
                >
                  {submitting ? "Submitting…" : `Submit Quiz (${Object.keys(answers).length}/${quiz.questions.length} answered)`}
                </button>
              </>
            )}
          </div>
        )}

        {state === "submitted" && (
          <div className="card" style={{ marginTop: 20 }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>{score === total ? "🎉" : score >= total * 0.6 ? "👍" : "📚"}</div>
              <p style={{ fontSize: "1.4rem", fontWeight: 900, color: scoreColor(score, total) }}>{score}/{total}</p>
              <p style={{ color: "#6b7c93", fontSize: ".88rem" }}>
                {score === total ? "Perfect score!" : score >= total * 0.8 ? "Great job!" : score >= total * 0.6 ? "Good effort — review the ones you missed." : "Review the material and try again."}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {quiz.questions.map((q, i) => {
                const r = results[i];
                return (
                  <div key={q.id} style={{ padding: "12px 14px", borderRadius: 8, background: r?.correct ? "#f0fdf4" : "#fef2f2", border: `1.5px solid ${r?.correct ? "#86efac" : "#fca5a5"}` }}>
                    <p style={{ fontWeight: 700, fontSize: ".85rem", color: r?.correct ? "#15803d" : "#dc2626", margin: "0 0 4px" }}>
                      {r?.correct ? "✓" : "✗"} Question {i + 1}: {q.text}
                    </p>
                    {!r?.correct && r && (
                      <p style={{ fontSize: ".82rem", color: "#6b7c93", margin: 0 }}>
                        Correct answer: <strong>{["A", "B", "C", "D"][r.correctAnswer]}. {q.options[r.correctAnswer]}</strong>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <button onClick={retake} style={{ width: "100%", padding: 11, background: "#f8fafc", color: "#344054", border: "1.5px solid #e8eef6", borderRadius: 10, fontWeight: 700, fontSize: ".92rem", cursor: "pointer" }}>
              Retake Quiz
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
