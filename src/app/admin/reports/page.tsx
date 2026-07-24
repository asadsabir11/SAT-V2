"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Student { id: string; name: string; email: string; }
interface Report  { id: string; student_id: string; student_name: string; week_no: number; period_start: string; period_end: string; metrics_json: Record<string,unknown>; coach_note: string; parent_action: string; narrative: string | null; status: string; sent_at: string | null; }

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  draft:    { label: "Draft",    bg: "#f3f4f6", color: "#6b7c93" },
  approved: { label: "Approved", bg: "#fef3c7", color: "#92400e" },
  sent:     { label: "Sent ✓",   bg: "#d1fae5", color: "#065f46" },
};

function fmtDate(d: string | null) { return d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"; }

export default function AdminReports() {
  const [reports, setReports]   = useState<Report[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState<Report | null>(null);
  const [sending, setSending]   = useState<string | null>(null);
  const [waLink, setWaLink]     = useState("");
  const [genForm, setGenForm]   = useState({ studentId: "", weekNo: "", periodStart: "", periodEnd: "" });
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [genNarrative, setGenNarrative] = useState<string | null>(null);
  const [genNarrativeId, setGenNarrativeId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const d = await fetch("/api/admin/reports").then(r => r.json());
    setReports(d.reports ?? []);
    setStudents(d.students ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function generate() {
    const { studentId, weekNo, periodStart, periodEnd } = genForm;
    if (!studentId || !weekNo || !periodStart || !periodEnd) { setGenError("All fields required."); return; }
    setGenerating(true); setGenError("");
    const r = await fetch("/api/admin/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate", studentId, weekNo: Number(weekNo), periodStart, periodEnd }),
    });
    const d = await r.json();
    if (!r.ok) { setGenError(d.error ?? "Failed"); setGenerating(false); return; }
    await load();
    setGenerating(false);
    setGenForm({ studentId: "", weekNo: "", periodStart: "", periodEnd: "" });
  }

  async function saveEdit() {
    if (!editing) return;
    setSending(editing.id);
    await fetch("/api/admin/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id: editing.id, coachNote: editing.coach_note, parentAction: editing.parent_action }),
    });
    await load();
    setEditing(null);
    setSending(null);
  }

  async function generateNarrative(id: string) {
    setGenNarrativeId(id);
    const r = await fetch("/api/admin/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate_narrative", id }),
    });
    const d = await r.json();
    if (d.narrative) { setGenNarrative(d.narrative); await load(); }
    setGenNarrativeId(null);
  }

  async function sendReport(id: string) {
    setSending(id); setWaLink("");
    const r = await fetch("/api/admin/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", id }),
    });
    const d = await r.json();
    if (d.waLink) setWaLink(d.waLink);
    await load();
    setSending(null);
  }

  return (
    <section className="section"><div className="container">
      <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "8px 0 4px" }}>Parent Reports</h1>
      <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: "0 0 28px" }}>Generate weekly reports, add coach notes, approve, and send via email + WhatsApp.</p>

      {/* Generate form */}
      <div className="card" style={{ marginBottom: 28, border: "2px solid #e8eef6" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: ".95rem", color: "#071b33" }}>Generate new report</h3>
        <div className="form-grid" style={{ marginBottom: 14 }}>
          <div className="field">
            <label>Student *</label>
            <select value={genForm.studentId} onChange={e => setGenForm(f => ({ ...f, studentId: e.target.value }))}>
              <option value="">— Select student —</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Week number *</label>
            <input type="number" min={1} max={52} value={genForm.weekNo} onChange={e => setGenForm(f => ({ ...f, weekNo: e.target.value }))} placeholder="e.g. 4" />
          </div>
          <div className="field">
            <label>Period start *</label>
            <input type="date" value={genForm.periodStart} onChange={e => setGenForm(f => ({ ...f, periodStart: e.target.value }))} />
          </div>
          <div className="field">
            <label>Period end *</label>
            <input type="date" value={genForm.periodEnd} onChange={e => setGenForm(f => ({ ...f, periodEnd: e.target.value }))} />
          </div>
        </div>
        {genError && <p style={{ color: "#dc2626", fontWeight: 600, fontSize: ".85rem", marginBottom: 10 }}>⚠ {genError}</p>}
        <button className="btn btn-primary" onClick={generate} disabled={generating} style={{ padding: "10px 24px" }}>
          {generating ? "Generating…" : "Generate report →"}
        </button>
      </div>

      {/* AI narrative preview */}
      {genNarrative && (
        <div style={{ marginBottom: 20, padding: "16px 20px", borderRadius: 12, background: "#f5f3ff", border: "1.5px solid #c4b5fd" }}>
          <div style={{ fontSize: ".72rem", fontWeight: 800, color: "#7c3aed", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>✨ AI-generated narrative</div>
          <p style={{ margin: "0 0 12px", color: "#4c1d95", lineHeight: 1.7, fontStyle: "italic" }}>"{genNarrative}"</p>
          <button onClick={() => setGenNarrative(null)} style={{ background: "none", border: "none", color: "#7c3aed", fontSize: ".78rem", fontWeight: 700, cursor: "pointer" }}>✕ Dismiss</button>
        </div>
      )}

      {/* WhatsApp link */}
      {waLink && (
        <div style={{ marginBottom: 20, padding: "14px 18px", borderRadius: 12, background: "#f0fdf4", border: "1.5px solid #86efac" }}>
          <p style={{ color: "#15803d", fontWeight: 800, margin: "0 0 8px" }}>✓ Email sent! Send WhatsApp too:</p>
          <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-teal" style={{ display: "inline-flex", padding: "8px 18px", fontSize: ".85rem" }}>
            Open WhatsApp →
          </a>
        </div>
      )}

      {/* Reports list */}
      {loading ? <p>Loading…</p> : reports.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>
          <div style={{ fontSize: "2rem", marginBottom: 10 }}>📋</div>
          <p style={{ fontWeight: 700 }}>No reports yet</p>
          <p style={{ fontSize: ".88rem" }}>Generate the first one above.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reports.map(rpt => (
            <div key={rpt.id} className="card" style={{ padding: "16px 20px" }}>
              {editing?.id === rpt.id ? (
                /* Edit mode */
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ fontWeight: 800, color: "#071b33" }}>{rpt.student_name} · Week {rpt.week_no}</span>
                    <button onClick={() => setEditing(null)} style={{ background: "none", border: "none", color: "#6b7c93", cursor: "pointer", fontWeight: 700 }}>✕ Cancel</button>
                  </div>
                  <div className="field" style={{ marginBottom: 12 }}>
                    <label>Coach note</label>
                    <textarea rows={3} value={editing.coach_note ?? ""} onChange={e => setEditing(x => x ? { ...x, coach_note: e.target.value } : x)} placeholder="Personal note from the coach to the parent…" />
                  </div>
                  <div className="field" style={{ marginBottom: 14 }}>
                    <label>Parent action (one specific task)</label>
                    <input value={editing.parent_action ?? ""} onChange={e => setEditing(x => x ? { ...x, parent_action: e.target.value } : x)} placeholder="e.g. Ask your child to explain one transition question…" />
                  </div>
                  <button className="btn btn-primary" onClick={saveEdit} disabled={sending === editing.id} style={{ padding: "9px 22px" }}>
                    {sending === editing.id ? "Saving…" : "Save & approve →"}
                  </button>
                </div>
              ) : (
                /* View mode */
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 900, color: "#071b33", fontSize: ".95rem" }}>{rpt.student_name}</span>
                      <span style={{ fontWeight: 700, color: "#6b7c93", fontSize: ".82rem" }}>Week {rpt.week_no}</span>
                      <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: STATUS_META[rpt.status]?.bg ?? "#f3f4f6", color: STATUS_META[rpt.status]?.color ?? "#6b7c93" }}>
                        {STATUS_META[rpt.status]?.label ?? rpt.status}
                      </span>
                    </div>
                    <div style={{ fontSize: ".78rem", color: "#6b7c93" }}>
                      {fmtDate(rpt.period_start)} – {fmtDate(rpt.period_end)}
                      {rpt.sent_at && ` · Sent ${fmtDate(rpt.sent_at)}`}
                    </div>
                    {rpt.narrative && <p style={{ margin: "6px 0 0", fontSize: ".82rem", color: "#7c3aed", fontStyle: "italic" }}>✨ "{rpt.narrative.substring(0, 90)}{rpt.narrative.length > 90 ? "…" : ""}"</p>}
                    {rpt.coach_note && <p style={{ margin: "4px 0 0", fontSize: ".85rem", color: "#344054", fontStyle: "italic" }}>"{rpt.coach_note.substring(0, 80)}{rpt.coach_note.length > 80 ? "…" : ""}"</p>}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                    <button onClick={() => generateNarrative(rpt.id)} disabled={genNarrativeId === rpt.id} style={{ padding: "7px 14px", borderRadius: 8, background: "#f5f3ff", border: "none", color: "#7c3aed", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>
                      {genNarrativeId === rpt.id ? "Writing…" : "✨ AI narrative"}
                    </button>
                    <button onClick={() => setEditing(rpt)} style={{ padding: "7px 14px", borderRadius: 8, background: "#eff6ff", border: "none", color: "#155eef", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>
                      Edit
                    </button>
                    {rpt.status !== "draft" && (
                      <button onClick={() => sendReport(rpt.id)} disabled={sending === rpt.id} style={{ padding: "7px 14px", borderRadius: 8, background: "#f0fdf4", border: "none", color: "#15803d", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>
                        {sending === rpt.id ? "Sending…" : "Send →"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div></section>
  );
}
