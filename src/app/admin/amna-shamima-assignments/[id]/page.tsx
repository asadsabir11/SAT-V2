"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";

interface Assignment {
  id: string; title: string; description: string; attachment_url: string;
  due_at: string | null; max_marks: number | null; is_published: boolean;
}
interface Submission {
  id: string; student_email: string; student_name: string; file_url: string;
  is_late: boolean; marks: number | null; feedback: string | null;
  submitted_at: string; graded_at: string | null;
}

function fmtWhen(d: string) {
  return new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
}

export default function AdminAssignmentSubmissions({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const [gradingId, setGradingId] = useState<string | null>(null);
  const [marksInput, setMarksInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/amna-shamima-assignments/${id}`).then((r) => r.json()),
      fetch(`/api/admin/amna-shamima-assignments/${id}/submissions`).then((r) => r.json()),
    ]).then(([a, s]) => {
      setAssignment(a.assignment ?? null);
      setSubmissions(s.submissions ?? []);
    }).finally(() => setLoading(false));
  }, [id]);

  async function saveGrade(subId: string) {
    const marks = Number(marksInput);
    if (!marksInput.trim() || Number.isNaN(marks) || marks < 0) return;
    setSaving(true);
    await fetch(`/api/admin/amna-shamima-assignments/${id}/submissions/${subId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ marks, feedback: feedbackInput }),
    });
    setSubmissions((ss) => ss.map((s) => (s.id === subId ? { ...s, marks, feedback: feedbackInput || null, graded_at: new Date().toISOString() } : s)));
    setGradingId(null);
    setSaving(false);
  }

  if (loading) return <section className="section"><div className="container"><div className="card"><p>Loading…</p></div></div></section>;
  if (!assignment) return <section className="section"><div className="container"><div className="card"><p>Assignment not found.</p></div></div></section>;

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 820 }}>
        <Link href="/admin/amna-shamima-assignments" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Assignments</Link>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "10px 0 4px", letterSpacing: "-.03em" }}>{assignment.title}</h1>
        <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: "0 0 24px" }}>
          {submissions.length} submission{submissions.length === 1 ? "" : "s"}
          {assignment.max_marks ? ` · out of ${assignment.max_marks} marks` : ""}
        </p>

        {submissions.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📭</div>
            <p style={{ fontWeight: 700 }}>No submissions yet</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {submissions.map((s) => (
              <div key={s.id} className="card" style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                      <p style={{ fontWeight: 800, color: "#071b33", margin: 0, fontSize: ".95rem" }}>{s.student_name}</p>
                      {s.is_late && <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: ".71rem", fontWeight: 700, background: "#fee2e2", color: "#991b1b" }}>Late</span>}
                      {s.marks !== null ? (
                        <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: ".71rem", fontWeight: 700, background: "#d1fae5", color: "#065f46" }}>
                          {s.marks}{assignment.max_marks ? `/${assignment.max_marks}` : ""}
                        </span>
                      ) : (
                        <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: ".71rem", fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>Ungraded</span>
                      )}
                    </div>
                    <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: 0 }}>{s.student_email} · Submitted {fmtWhen(s.submitted_at)}</p>
                    {s.feedback && <p style={{ color: "#344054", fontSize: ".85rem", margin: "6px 0 0", fontStyle: "italic" }}>&ldquo;{s.feedback}&rdquo;</p>}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <a href={s.file_url} target="_blank" rel="noreferrer" style={{ padding: "6px 12px", borderRadius: 8, background: "#f1f5f9", border: "none", fontWeight: 700, fontSize: ".78rem", color: "#344054", textDecoration: "none" }}>
                      View file
                    </a>
                    <button
                      onClick={() => { setGradingId(gradingId === s.id ? null : s.id); setMarksInput(s.marks !== null ? String(s.marks) : ""); setFeedbackInput(s.feedback ?? ""); }}
                      style={{ padding: "6px 12px", borderRadius: 8, background: "#eff6ff", border: "none", color: "#155eef", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}
                    >
                      {s.marks !== null ? "Edit grade" : "Grade"}
                    </button>
                  </div>
                </div>

                {gradingId === s.id && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #e8eef6" }}>
                    <div className="form-grid" style={{ marginBottom: 10 }}>
                      <div className="field">
                        <label>Marks {assignment.max_marks ? `(out of ${assignment.max_marks})` : ""} *</label>
                        <input type="number" min={0} max={assignment.max_marks ?? undefined} value={marksInput} onChange={(e) => setMarksInput(e.target.value)} />
                      </div>
                      <div className="field">
                        <label>Feedback (optional)</label>
                        <input value={feedbackInput} onChange={(e) => setFeedbackInput(e.target.value)} placeholder="Good work, but…" />
                      </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => saveGrade(s.id)} disabled={saving || !marksInput.trim()} style={{ padding: "8px 18px", fontSize: ".85rem" }}>
                      {saving ? "Saving…" : "Save grade"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
