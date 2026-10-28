"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getOLevelSubjects } from "@/lib/academy/data";

interface BookCodeRow {
  id: string;
  code: string;
  program: string;
  subject: string | null;
  batch_label: string | null;
  status: "unused" | "used";
  redeemed_by_email: string | null;
  redeemed_by_name: string | null;
  redeemed_at: string | null;
  created_by: string | null;
  created_at: string;
}

const PROGRAM_LABELS: Record<string, string> = { "o-level": "O Level", "punjab-9th": "9th Class", "a-level": "A Level" };
const OLEVEL_SUBJECTS = getOLevelSubjects().map((s) => ({ slug: s.slug, name: s.name }));
const ALEVEL_SUBJECTS = [
  { slug: "computer-science-vol1", name: "Computer Science (CS 9618 Vol 1)" },
  { slug: "computer-science-vol2", name: "Computer Science (CS 9618 Vol 2)" },
];

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

export default function AdminBookCodes() {
  const [rows, setRows] = useState<BookCodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unused" | "used">("all");

  const [program, setProgram] = useState<"o-level" | "punjab-9th" | "a-level">("o-level");
  const [subject, setSubject] = useState(OLEVEL_SUBJECTS[0]?.slug ?? "computer-science");
  const [aLevelSubject, setALevelSubject] = useState(ALEVEL_SUBJECTS[0].slug);
  const [count, setCount] = useState(100);
  const [batchLabel, setBatchLabel] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[] | null>(null);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/admin/book-codes").then((r) => r.json()).then((d) => setRows(d.codes ?? [])).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleGenerate(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!batchLabel.trim()) { setError("Batch label is required (e.g. \"Print Run 1 — Oct 2026\")."); return; }
    setError("");
    setGenerating(true);
    setGeneratedCodes(null);
    try {
      const res = await fetch("/api/admin/book-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program, subject: program === "o-level" ? subject : program === "a-level" ? aLevelSubject : null, count, batchLabel: batchLabel.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to generate codes."); return; }
      setGeneratedCodes(data.codes);
      load();
    } catch {
      setError("Failed to generate codes.");
    } finally {
      setGenerating(false);
    }
  }

  function downloadCsv() {
    if (!generatedCodes) return;
    const csv = "code\n" + generatedCodes.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${batchLabel.trim().replace(/[^a-z0-9]+/gi, "-") || "book-codes"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = rows.filter((r) => filter === "all" || r.status === filter);
  const unusedCount = rows.filter((r) => r.status === "unused").length;
  const usedCount = rows.filter((r) => r.status === "used").length;

  return (
    <section className="section">
      <div className="container">
        <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
        <h1 className="title" style={{ marginTop: 8 }}>Book Redemption Codes</h1>
        <p style={{ color: "var(--muted)", marginBottom: 28 }}>
          Generate unique one-time codes for printed notes. Each code unlocks full subject access (lectures, quizzes, past papers, assignments) for whichever student redeems it at <code>/redeem</code>.
        </p>

        <article className="card" style={{ padding: "22px 24px", marginBottom: 28 }}>
          <h3 style={{ margin: "0 0 16px", color: "#071b33" }}>Generate a new batch</h3>
          <form onSubmit={handleGenerate} style={{ display: "grid", gap: 14, maxWidth: 480 }}>
            <div>
              <label style={{ display: "block", fontWeight: 700, fontSize: ".85rem", marginBottom: 6 }}>Program</label>
              <select value={program} onChange={(e) => setProgram(e.target.value as typeof program)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd7e5" }}>
                <option value="o-level">O Level</option>
                <option value="punjab-9th">9th Class</option>
                <option value="a-level">A Level</option>
              </select>
            </div>
            {program === "o-level" && (
              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: ".85rem", marginBottom: 6 }}>Subject</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd7e5" }}>
                  {OLEVEL_SUBJECTS.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                </select>
              </div>
            )}
            {program === "a-level" && (
              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: ".85rem", marginBottom: 6 }}>Subject</label>
                <select value={aLevelSubject} onChange={(e) => setALevelSubject(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd7e5" }}>
                  {ALEVEL_SUBJECTS.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label style={{ display: "block", fontWeight: 700, fontSize: ".85rem", marginBottom: 6 }}>How many codes</label>
              <input type="number" min={1} max={2000} value={count} onChange={(e) => setCount(Number(e.target.value))} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd7e5" }} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 700, fontSize: ".85rem", marginBottom: 6 }}>Batch label</label>
              <input type="text" value={batchLabel} onChange={(e) => setBatchLabel(e.target.value)} placeholder="Print Run 1 — Oct 2026" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd7e5" }} />
            </div>
            {error && <p style={{ color: "#dc2626", fontWeight: 700, fontSize: ".85rem" }}>{error}</p>}
            <button type="submit" disabled={generating} className="btn btn-primary" style={{ justifySelf: "start" }}>
              {generating ? "Generating…" : "Generate codes →"}
            </button>
          </form>

          {generatedCodes && (
            <div style={{ marginTop: 20, padding: 16, borderRadius: 10, background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
              <p style={{ fontWeight: 800, color: "#15803d", marginBottom: 8 }}>{generatedCodes.length} codes generated ✓</p>
              <button onClick={downloadCsv} className="btn" style={{ border: "2px solid #15803d", background: "#fff", color: "#15803d" }}>Download CSV →</button>
            </div>
          )}
        </article>

        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <button onClick={() => setFilter("all")} className="btn" style={{ border: filter === "all" ? "2px solid var(--blue)" : "1.5px solid #cbd7e5", background: filter === "all" ? "#eaf1ff" : "#fff" }}>All ({rows.length})</button>
          <button onClick={() => setFilter("unused")} className="btn" style={{ border: filter === "unused" ? "2px solid #15803d" : "1.5px solid #cbd7e5", background: filter === "unused" ? "#f0fdf4" : "#fff" }}>Unused ({unusedCount})</button>
          <button onClick={() => setFilter("used")} className="btn" style={{ border: filter === "used" ? "2px solid #b45309" : "1.5px solid #cbd7e5", background: filter === "used" ? "#fef3c7" : "#fff" }}>Used ({usedCount})</button>
        </div>

        {loading ? (
          <p style={{ color: "var(--muted)" }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No codes yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Program</th>
                  <th>Subject</th>
                  <th>Batch</th>
                  <th>Status</th>
                  <th>Redeemed by</th>
                  <th>Redeemed at</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 800, fontFamily: "monospace" }}>{r.code}</td>
                    <td>{PROGRAM_LABELS[r.program] ?? r.program}</td>
                    <td>{r.subject ?? "—"}</td>
                    <td>{r.batch_label ?? "—"}</td>
                    <td>
                      <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: ".78rem", fontWeight: 700, background: r.status === "used" ? "#fef3c7" : "#f0fdf4", color: r.status === "used" ? "#92400e" : "#15803d" }}>
                        {r.status === "used" ? "Used" : "Unused"}
                      </span>
                    </td>
                    <td>{r.redeemed_by_email ?? "—"}</td>
                    <td>{fmtDate(r.redeemed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
