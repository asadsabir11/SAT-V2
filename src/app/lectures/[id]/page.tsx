"use client";
import { useEffect, useState, use, useRef, useCallback } from "react";
import Link from "next/link";

interface Lecture {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  category: "math" | "english" | "introduction";
  is_free_preview: boolean;
  is_locked?: boolean;
  order_index: number;
  created_at: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
}

interface QuizResult {
  id: string;
  correct: boolean;
  correctAnswer: string;
  userAnswer: string | null;
}

const WA_URL = process.env.NEXT_PUBLIC_PAYMENT_WHATSAPP_URL ?? "#";

// ─── Quiz Section ──────────────────────────────────────────────────────────────
function QuizSection({ lectureId }: { lectureId: string }) {
  const [state, setState] = useState<"loading" | "locked" | "no-quiz" | "generating" | "ready" | "submitted">("loading");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<QuizResult[]>([]);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(5);
  const [bestScore, setBestScore] = useState<{ score: number; total: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadQuiz = useCallback(async () => {
    setState("generating");
    try {
      const r = await fetch(`/api/lectures/${lectureId}/quiz`);
      const d = await r.json();
      if (!d.completed_lecture) { setState("locked"); return; }
      if (d.best_score) setBestScore(d.best_score);
      if (!d.questions) { setState("no-quiz" as typeof state); return; }
      setQuestions(d.questions ?? []);
      setState("ready");
    } catch {
      setState("locked");
    }
  }, [lectureId]);

  useEffect(() => { loadQuiz(); }, [loadQuiz]);

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const r = await fetch(`/api/lectures/${lectureId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const d = await r.json();
      setScore(d.score);
      setTotal(d.total);
      setResults(d.results ?? []);
      setBestScore({ score: d.score, total: d.total });
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
    const pct = s / t;
    if (pct >= 0.8) return "#15803d";
    if (pct >= 0.6) return "#b45309";
    return "#dc2626";
  };

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: "#e8eef6" }} />
        <span style={{ fontSize: ".78rem", fontWeight: 800, color: "#6b7c93", letterSpacing: ".08em", textTransform: "uppercase" }}>Lecture Quiz</span>
        <div style={{ flex: 1, height: 1, background: "#e8eef6" }} />
      </div>

      {/* Locked */}
      {(state === "locked" || state === "loading") && (
        <div className="card" style={{ textAlign: "center", padding: "36px 24px", borderStyle: "dashed" }}>
          <div style={{ fontSize: "2rem", marginBottom: 10 }}>🔒</div>
          <p style={{ fontWeight: 800, color: "#071b33", marginBottom: 6 }}>Quiz locked</p>
          <p style={{ color: "#6b7c93", fontSize: ".88rem" }}>Watch at least 80% of this lecture to unlock the quiz.</p>
        </div>
      )}

      {/* No quiz yet */}
      {state === "no-quiz" && (
        <div className="card" style={{ textAlign: "center", padding: "36px 24px" }}>
          <div style={{ fontSize: "2rem", marginBottom: 10 }}>📝</div>
          <p style={{ fontWeight: 800, color: "#071b33", marginBottom: 6 }}>Quiz coming soon</p>
          <p style={{ color: "#6b7c93", fontSize: ".88rem" }}>Your tutor hasn't added a quiz for this lecture yet.</p>
        </div>
      )}

      {/* Generating (legacy state, kept for safety) */}
      {state === "generating" && (
        <div className="card" style={{ textAlign: "center", padding: "36px 24px" }}>
          <div style={{ fontSize: "2rem", marginBottom: 10 }}>✨</div>
          <p style={{ fontWeight: 800, color: "#071b33", marginBottom: 6 }}>Generating your quiz…</p>
          <p style={{ color: "#6b7c93", fontSize: ".88rem" }}>AI is creating 5 questions based on this lecture. Just a moment.</p>
        </div>
      )}

      {/* Best score banner */}
      {bestScore && state !== "submitted" && (
        <div style={{ padding: "10px 16px", borderRadius: 10, background: "#f0fdf4", border: "1.5px solid #86efac", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span>🏆</span>
          <span style={{ fontSize: ".88rem", color: "#15803d", fontWeight: 700 }}>
            Your best score: {bestScore.score}/{bestScore.total}
          </span>
        </div>
      )}

      {/* Quiz questions */}
      {state === "ready" && (
        <div className="card">
          <p style={{ fontWeight: 800, color: "#071b33", marginBottom: 20, fontSize: ".95rem" }}>Answer all {questions.length} questions:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {questions.map((q, qi) => (
              <div key={q.id}>
                <p style={{ fontWeight: 700, color: "#071b33", marginBottom: 10, fontSize: ".92rem" }}>
                  {qi + 1}. {q.question}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {q.options.map((opt, oi) => {
                    const letter = ["A", "B", "C", "D"][oi];
                    const selected = answers[q.id] === letter;
                    return (
                      <label key={oi} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${selected ? "#155eef" : "#e8eef6"}`, background: selected ? "#eff6ff" : "#fff", cursor: "pointer", fontSize: ".88rem", fontWeight: selected ? 700 : 500, color: selected ? "#1d4ed8" : "#344054", transition: "all .12s" }}>
                        <input type="radio" name={q.id} value={letter} checked={selected} onChange={() => setAnswers(a => ({ ...a, [q.id]: letter }))} style={{ accentColor: "#155eef" }} />
                        <span style={{ fontWeight: 700, color: selected ? "#1d4ed8" : "#6b7c93", minWidth: 18 }}>{letter}.</span> {opt}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={submit}
            disabled={submitting || Object.keys(answers).length < questions.length}
            style={{ marginTop: 24, width: "100%", padding: "12px", background: Object.keys(answers).length < questions.length ? "#e8eef6" : "#155eef", color: Object.keys(answers).length < questions.length ? "#9ca3af" : "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: ".95rem", cursor: Object.keys(answers).length < questions.length ? "not-allowed" : "pointer", transition: "all .15s" }}
          >
            {submitting ? "Submitting…" : `Submit Quiz (${Object.keys(answers).length}/${questions.length} answered)`}
          </button>
        </div>
      )}

      {/* Results */}
      {state === "submitted" && (
        <div className="card">
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>{score === total ? "🎉" : score >= total * 0.6 ? "👍" : "📚"}</div>
            <p style={{ fontSize: "1.4rem", fontWeight: 900, color: scoreColor(score, total) }}>{score}/{total}</p>
            <p style={{ color: "#6b7c93", fontSize: ".88rem" }}>
              {score === total ? "Perfect score!" : score >= total * 0.8 ? "Great job!" : score >= total * 0.6 ? "Good effort — review the ones you missed." : "Review the lecture and try again."}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {results.map((r, i) => (
              <div key={r.id} style={{ padding: "12px 14px", borderRadius: 8, background: r.correct ? "#f0fdf4" : "#fef2f2", border: `1.5px solid ${r.correct ? "#86efac" : "#fca5a5"}` }}>
                <p style={{ fontWeight: 700, fontSize: ".85rem", color: r.correct ? "#15803d" : "#dc2626", margin: "0 0 4px" }}>
                  {r.correct ? "✓" : "✗"} Question {i + 1}
                </p>
                {!r.correct && (
                  <p style={{ fontSize: ".82rem", color: "#6b7c93", margin: 0 }}>
                    Correct answer: <strong>{r.correctAnswer}</strong>
                    {r.userAnswer && <> · Your answer: {r.userAnswer}</>}
                  </p>
                )}
              </div>
            ))}
          </div>

          <button onClick={retake} style={{ width: "100%", padding: "11px", background: "#f8fafc", color: "#344054", border: "1.5px solid #e8eef6", borderRadius: 10, fontWeight: 700, fontSize: ".92rem", cursor: "pointer" }}>
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WatchLecture({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lecture, setLecture]       = useState<Lecture | null>(null);
  const [allLectures, setAllLectures] = useState<Lecture[]>([]);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);
  const [locked, setLocked]         = useState(false);
  const [watchPct, setWatchPct]     = useState(0);
  const [lectureCompleted, setLectureCompleted] = useState(false);
  const [quizKey, setQuizKey]       = useState(0); // force quiz reload
  const videoRef  = useRef<HTMLVideoElement>(null);
  const markedRef = useRef(false);

  useEffect(() => {
    markedRef.current = false;
    setLectureCompleted(false);
    setWatchPct(0);

    Promise.all([
      fetch(`/api/lectures/${id}`).then(r => ({ status: r.status, data: r.json() })),
      fetch("/api/lectures").then(r => r.json()),
    ]).then(async ([lecRes, all]) => {
      const lecData = await lecRes.data;
      if (lecRes.status === 403) setLocked(true);
      else if (lecData.error) setNotFound(true);
      else setLecture(lecData.lecture);
      setAllLectures(all.lectures ?? []);
    }).finally(() => setLoading(false));
  }, [id]);

  // Track video progress
  const handleTimeUpdate = useCallback(async () => {
    if (markedRef.current) return;
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const pct = Math.round((video.currentTime / video.duration) * 100);
    setWatchPct(pct);
    if (pct >= 80) {
      markedRef.current = true;
      await fetch(`/api/lectures/${id}/progress`, { method: "POST" });
      setLectureCompleted(true);
      setQuizKey(k => k + 1);
    }
  }, [id]);

  const handleEnded = useCallback(async () => {
    if (markedRef.current) return;
    markedRef.current = true;
    await fetch(`/api/lectures/${id}/progress`, { method: "POST" });
    setLectureCompleted(true);
    setWatchPct(100);
    setQuizKey(k => k + 1);
  }, [id]);

  if (loading) return <section className="section"><div className="container"><div className="card" style={{ maxWidth: 400 }}><p>Loading lecture…</p></div></div></section>;

  if (notFound) return (
    <section className="section"><div className="container">
      <div className="card" style={{ maxWidth: 400, textAlign: "center", padding: 40 }}>
        <p style={{ fontWeight: 700, marginBottom: 12 }}>Lecture not found.</p>
        <Link href="/lectures" style={{ color: "#155eef", fontWeight: 700 }}>← Back to lectures</Link>
      </div>
    </div></section>
  );

  if (locked) return (
    <section className="section"><div className="container">
      <Link href="/lectures" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none", display: "inline-block", marginBottom: 20 }}>← All lectures</Link>
      <div className="card" style={{ maxWidth: 540, textAlign: "center", padding: "48px 36px" }}>
        <div style={{ fontSize: "3rem", marginBottom: 14 }}>🔒</div>
        <h2 style={{ color: "#071b33", marginBottom: 10, fontSize: "1.3rem" }}>Full access required</h2>
        <p style={{ color: "#6b7c93", lineHeight: 1.7, marginBottom: 24, fontSize: ".92rem" }}>
          This lecture is part of the paid programme. Unlock full access to watch all Math and English lectures.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/lectures" style={{ padding: "10px 22px", background: "#155eef", color: "#fff", borderRadius: 10, fontWeight: 800, fontSize: ".88rem", textDecoration: "none" }}>Unlock Full Access</Link>
          <a href={WA_URL} target="_blank" rel="noreferrer" style={{ padding: "10px 22px", background: "#f8fafc", color: "#344054", border: "1.5px solid #e8eef6", borderRadius: 10, fontWeight: 700, fontSize: ".88rem", textDecoration: "none" }}>Ask on WhatsApp</a>
        </div>
      </div>
    </div></section>
  );

  if (!lecture) return null;

  const currentIndex = allLectures.findIndex(l => l.id === id);
  const sameCat = allLectures.filter(l => l.category === lecture.category);
  const prevLec = currentIndex > 0 ? allLectures[currentIndex - 1] : null;
  const nextLec = currentIndex < allLectures.length - 1 ? allLectures[currentIndex + 1] : null;

  return (
    <section className="section">
      <div className="container">
        <Link href="/lectures" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none", display: "inline-block", marginBottom: 16 }}>← All lectures</Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>

          {/* Main player + quiz */}
          <div>
            <div style={{ borderRadius: 14, overflow: "hidden", background: "#000", boxShadow: "0 8px 40px rgba(7,27,51,.18)", marginBottom: 20 }}>
              <video
                key={id}
                ref={videoRef}
                controls
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                onContextMenu={e => e.preventDefault()}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                style={{ width: "100%", display: "block", maxHeight: 520 }}
                preload="metadata"
              >
                <source src={`/api/lectures/${id}/stream`} />
                Your browser does not support the video player.
              </video>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: ".75rem", fontWeight: 800, color: "#155eef", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>
                Lecture {currentIndex + 1} of {sameCat.length} · {lecture.category === "math" ? "📐 Math" : lecture.category === "english" ? "📖 English" : "📝 Intro"}
              </div>
              <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#071b33", letterSpacing: "-.03em", margin: "0 0 10px" }}>{lecture.title}</h1>
              {lecture.description && <p style={{ color: "#6b7c93", lineHeight: 1.7, fontSize: ".92rem" }}>{lecture.description}</p>}
            </div>

            {/* Watch progress bar */}
            {!lectureCompleted && watchPct > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".78rem", color: "#6b7c93", marginBottom: 4 }}>
                  <span>Watch progress</span>
                  <span>{watchPct}% — need 80% to unlock quiz</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: "#e8eef6", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${watchPct}%`, background: watchPct >= 80 ? "#22c55e" : "#155eef", borderRadius: 999, transition: "width .3s" }} />
                </div>
              </div>
            )}

            {lectureCompleted && (
              <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: "#f0fdf4", border: "1.5px solid #86efac", display: "flex", gap: 8, alignItems: "center" }}>
                <span>✅</span>
                <span style={{ fontSize: ".88rem", color: "#15803d", fontWeight: 700 }}>Lecture completed — quiz unlocked below!</span>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              {prevLec && (
                <Link href={`/lectures/${prevLec.id}`} style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e8eef6", textDecoration: "none", display: "block", background: "#f8fafc" }}>
                  <div style={{ fontSize: ".7rem", fontWeight: 700, color: "#6b7c93", marginBottom: 3 }}>← Previous</div>
                  <div style={{ fontSize: ".85rem", fontWeight: 700, color: "#071b33" }}>{prevLec.title}</div>
                </Link>
              )}
              {nextLec && (
                <Link href={`/lectures/${nextLec.id}`} style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "1.5px solid #155eef", textDecoration: "none", display: "block", background: "#eff6ff", textAlign: "right" }}>
                  <div style={{ fontSize: ".7rem", fontWeight: 700, color: "#155eef", marginBottom: 3 }}>Next →</div>
                  <div style={{ fontSize: ".85rem", fontWeight: 700, color: "#071b33" }}>{nextLec.title}</div>
                </Link>
              )}
            </div>

            {/* Quiz — shown for all non-intro lectures */}
            {lecture.category !== "introduction" && (
              <QuizSection key={quizKey} lectureId={id} />
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #e8eef6" }}>
                <p style={{ fontWeight: 800, color: "#071b33", fontSize: ".9rem", margin: 0 }}>All Lectures</p>
              </div>
              <div style={{ maxHeight: 480, overflowY: "auto" }}>
                {allLectures.map((lec, i) => (
                  lec.is_locked ? (
                    <Link key={lec.id} href="/lectures" style={{ textDecoration: "none" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9", opacity: .55 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#f1f5f9", color: "#6b7c93", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".72rem", fontWeight: 800, flexShrink: 0 }}>🔒</div>
                        <p style={{ fontSize: ".82rem", fontWeight: 600, color: "#344054", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lec.title}</p>
                      </div>
                    </Link>
                  ) : (
                    <Link key={lec.id} href={`/lectures/${lec.id}`} style={{ textDecoration: "none" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9", background: lec.id === id ? "#eff6ff" : "transparent", transition: "background .12s" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: lec.id === id ? "#155eef" : "#f1f5f9", color: lec.id === id ? "#fff" : "#6b7c93", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".72rem", fontWeight: 800, flexShrink: 0 }}>
                          {lec.id === id ? "▶" : i + 1}
                        </div>
                        <p style={{ fontSize: ".82rem", fontWeight: lec.id === id ? 800 : 600, color: lec.id === id ? "#155eef" : "#344054", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lec.title}</p>
                      </div>
                    </Link>
                  )
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
