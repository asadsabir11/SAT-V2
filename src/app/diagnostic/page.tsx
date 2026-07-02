"use client";
import { useState, useEffect } from "react";
import { CTAButton, PageHero } from "@/components/site";

interface Question {
  id: string;
  topic: string;
  passage?: string;
  question: string;
  options: string[];
  answer: number;
}

const mathQs: Question[] = [
  {
    id: "m1",
    topic: "Linear Equations",
    question: "If 3x + 7 = 22, what is the value of 2x?",
    options: ["5", "10", "14", "15"],
    answer: 1,
  },
  {
    id: "m2",
    topic: "Systems of Equations",
    question: "Notebooks cost $3 each and pens cost $1.50 each. A student buys 10 items total and spends exactly $21. How many notebooks did the student buy?",
    options: ["3", "4", "5", "6"],
    answer: 1,
  },
  {
    id: "m3",
    topic: "Ratios & Proportions",
    question: "A car travels 240 miles using 8 gallons of fuel. At the same rate, how many miles will it travel on 5 gallons?",
    options: ["120", "140", "150", "160"],
    answer: 2,
  },
  {
    id: "m4",
    topic: "Quadratic Equations",
    question: "Which of the following is a solution to x² − 9x + 20 = 0?",
    options: ["2", "3", "4", "6"],
    answer: 2,
  },
  {
    id: "m5",
    topic: "Percentages",
    question: "60% of students in a class passed a test. If 18 students passed, how many students are in the class total?",
    options: ["24", "28", "30", "36"],
    answer: 2,
  },
];

const rwQs: Question[] = [
  {
    id: "rw1",
    topic: "Main Idea",
    passage:
      "The common belief that humans use only 10 percent of their brains has been thoroughly disproven by modern neuroscience. Brain imaging studies demonstrate that virtually all brain regions are active at various points throughout the day, and damage to nearly any area produces specific, observable changes in behavior.",
    question: "The main purpose of this passage is to:",
    options: [
      "Describe new methods in brain imaging",
      "Correct a widespread but inaccurate belief about brain function",
      "Argue that more funding is needed for neuroscience",
      "Explain how different brain regions affect behavior",
    ],
    answer: 1,
  },
  {
    id: "rw2",
    topic: "Vocabulary in Context",
    passage:
      "The common belief that humans use only 10 percent of their brains has been thoroughly disproven by modern neuroscience. Brain imaging studies demonstrate that virtually all brain regions are active at various points throughout the day, and damage to nearly any area produces specific, observable changes in behavior.",
    question: "As used in the passage, 'disproven' most nearly means:",
    options: ["Confirmed", "Revised", "Refuted", "Overlooked"],
    answer: 2,
  },
  {
    id: "rw3",
    topic: "Evidence & Support",
    passage:
      "Urban community gardens have revitalized neglected spaces across many cities. Beyond supplying fresh produce, these gardens serve as community gathering points, help reduce urban heat, and improve local air quality. A recent city survey found that residents near community gardens reported significantly higher levels of neighborhood trust.",
    question: "Which of the following best describes the evidence the author uses to support the claim that community gardens strengthen neighborhoods?",
    options: [
      "A personal story about gardening",
      "A reference to a citywide survey on neighborhood trust",
      "Statistical comparisons between urban and rural communities",
      "Historical records of urban development",
    ],
    answer: 1,
  },
  {
    id: "rw4",
    topic: "Subject-Verb Agreement",
    question: "Choose the option that correctly completes the sentence: 'The research team _____ its findings at the annual conference next month.'",
    options: ["present", "presents", "are presenting", "have presented"],
    answer: 1,
  },
  {
    id: "rw5",
    topic: "Rhetoric & Structure",
    passage:
      "First, we examined the economic data. Then, we analyzed the environmental impact. Finally, we considered the social effects of the proposed policy.",
    question: "The organizational structure of this excerpt is best described as:",
    options: [
      "Comparing two conflicting arguments",
      "Presenting a central problem and its resolution",
      "Sequentially listing a series of steps or considerations",
      "Narrating events from a historical perspective",
    ],
    answer: 2,
  },
];

function calcScore(questions: Question[], answers: Record<string, number>): number {
  const correct = questions.filter((q) => answers[q.id] === q.answer).length;
  return Math.round((correct / questions.length) * 600 + 200);
}

function getWeakAreas(questions: Question[], answers: Record<string, number>): string[] {
  return [...new Set(questions.filter((q) => answers[q.id] !== q.answer).map((q) => q.topic))];
}

function QuestionBlock({
  q,
  answers,
  setAnswers,
}: {
  q: Question;
  answers: Record<string, number>;
  setAnswers: (a: Record<string, number>) => void;
}) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      {q.passage && (
        <p
          style={{
            borderLeft: "3px solid #dce5ef",
            paddingLeft: 16,
            color: "#4a6274",
            marginBottom: 16,
            fontStyle: "italic",
            lineHeight: 1.7,
          }}
        >
          {q.passage}
        </p>
      )}
      <p style={{ fontWeight: 600, marginBottom: 12 }}>{q.question}</p>
      <div style={{ display: "grid", gap: 8 }}>
        {q.options.map((opt, i) => (
          <label
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              padding: "10px 14px",
              borderRadius: 8,
              background: answers[q.id] === i ? "#e8f0fe" : "#f8fafc",
              border: answers[q.id] === i ? "2px solid #155eef" : "2px solid transparent",
              transition: "all .15s",
            }}
          >
            <input
              type="radio"
              name={q.id}
              checked={answers[q.id] === i}
              onChange={() => setAnswers({ ...answers, [q.id]: i })}
              style={{ accentColor: "#155eef" }}
            />
            <span>
              <strong>{String.fromCharCode(65 + i)}.</strong> {opt}
            </span>
          </label>
        ))}
      </div>
      <div className="eyebrow" style={{ marginTop: 10, fontSize: 11 }}>
        Topic: {q.topic}
      </div>
    </div>
  );
}

type Step = "intro" | "math" | "rw" | "submitting" | "results";

interface Results {
  mathScore: number;
  rwScore: number;
  totalScore: number;
  weakAreas: string[];
}

export default function Diagnostic() {
  const [step, setStep] = useState<Step>("intro");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [mathAnswers, setMathAnswers] = useState<Record<string, number>>({});
  const [rwAnswers, setRwAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Results | null>(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("sat_student_email");
    const storedName = localStorage.getItem("sat_student_name");
    if (storedEmail) setEmail(storedEmail);
    if (storedName) setName(storedName);
  }, []);

  async function handleSubmit() {
    setStep("submitting");
    const mathScore = calcScore(mathQs, mathAnswers);
    const rwScore = calcScore(rwQs, rwAnswers);
    const totalScore = mathScore + rwScore;
    const weakAreas = [...getWeakAreas(mathQs, mathAnswers), ...getWeakAreas(rwQs, rwAnswers)];
    const r: Results = { mathScore, rwScore, totalScore, weakAreas };

    localStorage.setItem("sat_student_email", email);
    localStorage.setItem("sat_student_name", name);
    localStorage.setItem("sat_diagnostic_result", JSON.stringify({...r, createdAt: new Date().toISOString()}));

    try {
      await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, ...r }),
      });
    } catch {
      // show results even if save fails
    }

    setResults(r);
    setStep("results");
  }

  const mathDone = mathQs.every((q) => mathAnswers[q.id] !== undefined);
  const rwDone = rwQs.every((q) => rwAnswers[q.id] !== undefined);

  if (step === "intro") {
    return (
      <>
        <PageHero
          eyebrow="Start with evidence"
          title="Take the free diagnostic. Stop guessing what to study."
        >
          10 original practice questions — 5 Math, 5 Reading &amp; Writing. Takes about 15 minutes.
          Results are saved to your dashboard.
        </PageHero>
        <section className="section">
          <div className="container">
            <div className="card" style={{ maxWidth: 480 }}>
              <h2 style={{ color: "#071b33", marginBottom: 8 }}>Before you begin</h2>
              <p>Your score identifies your starting baseline and the exact skills to prioritize.</p>
              <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
                <div className="field">
                  <label htmlFor="diag-name">Your name *</label>
                  <input
                    id="diag-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="field">
                  <label htmlFor="diag-email">Your email *</label>
                  <input
                    id="diag-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              {nameError && <div className="note" style={{ marginTop: 12 }}>{nameError}</div>}
              <button
                className="btn btn-primary"
                style={{ marginTop: 20, width: "100%" }}
                onClick={() => {
                  if (!name.trim() || !email.trim()) {
                    setNameError("Please enter your name and email to continue.");
                    return;
                  }
                  setNameError("");
                  setStep("math");
                }}
              >
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
        <PageHero eyebrow="Section 1 of 2 — Math" title="Math questions">
          Answer all 5 questions, then click Continue.
        </PageHero>
        <section className="section">
          <div className="container" style={{ maxWidth: 740 }}>
            {mathQs.map((q) => (
              <QuestionBlock key={q.id} q={q} answers={mathAnswers} setAnswers={setMathAnswers} />
            ))}
            <button
              className="btn btn-primary"
              disabled={!mathDone}
              onClick={() => setStep("rw")}
            >
              Continue to Reading &amp; Writing →
            </button>
            {!mathDone && (
              <p style={{ color: "#6b7c93", marginTop: 10, fontSize: 14 }}>
                Please answer all questions to continue.
              </p>
            )}
          </div>
        </section>
      </>
    );
  }

  if (step === "rw") {
    return (
      <>
        <PageHero eyebrow="Section 2 of 2 — Reading & Writing" title="Reading & Writing questions">
          Answer all 5 questions, then submit to see your score.
        </PageHero>
        <section className="section">
          <div className="container" style={{ maxWidth: 740 }}>
            {rwQs.map((q) => (
              <QuestionBlock key={q.id} q={q} answers={rwAnswers} setAnswers={setRwAnswers} />
            ))}
            <button
              className="btn btn-primary"
              disabled={!rwDone}
              onClick={handleSubmit}
            >
              Submit &amp; see my results →
            </button>
            {!rwDone && (
              <p style={{ color: "#6b7c93", marginTop: 10, fontSize: 14 }}>
                Please answer all questions to submit.
              </p>
            )}
          </div>
        </section>
      </>
    );
  }

  if (step === "submitting") {
    return (
      <section className="section">
        <div className="container">
          <div className="card" style={{ maxWidth: 400 }}>
            <p>Scoring your diagnostic…</p>
          </div>
        </div>
      </section>
    );
  }

  if (step === "results" && results) {
    const { mathScore, rwScore, totalScore, weakAreas } = results;
    const level =
      totalScore >= 1200 ? "Strong" : totalScore >= 900 ? "Developing" : "Foundational";

    return (
      <>
        <PageHero
          eyebrow="Diagnostic results"
          title={`Your baseline score: ${totalScore} / 1600`}
        >
          {level} level · {weakAreas.length} area{weakAreas.length !== 1 ? "s" : ""} to prioritize
        </PageHero>
        <section className="section soft">
          <div className="container">
            <div className="grid grid-3" style={{ marginBottom: 24 }}>
              <div className="card">
                <div className="eyebrow">Math</div>
                <div className="metric">{mathScore}</div>
                <p>out of 800</p>
              </div>
              <div className="card">
                <div className="eyebrow">Reading &amp; Writing</div>
                <div className="metric">{rwScore}</div>
                <p>out of 800</p>
              </div>
              <div className="card">
                <div className="eyebrow">Total</div>
                <div className="metric">{totalScore}</div>
                <p>out of 1600</p>
              </div>
            </div>

            {weakAreas.length > 0 ? (
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="eyebrow">Priority areas to improve</div>
                <h2 style={{ color: "#071b33" }}>Focus here first</h2>
                <p>These are the topics where you lost points. Targeting them gives the highest score gain per hour of study.</p>
                <ul style={{ paddingLeft: 20, lineHeight: 2.2, marginTop: 12 }}>
                  {weakAreas.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="eyebrow">Perfect score</div>
                <h2 style={{ color: "#071b33" }}>Excellent work!</h2>
                <p>You answered all questions correctly. Continue with harder practice material to push your score further.</p>
              </div>
            )}

            <div className="card">
              <div className="eyebrow">Recommended next steps</div>
              <h2 style={{ color: "#071b33" }}>What to do now</h2>
              <p>
                Your diagnostic baseline is {totalScore}. Join the founder cohort to get weekly live
                classes, a 24/7 AI tutor, and original practice material targeting exactly your weak
                areas.
              </p>
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

  return null;
}
