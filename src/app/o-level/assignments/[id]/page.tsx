"use client";
import { useEffect, useRef, useState, use } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";

type Category = "mathematics" | "computer-science" | "english-language" | "islamiyat" | "pakistan-studies" | "physics";
const SUBJECT_LABEL: Record<Category, string> = {
  mathematics: "Mathematics", "computer-science": "Computer Science", "english-language": "English Language",
  islamiyat: "Islamiyat", "pakistan-studies": "Pakistan Studies", physics: "Physics",
};

interface Submission {
  id: string; file_url: string; is_late: boolean;
  marks: number | null; feedback: string | null; submitted_at: string;
}
interface Assignment {
  id: string; title: string; description: string; attachment_url: string; category: Category;
  due_at: string | null; max_marks: number | null;
}

function fmtDue(d: string | null) {
  if (!d) return "No due date";
  return new Date(d).toLocaleString("en-GB", { weekday: "long", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
}

function dueCountdown(dueAt: string | null): { text: string; color: string; bg: string } | null {
  if (!dueAt) return null;
  const diffMs = new Date(dueAt).getTime() - Date.now();
  if (diffMs < 0) {
    const days = Math.floor(Math.abs(diffMs) / 86400000);
    return { text: days >= 1 ? `Overdue by ${days}d` : "Overdue", color: "#991b1b", bg: "#fee2e2" };
  }
  const minutes = diffMs / 60000;
  if (minutes < 60) return { text: `Due in ${Math.max(1, Math.round(minutes))}m`, color: "#991b1b", bg: "#fee2e2" };
  const hours = diffMs / 3600000;
  if (hours < 24) return { text: `Due in ${Math.ceil(hours)}h`, color: "#92400e", bg: "#fef3c7" };
  const days = Math.ceil(hours / 24);
  return { text: `Due in ${days}d`, color: "#155eef", bg: "#eff6ff" };
}

export default function OLevelAssignmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [unsubmitting, setUnsubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/o-level/assignments/${id}`).then(async (r) => {
      if (!r.ok) { setNotFound(true); return; }
      const d = await r.json();
      setAssignment(d.assignment);
      setSubmission(d.my_submission);
    }).finally(() => setLoading(false));
  }, [id]);

  const isPastDue = assignment?.due_at ? Date.now() > new Date(assignment.due_at).getTime() : false;

  async function handleSubmit() {
    if (!file) return;
    setSubmitting(true);
    setError("");
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/o-level/assignments/upload",
      }).catch((e) => { throw new Error(`Upload failed: ${e?.message ?? e}`); });
      const res = await fetch(`/api/o-level/assignments/${id}/submit`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ file_url: blob.url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed.");
      setSubmission({ id: "temp", file_url: blob.url, is_late: data.is_late, marks: null, feedback: null, submitted_at: new Date().toISOString() });
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUnsubmit() {
    if (!confirm("Unsubmit this assignment? You'll need to turn it in again.")) return;
    setUnsubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/o-level/assignments/${id}/submit`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't unsubmit.");
      setSubmission(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUnsubmitting(false);
    }
  }

  if (loading) return <section className="section"><div className="container" style={{ maxWidth: 700 }}><div className="card" style={{ padding: 40, textAlign: "center", color: "#6b7c93" }}>Loading…</div></div></section>;
  if (notFound || !assignment) return <section className="section"><div className="container" style={{ maxWidth: 700 }}><div className="card" style={{ padding: 40, textAlign: "center", color: "#6b7c93" }}>Assignment not found.</div></div></section>;

  const graded = submission?.marks !== null && submission?.marks !== undefined;
  const pct = graded && assignment.max_marks ? Math.round((submission!.marks! / assignment.max_marks) * 100) : null;
  const countdown = !submission ? dueCountdown(assignment.due_at) : null;

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 700 }}>
        <Link href="/o-level/assignments" style={{ color: "#6b7c93", fontSize: ".85rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 20, fontWeight: 600 }}>
          ← All assignments
        </Link>

        {/* Header */}
        <div className="card" style={{ marginBottom: 20, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "linear-gradient(135deg,#dc2626,#f87171)", opacity: 0.08 }} />
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: "linear-gradient(135deg,#dc2626,#f87171)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", boxShadow: "0 8px 22px rgba(220,38,38,.35)" }}>
              📋
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "#dc2626", fontWeight: 800, fontSize: ".78rem", textTransform: "uppercase", letterSpacing: ".05em", margin: "2px 0 4px" }}>{SUBJECT_LABEL[assignment.category]}</p>
              <h1 style={{ fontSize: "1.35rem", fontWeight: 900, color: "#071b33", margin: "0 0 8px", lineHeight: 1.3 }}>{assignment.title}</h1>
              {assignment.description && <p style={{ color: "#344054", lineHeight: 1.75, margin: "0 0 14px", whiteSpace: "pre-wrap" }}>{assignment.description}</p>}

              <div style={{ display: "grid", gridTemplateColumns: assignment.max_marks ? "1fr 1fr" : "1fr", gap: 10, marginBottom: assignment.attachment_url ? 14 : 0 }}>
                <div style={{ padding: "12px 14px", borderRadius: 12, background: countdown ? countdown.bg : "#f1f5f9", border: `1.5px solid ${countdown ? countdown.color : "#e2e8f0"}22` }}>
                  <p style={{ margin: "0 0 3px", fontSize: ".7rem", fontWeight: 800, color: countdown ? countdown.color : "#64748b", textTransform: "uppercase", letterSpacing: ".05em" }}>🗓️ Deadline</p>
                  <p style={{ margin: 0, fontSize: "1rem", fontWeight: 900, color: "#071b33", lineHeight: 1.3 }}>{fmtDue(assignment.due_at)}</p>
                  {countdown && <p style={{ margin: "3px 0 0", fontSize: ".82rem", fontWeight: 800, color: countdown.color }}>{countdown.text}</p>}
                </div>
                {assignment.max_marks && (
                  <div style={{ padding: "12px 14px", borderRadius: 12, background: "#eff6ff", border: "1.5px solid #bfdbfe" }}>
                    <p style={{ margin: "0 0 3px", fontSize: ".7rem", fontWeight: 800, color: "#155eef", textTransform: "uppercase", letterSpacing: ".05em" }}>⭐ Marks</p>
                    <p style={{ margin: 0, fontSize: "1.6rem", fontWeight: 900, color: "#071b33", lineHeight: 1.1 }}>{assignment.max_marks}</p>
                  </div>
                )}
              </div>

              {assignment.attachment_url && (
                <a href={assignment.attachment_url} target="_blank" rel="noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: 10,
                  background: "linear-gradient(135deg,#dc2626,#f87171)", color: "#fff", fontWeight: 800, fontSize: ".88rem",
                  textDecoration: "none", boxShadow: "0 4px 14px rgba(220,38,38,.35)", transition: "transform .15s, box-shadow .15s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(220,38,38,.5)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 14px rgba(220,38,38,.35)"; }}>
                  📎 View Assignment File
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Grade */}
        {graded && (
          <div className="card" style={{ marginBottom: 20, background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)", border: "1.5px solid #86efac", textAlign: "center", padding: "28px 24px" }}>
            <div style={{ fontSize: "2.2rem", marginBottom: 6 }}>{pct !== null && pct >= 80 ? "🎉" : pct !== null && pct >= 50 ? "👍" : "✅"}</div>
            <p style={{ fontWeight: 900, color: "#15803d", margin: "0 0 4px", fontSize: "1.8rem", letterSpacing: "-.02em" }}>
              {submission!.marks}{assignment.max_marks ? <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#4ade80" }}>{` / ${assignment.max_marks}`}</span> : null}
            </p>
            <p style={{ color: "#166534", fontSize: ".82rem", fontWeight: 700, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: ".06em" }}>Your grade</p>
            {pct !== null && (
              <div style={{ maxWidth: 260, margin: "0 auto 14px", height: 10, borderRadius: 999, background: "#dcfce7", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#22c55e,#16a34a)", borderRadius: 999, transition: "width .4s" }} />
              </div>
            )}
            {submission!.feedback && (
              <p style={{ color: "#166534", fontSize: ".92rem", margin: "0 auto", maxWidth: 460, fontStyle: "italic", lineHeight: 1.6 }}>&ldquo;{submission!.feedback}&rdquo;</p>
            )}
          </div>
        )}

        {/* Submission */}
        <div className="card">
          <h3 style={{ margin: "0 0 16px", color: "#071b33", fontSize: "1.05rem", fontWeight: 800 }}>Your submission</h3>

          {submission && (
            <div style={{
              marginBottom: graded ? 0 : 18, padding: "14px 16px", borderRadius: 12,
              background: submission.is_late ? "#fef2f2" : "#f0fdf4", border: `1.5px solid ${submission.is_late ? "#fecaca" : "#86efac"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", background: submission.is_late ? "#fee2e2" : "#dcfce7" }}>
                  {submission.is_late ? "⚠️" : "✅"}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: ".92rem", color: submission.is_late ? "#991b1b" : "#065f46" }}>
                    {submission.is_late ? "Turned in late" : "Turned in"}
                  </p>
                  <a href={submission.file_url} target="_blank" rel="noreferrer" style={{ fontSize: ".82rem", color: "#155eef", fontWeight: 700, textDecoration: "none" }}>View your file →</a>
                </div>
                {!graded && (
                  <button onClick={handleUnsubmit} disabled={unsubmitting} style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 8, background: "#fff", border: "1.5px solid #d0d7e3", color: "#6b7c93", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>
                    {unsubmitting ? "…" : "Unsubmit"}
                  </button>
                )}
              </div>
              {!graded && error && <p style={{ color: "#dc2626", fontWeight: 600, fontSize: ".82rem", margin: "10px 0 0" }}>⚠ {error}</p>}
            </div>
          )}

          {!submission && !graded && (
            <>
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${file ? "#10b981" : "#c8d5e3"}`, borderRadius: 14, padding: "28px 20px", textAlign: "center",
                  cursor: "pointer", background: file ? "#f0fdf4" : "#f8fafc", marginBottom: 14, transition: "border-color .15s, background .15s",
                }}
                onMouseEnter={(e) => { if (!file) e.currentTarget.style.borderColor = "#94a3b8"; }}
                onMouseLeave={(e) => { if (!file) e.currentTarget.style.borderColor = "#c8d5e3"; }}
              >
                {file ? (
                  <>
                    <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>📎</div>
                    <p style={{ fontWeight: 700, color: "#065f46", margin: 0, fontSize: ".92rem" }}>{file.name}</p>
                    <p style={{ color: "#6b7c93", fontSize: ".78rem", margin: "4px 0 0" }}>Click to change</p>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>📁</div>
                    <p style={{ fontWeight: 700, color: "#344054", margin: 0, fontSize: ".92rem" }}>Click to choose a file</p>
                    <p style={{ color: "#6b7c93", fontSize: ".78rem", margin: "4px 0 0" }}>PDF, Word doc, JPG or PNG</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="application/pdf,.doc,.docx,image/*" style={{ display: "none" }} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              {isPastDue && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "#fffbeb", marginBottom: 14 }}>
                  <span>⏳</span>
                  <p style={{ color: "#92400e", fontSize: ".82rem", fontWeight: 600, margin: 0 }}>This is past the due date — submitting now will be marked late, but it&apos;s still accepted.</p>
                </div>
              )}
              {error && <p style={{ color: "#dc2626", fontWeight: 600, fontSize: ".85rem", marginBottom: 14 }}>⚠ {error}</p>}
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || !file} style={{ width: "100%", padding: "13px" }}>
                {submitting ? "Submitting…" : "Turn in"}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
