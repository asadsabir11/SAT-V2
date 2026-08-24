"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";

type Program = "sat" | "o-level";
type Section = "math" | "reading_writing" | "mathematics" | "computer-science" | "english-language" | "islamiyat" | "pakistan-studies" | "physics";

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
  { value: "physics", label: "Physics", color: "#c2410c", bg: "#fff7ed" },
];
const ALL_SECTIONS = [...SAT_SECTIONS, ...OLEVEL_SECTIONS];
const sectionMeta = (s: Section): SectionMeta => ALL_SECTIONS.find((x) => x.value === s) ?? SAT_SECTIONS[0];
const sectionsFor = (p: Program) => (p === "o-level" ? OLEVEL_SECTIONS : SAT_SECTIONS);

// ── Bulk import (CSV / Excel) ───────────────────────────────────────────────────
interface PreviewRow {
  rowNum: number;
  program: string;
  section: string;
  topic: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  passage: string;
  error?: string;
}

const SAT_SECTION_MAP: Record<string, Section> = {
  math: "math", "reading_writing": "reading_writing",
  "reading & writing": "reading_writing", "reading and writing": "reading_writing",
  "r&w": "reading_writing", rw: "reading_writing",
};
const OLEVEL_SECTION_MAP: Record<string, Section> = {
  mathematics: "mathematics", maths: "mathematics",
  "computer science": "computer-science", "computer-science": "computer-science", cs: "computer-science",
  "english language": "english-language", "english-language": "english-language", english: "english-language",
  islamiyat: "islamiyat",
  "pakistan studies": "pakistan-studies", "pakistan-studies": "pakistan-studies",
  physics: "physics",
};
const CORRECT_MAP: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };

function resolveProgram(raw: string): Program {
  const p = (raw ?? "").trim().toLowerCase();
  return p === "o-level" || p === "olevel" || p === "o level" ? "o-level" : "sat";
}
function resolveSection(program: Program, raw: string): Section | "" {
  const key = (raw ?? "").trim().toLowerCase();
  const map = program === "o-level" ? OLEVEL_SECTION_MAP : SAT_SECTION_MAP;
  return map[key] ?? "";
}

function validateRow(r: Omit<PreviewRow, "rowNum" | "error">): string {
  const program = resolveProgram(r.program);
  if (!resolveSection(program, r.section)) {
    return program === "o-level"
      ? `Invalid subject "${r.section}" for O Level — use one of: ${OLEVEL_SECTIONS.map(s => s.label).join(", ")}`
      : `Invalid section "${r.section}" — use "math" or "reading_writing"`;
  }
  if (!r.topic?.trim()) return "Topic required";
  if (!r.question?.trim()) return "Question text required";
  if (!r.option_a?.trim() || !r.option_b?.trim() || !r.option_c?.trim() || !r.option_d?.trim())
    return "All 4 options required";
  if (CORRECT_MAP[(r.correct_answer ?? "").trim().toLowerCase()] === undefined)
    return `Invalid correct_answer "${r.correct_answer}" — use A, B, C or D`;
  return "";
}

function downloadTemplate() {
  const headers = ["program", "section", "topic", "question", "option_a", "option_b", "option_c", "option_d", "correct_answer", "explanation", "passage"];
  const example = [
    "sat", "math", "Linear Equations", "What is the value of x in 2x + 4 = 10?",
    "x = 2", "x = 3", "x = 4", "x = 5", "B",
    "Subtract 4 from both sides: 2x = 6, then divide by 2: x = 3.", "",
  ];
  const example2 = [
    "sat", "reading_writing", "Main Idea", "What is the main purpose of the passage?",
    "To argue against technology", "To describe a scientific discovery",
    "To explain how ecosystems recover", "To compare two political views", "C",
    "The passage focuses on how ecosystems recover after disturbances.", "Forests recover slowly after fires…",
  ];
  const example3 = [
    "o-level", "mathematics", "Algebra", "Solve for x: 3x - 5 = 16",
    "x = 5", "x = 7", "x = 8", "x = 21", "B",
    "Add 5 to both sides: 3x = 21, then divide by 3: x = 7.", "",
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, example, example2, example3]);
  ws["!cols"] = headers.map(() => ({ wch: 28 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Questions");
  XLSX.writeFile(wb, "question_bank_template.xlsx");
}

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

  // Import state
  const [showImport, setShowImport] = useState(false);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; errors: { row: number; reason: string }[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result;
      const wb = XLSX.read(data, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });

      const parsed: PreviewRow[] = rows.map((r, i) => {
        const row: Omit<PreviewRow, "rowNum" | "error"> = {
          program:        String(r["program"] ?? r["Program"] ?? "sat"),
          section:        String(r["section"] ?? r["Section"] ?? ""),
          topic:          String(r["topic"] ?? r["Topic"] ?? ""),
          question:       String(r["question"] ?? r["Question"] ?? ""),
          option_a:       String(r["option_a"] ?? r["Option A"] ?? ""),
          option_b:       String(r["option_b"] ?? r["Option B"] ?? ""),
          option_c:       String(r["option_c"] ?? r["Option C"] ?? ""),
          option_d:       String(r["option_d"] ?? r["Option D"] ?? ""),
          correct_answer: String(r["correct_answer"] ?? r["Correct Answer"] ?? r["correct"] ?? ""),
          explanation:    String(r["explanation"] ?? r["Explanation"] ?? ""),
          passage:        String(r["passage"] ?? r["Passage"] ?? ""),
        };
        return { rowNum: i + 2, ...row, error: validateRow(row) };
      });
      setPreview(parsed);
      setImportResult(null);
    };
    reader.readAsBinaryString(file);
  }

  async function runImport() {
    const validRows = preview.filter(r => !r.error);
    if (!validRows.length) return;
    setImporting(true);
    const res = await fetch("/api/question-bank/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: validRows }),
    });
    const result = await res.json();
    setImportResult(result);
    setImporting(false);
    if (result.created > 0) {
      fetch("/api/question-bank").then(r => r.json()).then(d => setQuestions(d.questions ?? []));
    }
  }

  function resetImport() {
    setPreview([]);
    setImportResult(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const filtered = questions.filter(q =>
    (programFilter === "all" || q.program === programFilter) &&
    (!filter ||
      q.topic.toLowerCase().includes(filter.toLowerCase()) ||
      q.text.toLowerCase().includes(filter.toLowerCase()))
  );

  const satCount = questions.filter(q => q.program === "sat").length;
  const olevelCount = questions.filter(q => q.program === "o-level").length;

  const validCount = preview.filter(r => !r.error).length;
  const invalidCount = preview.filter(r => !!r.error).length;

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
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href="/admin/quiz" style={{ padding: "10px 18px", borderRadius: 10, fontWeight: 700, fontSize: ".85rem", border: "2px solid #e8eef6", background: "#fff", color: "#344054", textDecoration: "none" }}>
              ← Quiz builder
            </Link>
            <button onClick={() => { setShowImport(s => !s); setShowForm(false); }}
              style={{ padding: "10px 18px", borderRadius: 10, fontWeight: 700, fontSize: ".85rem", border: "2px solid #15803d", background: showImport ? "#dcfce7" : "#f0fdf4", color: "#15803d", cursor: "pointer" }}>
              {showImport ? "✕ Close import" : "📥 Import CSV / Excel"}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => { setShowForm(s => !s); setShowImport(false); }}
              style={{ padding: "10px 20px" }}>
              {showForm ? "Cancel" : "+ Add question"}
            </button>
          </div>
        </div>

        {/* Bulk import panel */}
        {showImport && (
          <div style={{ background: "#fff", border: "2px solid #15803d", borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 6px", color: "#071b33", fontWeight: 900 }}>Bulk import from CSV / Excel</h3>
            <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: "0 0 18px" }}>
              Download the template, fill in your questions, save as <strong>.xlsx</strong> or <strong>.csv</strong>, then upload below. Works for both SAT and O Level questions in one file.
            </p>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
              <button onClick={downloadTemplate}
                style={{ padding: "9px 18px", borderRadius: 9, border: "1.5px solid #15803d", background: "#f0fdf4", color: "#15803d", fontWeight: 700, fontSize: ".85rem", cursor: "pointer" }}>
                ⬇ Download template (.xlsx)
              </button>
              <div style={{ color: "#9ca3af", fontSize: ".85rem" }}>then</div>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} style={{ display: "none" }} />
              <button type="button" onClick={() => fileRef.current?.click()}
                style={{ padding: "9px 18px", borderRadius: 9, border: "1.5px solid #d0d5dd", background: "#fff", color: "#344054", fontWeight: 700, fontSize: ".85rem", cursor: "pointer" }}>
                📂 Choose file
              </button>
            </div>

            <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: ".8rem", color: "#344054", border: "1px solid #e8eef6" }}>
              <strong style={{ display: "block", marginBottom: 6 }}>Required columns:</strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
                {[
                  ["program", 'sat  or  o-level  (defaults to "sat" if blank)'],
                  ["section", 'SAT: "math" / "reading_writing"  ·  O Level: subject name, e.g. "mathematics"'],
                  ["topic", "e.g. Linear Equations"],
                  ["question", "The question text"],
                  ["option_a / option_b / option_c / option_d", "The 4 choices"],
                  ["correct_answer", "A, B, C or D"],
                ].map(([col, desc]) => (
                  <span key={col}><strong>{col}</strong> — {desc}</span>
                ))}
              </div>
              <div style={{ marginTop: 6, color: "#6b7c93" }}>
                Optional: <strong>explanation</strong> (shown after submit) · <strong>passage</strong> (reading passage context)
              </div>
            </div>

            {preview.length > 0 && !importResult && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 800, color: "#071b33" }}>{preview.length} rows detected</span>
                  {validCount > 0 && <span style={{ color: "#15803d", fontWeight: 700, fontSize: ".85rem" }}>✓ {validCount} valid</span>}
                  {invalidCount > 0 && <span style={{ color: "#dc2626", fontWeight: 700, fontSize: ".85rem" }}>⚠ {invalidCount} with errors</span>}
                </div>

                <div style={{ overflowX: "auto", marginBottom: 16, borderRadius: 10, border: "1px solid #e8eef6" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".8rem" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        {["Row", "Program", "Section", "Topic", "Question", "A", "B", "C", "D", "Correct", "Status"].map(h => (
                          <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 700, color: "#344054", borderBottom: "1px solid #e8eef6", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map(r => (
                        <tr key={r.rowNum} style={{ background: r.error ? "#fff8f8" : "#fff", borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "7px 10px", color: "#6b7c93" }}>{r.rowNum}</td>
                          <td style={{ padding: "7px 10px" }}>{resolveProgram(r.program) === "o-level" ? "O Level" : "SAT"}</td>
                          <td style={{ padding: "7px 10px" }}>{r.section}</td>
                          <td style={{ padding: "7px 10px", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.topic}</td>
                          <td style={{ padding: "7px 10px", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.question}</td>
                          <td style={{ padding: "7px 10px", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.option_a}</td>
                          <td style={{ padding: "7px 10px", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.option_b}</td>
                          <td style={{ padding: "7px 10px", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.option_c}</td>
                          <td style={{ padding: "7px 10px", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.option_d}</td>
                          <td style={{ padding: "7px 10px", fontWeight: 700 }}>{r.correct_answer.toUpperCase()}</td>
                          <td style={{ padding: "7px 10px", whiteSpace: "nowrap" }}>
                            {r.error
                              ? <span style={{ color: "#dc2626", fontSize: ".75rem" }}>⚠ {r.error}</span>
                              : <span style={{ color: "#15803d", fontWeight: 700 }}>✓ Ready</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <button onClick={runImport} disabled={importing || validCount === 0}
                    style={{ padding: "11px 24px", background: "#155eef", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: ".9rem", cursor: validCount === 0 ? "not-allowed" : "pointer", opacity: validCount === 0 ? .5 : 1 }}>
                    {importing ? "Importing…" : `Import ${validCount} question${validCount !== 1 ? "s" : ""}`}
                  </button>
                  <button onClick={resetImport}
                    style={{ padding: "11px 18px", border: "1.5px solid #dce5ef", borderRadius: 10, background: "#fff", fontWeight: 700, cursor: "pointer", color: "#6b7c93", fontSize: ".88rem" }}>
                    Clear
                  </button>
                  {invalidCount > 0 && (
                    <span style={{ fontSize: ".8rem", color: "#92400e", background: "#fef3c7", padding: "6px 12px", borderRadius: 8 }}>
                      {invalidCount} row{invalidCount !== 1 ? "s" : ""} will be skipped — fix them in your spreadsheet and re-upload
                    </span>
                  )}
                </div>
              </>
            )}

            {importResult && (
              <div style={{ background: importResult.created > 0 ? "#f0fdf4" : "#fff8f8", border: `1.5px solid ${importResult.created > 0 ? "#86efac" : "#fca5a5"}`, borderRadius: 12, padding: "16px 20px" }}>
                <p style={{ margin: "0 0 8px", fontWeight: 800, fontSize: "1rem", color: importResult.created > 0 ? "#15803d" : "#dc2626" }}>
                  {importResult.created > 0
                    ? `✓ ${importResult.created} question${importResult.created !== 1 ? "s" : ""} added to the bank!`
                    : "No questions were imported."}
                </p>
                {importResult.errors.length > 0 && (
                  <ul style={{ margin: "8px 0 0", padding: "0 0 0 18px", fontSize: ".82rem", color: "#991b1b" }}>
                    {importResult.errors.map(e => (
                      <li key={e.row}>Row {e.row}: {e.reason}</li>
                    ))}
                  </ul>
                )}
                <button onClick={() => { resetImport(); setShowImport(false); }}
                  style={{ marginTop: 14, padding: "8px 18px", border: "none", borderRadius: 9, background: "#15803d", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: ".85rem" }}>
                  Done
                </button>
              </div>
            )}
          </div>
        )}

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
