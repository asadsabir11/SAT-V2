"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";

interface Submission {
  id: string; file_url: string; is_late: boolean;
  marks: number | null; feedback: string | null; submitted_at: string;
}
interface Assignment {
  id: string; title: string; description: string; attachment_url: string;
  due_at: string | null; max_marks: number | null;
}

function fmtDue(d: string | null) {
  if (!d) return "No due date";
  return new Date(d).toLocaleString("en-GB", { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function AmnaShamimaAssignmentDetail({ id }: { id: string }) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/amna-shamima/assignments/${id}`).then(async (r) => {
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
        handleUploadUrl: "/api/amna-shamima/assignments/upload",
      }).catch((e) => { throw new Error(`Upload failed: ${e?.message ?? e}`); });
      const res = await fetch(`/api/amna-shamima/assignments/${id}/submit`, {
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

  if (loading) return <section className="section"><div className="container" style={{ maxWidth: 700 }}><div className="card" style={{ padding: 40, textAlign: "center", color: "#6b7c93" }}>Loading…</div></div></section>;
  if (notFound || !assignment) return <section className="section"><div className="container" style={{ maxWidth: 700 }}><div className="card" style={{ padding: 40, textAlign: "center", color: "#6b7c93" }}>Assignment not found.</div></div></section>;

  const graded = submission?.marks !== null && submission?.marks !== undefined;

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 700 }}>
        <Link href="/amna-shamima/portal/assignments" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none", display: "block", marginBottom: 16 }}>← All assignments</Link>

        <div className="card" style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#071b33", margin: "0 0 10px", lineHeight: 1.3 }}>{assignment.title}</h1>
          {assignment.description && <p style={{ color: "#344054", lineHeight: 1.75, margin: "0 0 14px", whiteSpace: "pre-wrap" }}>{assignment.description}</p>}
          {assignment.attachment_url && (
            <a href={assignment.attachment_url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14, padding: "6px 12px", borderRadius: 8, background: "#f1f5f9", color: "#344054", fontWeight: 700, fontSize: ".82rem", textDecoration: "none" }}>
              📎 View assignment file
            </a>
          )}
          <p style={{ color: isPastDue && !submission ? "#991b1b" : "#6b7c93", fontSize: ".85rem", fontWeight: isPastDue && !submission ? 700 : 400, margin: 0 }}>
            Due: {fmtDue(assignment.due_at)}{assignment.max_marks ? ` · ${assignment.max_marks} marks` : ""}
          </p>
        </div>

        {graded && (
          <div className="card" style={{ marginBottom: 20, background: "#f0fdf4", border: "1.5px solid #86efac" }}>
            <p style={{ fontWeight: 800, color: "#15803d", margin: "0 0 4px", fontSize: "1.1rem" }}>
              Grade: {submission!.marks}{assignment.max_marks ? `/${assignment.max_marks}` : ""}
            </p>
            {submission!.feedback && <p style={{ color: "#166534", fontSize: ".88rem", margin: 0, fontStyle: "italic" }}>&ldquo;{submission!.feedback}&rdquo;</p>}
          </div>
        )}

        <div className="card">
          <h3 style={{ margin: "0 0 14px", color: "#071b33", fontSize: "1rem" }}>Your submission</h3>

          {submission && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: submission.is_late ? "#fef2f2" : "#f0fdf4" }}>
              <span>{submission.is_late ? "⚠️" : "✅"}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: ".85rem", color: submission.is_late ? "#991b1b" : "#065f46" }}>
                  {submission.is_late ? "Turned in late" : "Turned in"}
                </p>
                <a href={submission.file_url} target="_blank" rel="noreferrer" style={{ fontSize: ".8rem", color: "#155eef", fontWeight: 700, textDecoration: "none" }}>View your file →</a>
              </div>
            </div>
          )}

          {!graded && (
            <>
              <div
                onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${file ? "#10b981" : "#c8d5e3"}`, borderRadius: 10, padding: "20px", textAlign: "center", cursor: "pointer", background: file ? "#f0fdf4" : "#f8fafc", marginBottom: 12 }}
              >
                {file
                  ? <p style={{ fontWeight: 700, color: "#065f46", margin: 0, fontSize: ".88rem" }}>📎 {file.name} · Click to change</p>
                  : <p style={{ color: "#6b7c93", margin: 0, fontSize: ".88rem" }}>📎 Click to choose a file (PDF, DOC/DOCX, JPG, PNG)</p>}
              </div>
              <input ref={fileRef} type="file" accept="application/pdf,.doc,.docx,image/*" style={{ display: "none" }} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              {isPastDue && <p style={{ color: "#92400e", fontSize: ".82rem", fontWeight: 600, marginBottom: 10 }}>⏳ This is past the due date — submitting now will be marked late.</p>}
              {error && <p style={{ color: "#dc2626", fontWeight: 600, fontSize: ".85rem", marginBottom: 10 }}>⚠ {error}</p>}
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || !file}>
                {submitting ? "Submitting…" : submission ? "Resubmit" : "Turn in"}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
