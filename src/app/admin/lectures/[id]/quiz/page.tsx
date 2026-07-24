"use client";
import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";

interface Question {
  id: string;
  question: string;
  options: [string, string, string, string];
  answer: "A" | "B" | "C" | "D";
}

function emptyQuestion(index: number): Question {
  return {
    id: `q${index + 1}`,
    question: "",
    options: ["", "", "", ""],
    answer: "A",
  };
}

const LETTERS = ["A", "B", "C", "D"] as const;

export default function AdminLectureQuiz({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [questions, setQuestions] = useState<Question[]>(
    Array.from({ length: 5 }, (_, i) => emptyQuestion(i))
  );
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState("");

  const load = useCallback(async () => {
    const r = await fetch(`/api/admin/lectures/${id}/quiz`);
    const d = await r.json();
    if (d.questions?.length > 0) {
      // Pad to 5 if fewer
      const loaded = d.questions as Question[];
      while (loaded.length < 5) loaded.push(emptyQuestion(loaded.length));
      setQuestions(loaded);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  function updateQuestion(qi: number, field: "question" | "answer", value: string) {
    setQuestions(qs => qs.map((q, i) => i === qi ? { ...q, [field]: value } : q));
    setSaved(false);
  }

  function updateOption(qi: number, oi: number, value: string) {
    setQuestions(qs => qs.map((q, i) => {
      if (i !== qi) return q;
      const opts = [...q.options] as [string, string, string, string];
      opts[oi] = value;
      return { ...q, options: opts };
    }));
    setSaved(false);
  }

  function addQuestion() {
    setQuestions(qs => [...qs, emptyQuestion(qs.length)]);
    setSaved(false);
  }

  function removeQuestion(qi: number) {
    setQuestions(qs => qs.filter((_, i) => i !== qi).map((q, i) => ({ ...q, id: `q${i + 1}` })));
    setSaved(false);
  }

  async function save() {
    setError("");
    // Validate
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) { setError(`Question ${i + 1} is missing the question text.`); return; }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) { setError(`Question ${i + 1} option ${LETTERS[j]} is empty.`); return; }
      }
    }
    setSaving(true);
    try {
      const r = await fetch(`/api/admin/lectures/${id}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });
      if (!r.ok) { const d = await r.json(); setError(d.error ?? "Save failed"); return; }
      setSaved(true);
    } catch {
      setError("Network error — try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div style={{ padding: 40 }}><p>Loading quiz…</p></div>
  );

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 20px" }}>
      <Link href="/admin/lectures" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none", display: "inline-block", marginBottom: 20 }}>
        ← Back to lectures
      </Link>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 900, color: "#071b33", margin: "0 0 4px" }}>Quiz Editor</h1>
          <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>Students unlock this quiz after watching 80% of the lecture.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={async () => {
              if (!confirm("Delete this quiz? Students will see 'Quiz coming soon' until you create a new one.")) return;
              setDeleting(true);
              setError("");
              try {
                const r = await fetch(`/api/admin/lectures/${id}/quiz`, { method: "DELETE" });
                if (!r.ok) {
                  const d = await r.json().catch(() => ({}));
                  setError(d.error ?? `Delete failed (${r.status})`);
                  return;
                }
                // Reload from DB to confirm deletion
                const check = await fetch(`/api/admin/lectures/${id}/quiz`);
                const checkData = await check.json();
                if (checkData.questions?.length > 0) {
                  setError("Delete failed — quiz still exists in database. Try again.");
                  return;
                }
                setQuestions(Array.from({ length: 5 }, (_, i) => emptyQuestion(i)));
                setSaved(false);
              } catch {
                setError("Network error during delete — try again.");
              } finally {
                setDeleting(false);
              }
            }}
            disabled={deleting}
            style={{ padding: "11px 20px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 10, fontWeight: 700, fontSize: ".88rem", cursor: "pointer" }}
          >
            {deleting ? "Deleting…" : "Delete Quiz"}
          </button>
          <button
            onClick={save}
            disabled={saving}
            style={{ padding: "11px 28px", background: saved ? "#22c55e" : "#155eef", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: ".92rem", cursor: "pointer" }}
          >
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save Quiz"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 10, color: "#dc2626", fontSize: ".88rem", fontWeight: 600, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {questions.map((q, qi) => (
          <div key={q.id} style={{ background: "#fff", border: "1.5px solid #e8eef6", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontWeight: 800, color: "#071b33", fontSize: ".95rem" }}>Question {qi + 1}</span>
              {questions.length > 1 && (
                <button onClick={() => removeQuestion(qi)} style={{ padding: "4px 10px", background: "#fef2f2", color: "#dc2626", border: "1.5px solid #fca5a5", borderRadius: 6, fontSize: ".75rem", fontWeight: 700, cursor: "pointer" }}>
                  Remove
                </button>
              )}
            </div>

            {/* Question text */}
            <textarea
              value={q.question}
              onChange={e => updateQuestion(qi, "question", e.target.value)}
              placeholder="Type the question here…"
              rows={2}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e8eef6", fontSize: ".9rem", fontFamily: "inherit", resize: "vertical", marginBottom: 14, boxSizing: "border-box", outline: "none" }}
            />

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {LETTERS.map((letter, oi) => (
                <div key={letter} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", background: q.answer === letter ? "#155eef" : "#f1f5f9", color: q.answer === letter ? "#fff" : "#6b7c93", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: ".78rem", flexShrink: 0 }}>
                    {letter}
                  </span>
                  <input
                    type="text"
                    value={q.options[oi]}
                    onChange={e => updateOption(qi, oi, e.target.value)}
                    placeholder={`Option ${letter}`}
                    style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${q.answer === letter ? "#155eef" : "#e8eef6"}`, fontSize: ".88rem", fontFamily: "inherit", outline: "none", background: q.answer === letter ? "#eff6ff" : "#fff" }}
                  />
                </div>
              ))}
            </div>

            {/* Correct answer selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: ".82rem", fontWeight: 700, color: "#6b7c93" }}>Correct answer:</span>
              {LETTERS.map(letter => (
                <button
                  key={letter}
                  onClick={() => updateQuestion(qi, "answer", letter)}
                  style={{ padding: "6px 16px", borderRadius: 8, border: `1.5px solid ${q.answer === letter ? "#155eef" : "#e8eef6"}`, background: q.answer === letter ? "#155eef" : "#f8fafc", color: q.answer === letter ? "#fff" : "#344054", fontWeight: 800, fontSize: ".85rem", cursor: "pointer" }}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addQuestion}
        style={{ marginTop: 16, width: "100%", padding: "12px", background: "#f8fafc", color: "#344054", border: "1.5px dashed #d1d5db", borderRadius: 12, fontWeight: 700, fontSize: ".9rem", cursor: "pointer" }}
      >
        + Add another question
      </button>

      {questions.length > 0 && (
        <button
          onClick={save}
          disabled={saving}
          style={{ marginTop: 12, width: "100%", padding: "13px", background: saved ? "#22c55e" : "#155eef", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, fontSize: ".95rem", cursor: "pointer" }}
        >
          {saving ? "Saving…" : saved ? "✓ Quiz Saved" : "Save Quiz"}
        </button>
      )}
    </div>
  );
}
