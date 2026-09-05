"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type StudyGroup = "Biology" | "Computer Science" | "Both";

interface Punjab9thSession {
  id: string;
  subject: string;
  study_group: StudyGroup;
  title: string;
  meeting_link: string;
  scheduled_at: string;
  is_active: boolean;
  created_at: string;
}

const SUBJECTS = ["English", "Urdu", "Maths", "Physics", "Chemistry", "Biology", "Computer Science", "Islamiat", "Tarjuma-tul-Quran or Ethics"];

const GROUP_META: Record<StudyGroup, { bg: string; color: string; label: string }> = {
  "Biology": { bg: "#f0fdf4", color: "#15803d", label: "🧬 Biology group" },
  "Computer Science": { bg: "#eff6ff", color: "#155eef", label: "💻 Computer Science group" },
  "Both": { bg: "#fff7ed", color: "#c2410c", label: "👥 Both groups" },
};

const BLANK = { subject: "English", studyGroup: "Both" as StudyGroup, title: "", meetingLink: "", scheduledAt: "", isActive: true };

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminPunjab9thSessions() {
  const [sessions, setSessions] = useState<Punjab9thSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ ...BLANK });

  function load() {
    fetch("/api/admin/punjab-9th-sessions").then((r) => r.json()).then((d) => setSessions(d.sessions ?? [])).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  async function createSession() {
    if (!form.title.trim() || !form.meetingLink.trim() || !form.scheduledAt) return;
    setSaving(true);
    await fetch("/api/admin/punjab-9th-sessions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, scheduledAt: new Date(form.scheduledAt).toISOString() }),
    });
    setForm({ ...BLANK });
    setShowForm(false);
    setSaving(false);
    load();
  }

  function startEdit(s: Punjab9thSession) {
    setEditingId(s.id);
    setEditForm({ subject: s.subject, studyGroup: s.study_group, title: s.title, meetingLink: s.meeting_link, scheduledAt: toLocalInputValue(s.scheduled_at), isActive: s.is_active });
  }

  async function saveEdit(id: string) {
    setSaving(true);
    await fetch(`/api/admin/punjab-9th-sessions/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, scheduledAt: new Date(editForm.scheduledAt).toISOString() }),
    });
    setEditingId(null);
    setSaving(false);
    load();
  }

  async function toggleActive(s: Punjab9thSession) {
    await fetch(`/api/admin/punjab-9th-sessions/${s.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !s.is_active }),
    });
    load();
  }

  async function remove(id: string, title: string) {
    if (!confirm(`Delete the class session "${title}"? This also removes any attendance recorded for it.`)) return;
    await fetch(`/api/admin/punjab-9th-sessions/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>9th Online Classes</h1>
          <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>
            Upload the Zoom link for each subject&apos;s class — students see it on their portal, scoped to their registered group (Biology or Computer Science). Shared-subject classes (English, Urdu, Maths, Physics, Chemistry, Islamiat) can be set to &quot;Both groups&quot; so you don&apos;t have to create two identical entries.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)} style={{ marginBottom: 20 }}>
          {showForm ? "✕ Cancel" : "+ Add class session"}
        </button>

        {showForm && (
          <div className="card" style={{ marginBottom: 24, border: "2px solid #e8eef6" }}>
            <div className="form-grid" style={{ marginBottom: 14 }}>
              <div className="field">
                <label>Subject *</label>
                <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Group *</label>
                <select value={form.studyGroup} onChange={(e) => setForm((f) => ({ ...f, studyGroup: e.target.value as StudyGroup }))}>
                  <option value="Both">Both groups</option>
                  <option value="Biology">Biology group only</option>
                  <option value="Computer Science">Computer Science group only</option>
                </select>
              </div>
              <div className="field">
                <label>Class title *</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Physics — Week 3" />
              </div>
              <div className="field">
                <label>Zoom link *</label>
                <input value={form.meetingLink} onChange={(e) => setForm((f) => ({ ...f, meetingLink: e.target.value }))} placeholder="https://zoom.us/j/..." />
              </div>
              <div className="field">
                <label>Date & time *</label>
                <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={createSession} disabled={saving} style={{ padding: "9px 22px" }}>
              {saving ? "Saving…" : "Create session →"}
            </button>
          </div>
        )}

        {loading ? (
          <div className="card"><p>Loading…</p></div>
        ) : sessions.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>🎥</div>
            <p style={{ fontWeight: 700 }}>No class sessions yet</p>
            <p style={{ fontSize: ".88rem" }}>Add the first one above.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sessions.map((s) => {
              const meta = GROUP_META[s.study_group] ?? GROUP_META.Both;
              return (
                <div key={s.id} className="card" style={{ padding: "16px 20px" }}>
                  {editingId === s.id ? (
                    <div>
                      <div className="form-grid" style={{ marginBottom: 14 }}>
                        <div className="field">
                          <label>Subject</label>
                          <select value={editForm.subject} onChange={(e) => setEditForm((f) => ({ ...f, subject: e.target.value }))}>
                            {SUBJECTS.map((s2) => <option key={s2} value={s2}>{s2}</option>)}
                          </select>
                        </div>
                        <div className="field">
                          <label>Group</label>
                          <select value={editForm.studyGroup} onChange={(e) => setEditForm((f) => ({ ...f, studyGroup: e.target.value as StudyGroup }))}>
                            <option value="Both">Both groups</option>
                            <option value="Biology">Biology group only</option>
                            <option value="Computer Science">Computer Science group only</option>
                          </select>
                        </div>
                        <div className="field">
                          <label>Class title</label>
                          <input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} />
                        </div>
                        <div className="field">
                          <label>Zoom link</label>
                          <input value={editForm.meetingLink} onChange={(e) => setEditForm((f) => ({ ...f, meetingLink: e.target.value }))} />
                        </div>
                        <div className="field">
                          <label>Date & time</label>
                          <input type="datetime-local" value={editForm.scheduledAt} onChange={(e) => setEditForm((f) => ({ ...f, scheduledAt: e.target.value }))} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-primary" onClick={() => saveEdit(s.id)} disabled={saving} style={{ padding: "8px 18px" }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{ padding: "8px 18px", borderRadius: 8, background: "#f1f5f9", border: "none", color: "#6b7c93", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 900, color: "#071b33", fontSize: ".95rem" }}>{s.title}</span>
                          <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: "#eff6ff", color: "#155eef" }}>{s.subject}</span>
                          <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: meta.bg, color: meta.color }}>{meta.label}</span>
                          <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: s.is_active ? "#f0fdf4" : "#f3f4f6", color: s.is_active ? "#15803d" : "#6b7c93" }}>
                            {s.is_active ? "Active" : "Hidden"}
                          </span>
                        </div>
                        <div style={{ fontSize: ".82rem", color: "#6b7c93" }}>
                          {new Date(s.scheduled_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <a href={s.meeting_link} target="_blank" rel="noreferrer" style={{ fontSize: ".82rem", color: "#155eef", wordBreak: "break-all" }}>{s.meeting_link}</a>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                        <button onClick={() => toggleActive(s)} style={{ padding: "6px 12px", borderRadius: 7, background: "#f1f5f9", border: "none", color: "#6b7c93", fontWeight: 700, fontSize: ".75rem", cursor: "pointer" }}>
                          {s.is_active ? "Hide" : "Unhide"}
                        </button>
                        <button onClick={() => startEdit(s)} style={{ padding: "6px 12px", borderRadius: 7, background: "#eff6ff", border: "none", color: "#155eef", fontWeight: 700, fontSize: ".75rem", cursor: "pointer" }}>
                          Edit
                        </button>
                        <button onClick={() => remove(s.id, s.title)} style={{ padding: "6px 12px", borderRadius: 7, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".75rem", cursor: "pointer" }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
