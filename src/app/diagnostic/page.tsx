"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { CTAButton, PageHero } from "@/components/site";

interface Question {
  id: string;
  section: "math" | "reading_writing";
  topic: string;
  passage?: string;
  text: string;
  options: string[];
  correct: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  time_limit_minutes: number;
  questions: Question[];
}

// Hardcoded fallback — used only when no quiz is active in the database
const FALLBACK_MATH: Question[] = [
  { id: "m1", section: "math", topic: "Linear Equations", text: "If 3x + 7 = 22, what is the value of 2x?", options: ["5", "10", "14", "15"], correct: 1, explanation: "3x + 7 = 22 → 3x = 15 → x = 5 → 2x = 10." },
  { id: "m2", section: "math", topic: "Systems of Equations", text: "Notebooks cost $3 each and pens cost $1.50 each. A student buys 10 items total and spends exactly $21. How many notebooks did the student buy?", options: ["3", "4", "5", "6"], correct: 1, explanation: "Let n = notebooks: 3n + 1.5(10−n) = 21 → 1.5n = 6 → n = 4." },
  { id: "m3", section: "math", topic: "Ratios & Proportions", text: "A car travels 240 miles using 8 gallons of fuel. At the same rate, how many miles will it travel on 5 gallons?", options: ["120", "140", "150", "160"], correct: 2, explanation: "Rate = 240/8 = 30 mpg. 30 × 5 = 150 miles." },
  { id: "m4", section: "math", topic: "Quadratic Equations", text: "Which of the following is a solution to x² − 9x + 20 = 0?", options: ["2", "3", "4", "6"], correct: 2, explanation: "Factor: (x−4)(x−5) = 0 → x = 4 or x = 5. Answer: 4." },
  { id: "m5", section: "math", topic: "Percentages", text: "60% of students in a class passed a test. If 18 students passed, how many students are in the class total?", options: ["24", "28", "30", "36"], correct: 2, explanation: "0.60 × total = 18 → total = 18 / 0.60 = 30." },
];
const FALLBACK_RW: Question[] = [
  { id: "rw1", section: "reading_writing", topic: "Main Idea", passage: "The common belief that humans use only 10 percent of their brains has been thoroughly disproven by modern neuroscience. Brain imaging studies demonstrate that virtually all brain regions are active at various points throughout the day, and damage to nearly any area produces specific, observable changes in behavior.", text: "The main purpose of this passage is to:", options: ["Describe new methods in brain imaging", "Correct a widespread but inaccurate belief about brain function", "Argue that more funding is needed for neuroscience", "Explain how different brain regions affect behavior"], correct: 1, explanation: "The passage opens by calling the 10% claim 'disproven' and goes on to provide evidence against it — its purpose is to correct a misconception." },
  { id: "rw2", section: "reading_writing", topic: "Vocabulary in Context", passage: "The common belief that humans use only 10 percent of their brains has been thoroughly disproven by modern neuroscience.", text: "As used in the passage, 'disproven' most nearly means:", options: ["Confirmed", "Revised", "Refuted", "Overlooked"], correct: 2, explanation: "'Disproven' means shown to be false — the closest synonym here is 'refuted'." },
  { id: "rw3", section: "reading_writing", topic: "Evidence & Support", passage: "Urban community gardens have revitalized neglected spaces across many cities. Beyond supplying fresh produce, these gardens serve as community gathering points, help reduce urban heat, and improve local air quality. A recent city survey found that residents near community gardens reported significantly higher levels of neighborhood trust.", text: "Which best describes the evidence the author uses to support the claim that community gardens strengthen neighborhoods?", options: ["A personal story about gardening", "A reference to a citywide survey on neighborhood trust", "Statistical comparisons between urban and rural communities", "Historical records of urban development"], correct: 1, explanation: "The passage cites 'a recent city survey' showing higher neighborhood trust — that is data from a survey." },
  { id: "rw4", section: "reading_writing", topic: "Subject-Verb Agreement", text: "Choose the option that correctly completes the sentence: 'The research team _____ its findings at the annual conference next month.'", options: ["present", "presents", "are presenting", "have presented"], correct: 1, explanation: "'The research team' is a singular collective noun → 'presents' (third-person singular) is correct." },
  { id: "rw5", section: "reading_writing", topic: "Rhetoric & Structure", passage: "First, we examined the economic data. Then, we analyzed the environmental impact. Finally, we considered the social effects of the proposed policy.", text: "The organizational structure of this excerpt is best described as:", options: ["Comparing two conflicting arguments", "Presenting a central problem and its resolution", "Sequentially listing a series of steps or considerations", "Narrating events from a historical perspective"], correct: 2, explanation: "The signal words 'First', 'Then', 'Finally' indicate a sequential list of considerations." },
];

function QuestionBlock({ q, answers, setAnswers, reviewMode = false }: {
  q: Question;
  answers: Record<string, number>;
  setAnswers: (a: Record<string, number>) => void;
  reviewMode?: boolean;
}) {
  const studentAnswer = answers[q.id];
  const isCorrect = studentAnswer === q.correct;

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      {q.passage && (
        <p style={{ borderLeft: "3px solid #dce5ef", paddingLeft: 16, color: "#4a6274", marginBottom: 16, fontStyle: "italic", lineHeight: 1.7 }}>
          {q.passage}
        </p>
      )}
      <p style={{ fontWeight: 600, marginBottom: 12 }}>{q.text}</p>
      <div style={{ display: "grid", gap: 8 }}>
        {q.options.map((opt, i) => {
          let bg = "#f8fafc";
          let border = "2px solid transparent";
          let color = "#344054";

          if (reviewMode) {
            if (i === q.correct) { bg = "#d1fae5"; border = "2px solid #10b981"; color = "#065f46"; }
            else if (i === studentAnswer && studentAnswer !== q.correct) { bg = "#fee2e2"; border = "2px solid #ef4444"; color = "#991b1b"; }
          } else {
            if (answers[q.id] === i) { bg = "#e8f0fe"; border = "2px solid #155eef"; }
          }

          return (
            <label key={i} style={{ display: "flex", alignItems: "center", gap: 10, cursor: reviewMode ? "default" : "pointer", padding: "10px 14px", borderRadius: 8, background: bg, border, transition: "all .15s" }}>
              {!reviewMode && (
                <input type="radio" name={q.id} checked={answers[q.id] === i} onChange={() => setAnswers({ ...answers, [q.id]: i })} style={{ accentColor: "#155eef" }} />
              )}
              {reviewMode && (
                <span style={{ fontSize: "1rem", minWidth: 20 }}>
                  {i === q.correct ? "✓" : i === studentAnswer ? "✗" : "○"}
                </span>
              )}
              <span style={{ color, fontWeight: reviewMode && i === q.correct ? 700 : 400 }}>
                <strong>{String.fromCharCode(65 + i)}.</strong> {opt}
              </span>
            </label>
          );
        })}
      </div>
      {reviewMode && q.explanation && (
        <div style={{ marginTop: 14, padding: "12px 16px", background: "#eff6ff", borderRadius: 8, borderLeft: "4px solid #155eef" }}>
          <p style={{ margin: 0, fontSize: ".85rem", color: "#1d4ed8" }}>
            <strong>Explanation: </strong>{q.explanation}
          </p>
        </div>
      )}
      {reviewMode && !isCorrect && (
        <div className="eyebrow" style={{ marginTop: 8, fontSize: 11, color: "#dc2626" }}>Topic: {q.topic}</div>
      )}
      {!reviewMode && (
        <div className="eyebrow" style={{ marginTop: 10, fontSize: 11 }}>Topic: {q.topic}</div>
      )}
    </div>
  );
}

function CountdownTimer({ totalSeconds, onExpire }: { totalSeconds: number; onExpire: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (totalSeconds <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(interval);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpire();
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [totalSeconds, onExpire]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isLow = secondsLeft <= 60;
  const pct = totalSeconds > 0 ? secondsLeft / totalSeconds : 1;

  return (
    <div style={{
      position: "sticky", top: 12, zIndex: 10, display: "flex", alignItems: "center", gap: 12,
      background: isLow ? "#fef2f2" : "#fff", border: `2px solid ${isLow ? "#ef4444" : "#e8eef6"}`,
      borderRadius: 12, padding: "10px 18px", maxWidth: 300, marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,.06)"
    }}>
      <span style={{ fontSize: "1.3rem" }}>⏱</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: ".7rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Time remaining</div>
        <div style={{ height: 4, background: "#e8eef6", borderRadius: 99, marginBottom: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct * 100}%`, background: isLow ? "#ef4444" : "#155eef", transition: "width 1s linear, background .3s" }} />
        </div>
        <div style={{ fontWeight: 800, fontSize: "1.1rem", color: isLow ? "#dc2626" : "#071b33", fontVariantNumeric: "tabular-nums" }}>
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}

type Step = "loading" | "intro" | "math" | "rw" | "submitting" | "results" | "review";

interface Results { mathScore: number; rwScore: number; totalScore: number; weakAreas: string[]; }

export default function Diagnostic() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [mathQs, setMathQs] = useState<Question[]>([]);
  const [rwQs, setRwQs] = useState<Question[]>([]);
  const [step, setStep] = useState<Step>("loading");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [mathAnswers, setMathAnswers] = useState<Record<string, number>>({});
  const [rwAnswers, setRwAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Results | null>(null);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    const storedEmail = localStorage.getItem("sat_student_email");
    const storedName = localStorage.getItem("sat_student_name");
    if (storedEmail) setEmail(storedEmail);
    if (storedName) setName(storedName);

    fetch("/api/quiz/active")
      .then(r => r.json())
      .then(d => {
        if (d.quiz && d.quiz.questions?.length > 0) {
          setQuiz(d.quiz);
          setMathQs(d.quiz.questions.filter((q: Question) => q.section === "math"));
          setRwQs(d.quiz.questions.filter((q: Question) => q.section === "reading_writing"));
          if (d.quiz.time_limit_minutes > 0) {
            setTimeLimitSeconds(d.quiz.time_limit_minutes * 60);
          }
        } else {
          setMathQs(FALLBACK_MATH);
          setRwQs(FALLBACK_RW);
        }
        setStep("intro");
      })
      .catch(() => {
        setMathQs(FALLBACK_MATH);
        setRwQs(FALLBACK_RW);
        setStep("intro");
      });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (stepRef.current === "submitting" || stepRef.current === "results" || stepRef.current === "review") return;
    setStep("submitting");

    const allAnswers = { ...mathAnswers, ...rwAnswers };
    const allQs = [...mathQs, ...rwQs];

    let mathScore: number, rwScore: number, totalScore: number, weakAreas: string[];

    if (quiz) {
      try {
        const res = await fetch(`/api/quiz/${quiz.id}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentEmail: email, studentName: name, answers: allAnswers }),
        });
        const d = await res.json();
        mathScore = d.mathScore;
        rwScore = d.rwScore;
        totalScore = d.totalScore;
        weakAreas = d.weakAreas;
      } catch {
        const scale = (qs: Question[], ans: Record<string, number>) =>
          qs.length > 0 ? Math.round(((qs.filter(q => ans[q.id] === q.correct).length / qs.length) * 600 + 200) / 10) * 10 : 400;
        mathScore = scale(mathQs, mathAnswers);
        rwScore = scale(rwQs, rwAnswers);
        totalScore = mathScore + rwScore;
        weakAreas = allQs.filter(q => allAnswers[q.id] !== q.correct).map(q => q.topic).filter((v, i, a) => a.indexOf(v) === i);
      }
    } else {
      const scale = (qs: Question[], ans: Record<string, number>) =>
        Math.round(((qs.filter(q => ans[q.id] === q.correct).length / qs.length) * 600 + 200) / 10) * 10;
      mathScore = scale(mathQs, mathAnswers);
      rwScore = scale(rwQs, rwAnswers);
      totalScore = mathScore + rwScore;
      weakAreas = allQs.filter(q => allAnswers[q.id] !== q.correct).map(q => q.topic).filter((v, i, a) => a.indexOf(v) === i);
    }

    const r: Results = { mathScore, rwScore, totalScore, weakAreas };
    localStorage.setItem("sat_student_email", email);
    localStorage.setItem("sat_student_name", name);
    localStorage.setItem("sat_diagnostic_result", JSON.stringify({ ...r, createdAt: new Date().toISOString() }));

    fetch("/api/diagnostic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, ...r }),
    }).catch(() => {});

    setResults(r);
    setStep("results");
  }, [quiz, mathQs, rwQs, mathAnswers, rwAnswers, email, name]);

  function startQuiz() {
    if (!name.trim() || !email.trim()) { setNameError("Please enter your name and email."); return; }
    setNameError("");
    setQuizStartTime(Date.now());
    setStep("math");
  }

  const mathDone = mathQs.every(q => mathAnswers[q.id] !== undefined);
  const rwDone = rwQs.every(q => rwAnswers[q.id] !== undefined);

  const showTimer = timeLimitSeconds > 0 && quizStartTime !== null && (step === "math" || step === "rw");
  const remainingSeconds = showTimer
    ? Math.max(0, timeLimitSeconds - Math.floor((Date.now() - quizStartTime!) / 1000))
    : 0;

  if (step === "loading") {
    return <section className="section"><div className="container"><div className="card" style={{ maxWidth: 400 }}><p>Loading diagnostic…</p></div></div></section>;
  }

  if (step === "intro") {
    return (
      <>
        <PageHero eyebrow="Start with evidence" title="Take the free diagnostic. Stop guessing what to study.">
          {quiz ? `${mathQs.length + rwQs.length} questions — ${mathQs.length} Math, ${rwQs.length} Reading & Writing.` : "10 original practice questions — 5 Math, 5 Reading & Writing."}
          {quiz?.time_limit_minutes ? ` Time limit: ${quiz.time_limit_minutes} minutes.` : " Takes about 15 minutes."}
          {" Results saved to your dashboard."}
        </PageHero>
        <section className="section">
          <div className="container">
            <div className="card" style={{ maxWidth: 480 }}>
              {quiz && <div className="eyebrow" style={{ marginBottom: 8 }}>{quiz.title}</div>}
              <h2 style={{ color: "#071b33", marginBottom: 8 }}>Before you begin</h2>
              <p>Your score identifies your starting baseline and the exact skills to prioritize.</p>
              <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
                <div className="field">
                  <label htmlFor="diag-name">Your name *</label>
                  <input id="diag-name" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
                </div>
                <div className="field">
                  <label htmlFor="diag-email">Your email *</label>
                  <input id="diag-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
              </div>
              {nameError && <div className="note" style={{ marginTop: 12 }}>{nameError}</div>}
              <button className="btn btn-primary" style={{ marginTop: 20, width: "100%" }} onClick={startQuiz}>
                Start diagnostic →
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (step === "math") {
    return (
      <>
        <PageHero eyebrow={`Section 1 of 2 — Math (${mathQs.length} questions)`} title="Math questions">
          Answer all questions, then click Continue.
        </PageHero>
        <section className="section">
          <div className="container" style={{ maxWidth: 740 }}>
            {showTimer && (
              <CountdownTimer totalSeconds={remainingSeconds} onExpire={() => handleSubmit()} />
            )}
            {mathQs.map(q => <QuestionBlock key={q.id} q={q} answers={mathAnswers} setAnswers={setMathAnswers} />)}
            <button className="btn btn-primary" disabled={!mathDone} onClick={() => setStep("rw")}>
              Continue to Reading &amp; Writing →
            </button>
            {!mathDone && <p style={{ color: "#6b7c93", marginTop: 10, fontSize: 14 }}>Please answer all questions to continue.</p>}
          </div>
        </section>
      </>
    );
  }

  if (step === "rw") {
    return (
      <>
        <PageHero eyebrow={`Section 2 of 2 — Reading & Writing (${rwQs.length} questions)`} title="Reading & Writing questions">
          Answer all questions, then submit to see your score.
        </PageHero>
        <section className="section">
          <div className="container" style={{ maxWidth: 740 }}>
            {showTimer && (
              <CountdownTimer totalSeconds={remainingSeconds} onExpire={() => handleSubmit()} />
            )}
            {rwQs.map(q => <QuestionBlock key={q.id} q={q} answers={rwAnswers} setAnswers={setRwAnswers} />)}
            <button className="btn btn-primary" disabled={!rwDone} onClick={() => handleSubmit()}>
              Submit &amp; see my results →
            </button>
            {!rwDone && <p style={{ color: "#6b7c93", marginTop: 10, fontSize: 14 }}>Please answer all questions to submit.</p>}
          </div>
        </section>
      </>
    );
  }

  if (step === "submitting") {
    return <section className="section"><div className="container"><div className="card" style={{ maxWidth: 400 }}><p>Scoring your diagnostic…</p></div></div></section>;
  }

  if (step === "results" && results) {
    const { mathScore, rwScore, totalScore, weakAreas } = results;
    const level = totalScore >= 1200 ? "Strong" : totalScore >= 900 ? "Developing" : "Foundational";
    const allQs = [...mathQs, ...rwQs];
    const allAnswers = { ...mathAnswers, ...rwAnswers };
    const wrongCount = allQs.filter(q => allAnswers[q.id] !== q.correct).length;

    return (
      <>
        <PageHero eyebrow="Diagnostic results" title={`Your baseline score: ${totalScore} / 1600`}>
          {level} level · {weakAreas.length} area{weakAreas.length !== 1 ? "s" : ""} to prioritize
        </PageHero>
        <section className="section soft">
          <div className="container">
            <div className="grid grid-3" style={{ marginBottom: 24 }}>
              <div className="card"><div className="eyebrow">Math</div><div className="metric">{mathScore}</div><p>out of 800</p></div>
              <div className="card"><div className="eyebrow">Reading &amp; Writing</div><div className="metric">{rwScore}</div><p>out of 800</p></div>
              <div className="card"><div className="eyebrow">Total</div><div className="metric">{totalScore}</div><p>out of 1600</p></div>
            </div>
            {weakAreas.length > 0 ? (
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="eyebrow">Priority areas to improve</div>
                <h2 style={{ color: "#071b33" }}>Focus here first</h2>
                <p>These topics cost you the most points. Targeting them gives the highest score gain per hour of study.</p>
                <ul style={{ paddingLeft: 20, lineHeight: 2.2, marginTop: 12 }}>{weakAreas.map(a => <li key={a}>{a}</li>)}</ul>
              </div>
            ) : (
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="eyebrow">Perfect score</div>
                <h2 style={{ color: "#071b33" }}>Excellent work!</h2>
                <p>You answered all questions correctly. Continue with harder practice material.</p>
              </div>
            )}
            {wrongCount > 0 && (
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="eyebrow">Review mode</div>
                <h2 style={{ color: "#071b33" }}>See what you missed</h2>
                <p>Review the {wrongCount} question{wrongCount !== 1 ? "s" : ""} you got wrong with explanations for each.</p>
                <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setStep("review")}>
                  Review my answers →
                </button>
              </div>
            )}
            <div className="card">
              <div className="eyebrow">Recommended next steps</div>
              <h2 style={{ color: "#071b33" }}>What to do now</h2>
              <p>Your diagnostic baseline is {totalScore}. Join the founder cohort to get weekly live classes, AI tutoring, and practice targeting exactly your weak areas.</p>
              <div className="actions">
                <CTAButton href="/register">Register &amp; join cohort</CTAButton>
                <CTAButton href="/dashboard" secondary>View your dashboard</CTAButton>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (step === "review" && results) {
    const allQs = [...mathQs, ...rwQs];
    const allAnswers = { ...mathAnswers, ...rwAnswers };
    const wrongQs = allQs.filter(q => allAnswers[q.id] !== q.correct);

    return (
      <>
        <PageHero eyebrow="Review mode" title={`Reviewing ${wrongQs.length} incorrect answer${wrongQs.length !== 1 ? "s" : ""}`}>
          Green = correct answer · Red = your answer · Blue box = explanation
        </PageHero>
        <section className="section">
          <div className="container" style={{ maxWidth: 740 }}>
            {wrongQs.map(q => (
              <QuestionBlock key={q.id} q={q} answers={allAnswers} setAnswers={() => {}} reviewMode />
            ))}
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button className="btn btn-primary" onClick={() => setStep("results")}>
                ← Back to results
              </button>
              <CTAButton href="/register" secondary={false}>Register &amp; join cohort</CTAButton>
            </div>
          </div>
        </section>
      </>
    );
  }

  return null;
}
