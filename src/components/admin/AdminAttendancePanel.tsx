"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Session { id: string; title: string; scheduled_at: string; }
interface AttRow { student_id: string; student_name: string; status: "present" | "late" | "absent"; }

const STATUS_OPTS = [
  { value: "present", label: "Present", bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
  { value: "late",    label: "Late",    bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
  { value: "absent",  label: "Absent",  bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" },
] as const;

export function AdminAttendancePanel({ program, title, description }: { program: "sat" | "o-level" | "punjab-9th"; title: string; description: string }) {
  const [sessions, setSessions]   = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [rows, setRows]           = useState<AttRow[]>([]);
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  useEffect(() => {
    fetch(`/api/admin/attendance?program=${program}`, { method: "OPTIONS" })
      .then(r => r.json()).then(d => setSessions(d.sessions ?? []));
  }, [program]);

  async function loadAttendance(sid: string) {
    setLoading(true); setSaved(false);
    const d = await fetch(`/api/admin/attendance?sessionId=${sid}`).then(r => r.json());
    setRows(d.attendance ?? []);
    setLoading(false);
  }

  function setStatus(studentId: string, status: "present" | "late" | "absent") {
    setRows(r => r.map(row => row.student_id === studentId ? { ...row, status } : row));
    setSaved(false);
  }

  async function save() {
    if (!sessionId) return;
    setSaving(true);
    await fetch("/api/admin/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, records: rows.map(r => ({ studentId: r.student_id, status: r.status })) }),
    });
    setSaved(true); setSaving(false);
  }

  return (
    <section className="section"><div className="container" style={{ maxWidth: 760 }}>
      <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "8px 0 4px" }}>{title}</h1>
      <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: "0 0 24px" }}>{description}</p>

      <div className="field" style={{ marginBottom: 20, maxWidth: 420 }}>
        <label>Session *</label>
        <select value={sessionId} onChange={e => { setSessionId(e.target.value); if (e.target.value) loadAttendance(e.target.value); }}>
          <option value="">— Select a session —</option>
          {sessions.map(s => (
            <option key={s.id} value={s.id}>
              {s.title} · {new Date(s.scheduled_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </option>
          ))}
        </select>
      </div>

      {loading && <p style={{ color: "#6b7c93" }}>Loading students…</p>}

      {!loading && rows.length > 0 && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {rows.map(row => (
              <div key={row.student_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderRadius: 14, border: "1.5px solid #e8eef6", background: "#fff" }}>
                <span style={{ fontWeight: 700, color: "#071b33", fontSize: ".95rem" }}>{row.student_name}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  {STATUS_OPTS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setStatus(row.student_id, opt.value)}
                      style={{
                        padding: "6px 14px", borderRadius: 8, fontWeight: 700, fontSize: ".82rem", cursor: "pointer",
                        border: `1.5px solid ${row.status === opt.value ? opt.border : "#e8eef6"}`,
                        background: row.status === opt.value ? opt.bg : "#f8fafc",
                        color: row.status === opt.value ? opt.color : "#6b7c93",
                      }}
                    >{opt.label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary"
            onClick={save}
            disabled={saving}
            style={{ background: saved ? "#22c55e" : undefined }}
          >
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save attendance"}
          </button>
        </>
      )}

      {!loading && sessionId && rows.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>
          <p style={{ fontWeight: 700 }}>No students found</p>
          <p style={{ fontSize: ".88rem" }}>Students must be registered before attendance can be marked.</p>
        </div>
      )}
    </div></section>
  );
}
