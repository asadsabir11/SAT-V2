"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Platform = "zoom" | "google_classroom" | "google_meet" | "other";

interface LiveSession {
  id: string;
  title: string;
  description: string;
  meeting_link: string;
  platform: Platform;
  scheduled_at: string;
  is_active: boolean;
  created_at: string;
}

const PLATFORM_LABELS: Record<Platform, { label: string; icon: string; color: string; bg: string }> = {
  zoom:             { label: "Zoom",             icon: "💻", color: "#1d4ed8", bg: "#dbeafe" },
  google_classroom: { label: "Google Classroom", icon: "🎓", color: "#065f46", bg: "#d1fae5" },
  google_meet:      { label: "Google Meet",      icon: "🎥", color: "#7c3aed", bg: "#ede9fe" },
  other:            { label: "Other",            icon: "🔗", color: "#92400e", bg: "#fef3c7" },
};

const BLANK = { title: "", description: "", meeting_link: "", platform: "zoom" as Platform, scheduled_at: "", is_active: true };

export default function AdminSessions() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ ...BLANK });

  useEffect(() => {
    fetch("/api/sessions").then(r => r.json()).then(d => setSessions(d.sessions ?? [])).finally(() => setLoading(false));
  }, []);

  async function createSession() {
    if (!form.title.trim() || !form.meeting_link.trim() || !form.scheduled_at) return;
    setSaving(true);
    const res = await fetch("/api/sessions", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const d = await res.json();
    const newS: LiveSession = { ...form, id: d.id, created_at: new Date().toISOString() };
    setSessions(s => [newS, ...s]);
    setForm({ ...BLANK });
    setShowForm(false);
    setSaving(false);
  }

  async function saveEdit(id: string) {
    await fetch(`/api/sessions/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm),
    });
    setSessions(s => s.map(ss => ss.id === id ? { ...ss, ...editForm } : ss));
    setEditingId(null);
  }

  async function toggleActive(s: LiveSession) {
    await fetch(`/api/sessions/${s.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: !s.is_active }),
    });
    setSessions(ss => ss.map(x => x.id === s.id ? { ...x, is_active: !x.is_active } : x));
  }

  async function deleteSession(id: string) {
    if (!confirm("Delete this session?")) return;
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    setSessions(s => s.filter(x => x.id !== id));
  }

  const active = sessions.filter(s => s.is_active).length;

  return (
    <section className="section">
      <div className="container">

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <div>
            <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>Live Sessions</h1>
            <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>
              {sessions.length} total · {active} active · {sessions.length - active} hidden
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            {showForm ? "Cancel" : "+ Add session"}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="card" style={{ border: "2px solid #155eef", marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 18px", color: "#071b33" }}>New session</h3>

            <div className="form-grid" style={{ marginBottom: 14 }}>
              <div className="field">
                <label>Session title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Week 3 — Algebra Live Class" />
              </div>
              <div className="field">
                <label>Platform *</label>
                <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value as Platform }))}>
                  <option value="zoom">Zoom</option>
                  <option value="google_meet">Google Meet</option>
                  <option value="google_classroom">Google Classroom</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="field" style={{ marginBottom: 14 }}>
              <label>Meeting link * (Zoom/Google Meet/Classroom URL)</label>
              <input value={form.meeting_link} onChange={e => setForm(f => ({ ...f, meeting_link: e.target.value }))} placeholder="https://zoom.us/j/... or https://meet.google.com/..." />
            </div>

            <div className="form-grid" style={{ marginBottom: 14 }}>
              <div className="field">
                <label>Date & time *</label>
                <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} />
              </div>
              <div className="field">
                <label>Description (optional)</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What will be covered in this session…" />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
              <input type="checkbox" id="active-check" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} style={{ accentColor: "#155eef" }} />
              <label htmlFor="active-check" style={{ fontSize: ".88rem", fontWeight: 600, color: "#344054", cursor: "pointer" }}>
                Visible to students immediately
              </label>
            </div>

            <button className="btn btn-primary" onClick={createSession} disabled={saving || !form.title.trim() || !form.meeting_link.trim() || !form.scheduled_at}>
              {saving ? "Saving…" : "Create session"}
            </button>
          </div>
        )}

        {/* Sessions list */}
        {loading ? (
          <div className="card"><p>Loading…</p></div>
        ) : sessions.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📅</div>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>No sessions yet</p>
            <p style={{ fontSize: ".88rem" }}>Add your first live session above.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {sessions.map(s => {
              const p = PLATFORM_LABELS[s.platform] ?? PLATFORM_LABELS.other;
              const isPast = new Date(s.scheduled_at) < new Date();

              if (editingId === s.id) {
                return (
                  <div key={s.id} className="card" style={{ border: "2px solid #155eef" }}>
                    <div className="form-grid" style={{ marginBottom: 12 }}>
                      <div className="field"><label>Title *</label><input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} /></div>
                      <div className="field"><label>Platform</label>
                        <select value={editForm.platform} onChange={e => setEditForm(f => ({ ...f, platform: e.target.value as Platform }))}>
                          <option value="zoom">Zoom</option>
                          <option value="google_meet">Google Meet</option>
                          <option value="google_classroom">Google Classroom</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="field" style={{ marginBottom: 12 }}><label>Meeting link *</label><input value={editForm.meeting_link} onChange={e => setEditForm(f => ({ ...f, meeting_link: e.target.value }))} /></div>
                    <div className="form-grid" style={{ marginBottom: 14 }}>
                      <div className="field"><label>Date & time</label><input type="datetime-local" value={editForm.scheduled_at} onChange={e => setEditForm(f => ({ ...f, scheduled_at: e.target.value }))} /></div>
                      <div className="field"><label>Description</label><input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} /></div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-primary" onClick={() => saveEdit(s.id)} disabled={!editForm.title.trim() || !editForm.meeting_link.trim()} style={{ padding: "8px 18px", fontSize: ".85rem" }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ padding: "8px 16px", borderRadius: 8, background: "#f1f5f9", border: "none", fontWeight: 700, cursor: "pointer", color: "#6b7c93", fontSize: ".85rem" }}>Cancel</button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={s.id} className="card" style={{ padding: "16px 20px", opacity: isPast && !s.is_active ? .6 : 1 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    {/* Platform icon */}
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>
                      {p.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5, flexWrap: "wrap" }}>
                        <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: p.bg, color: p.color }}>{p.label}</span>
                        <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: s.is_active ? "#d1fae5" : "#f3f4f6", color: s.is_active ? "#065f46" : "#6b7c93" }}>
                          {s.is_active ? "● Visible" : "○ Hidden"}
                        </span>
                        {isPast && <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>Past</span>}
                      </div>
                      <p style={{ fontWeight: 800, color: "#071b33", margin: "0 0 3px", fontSize: ".95rem" }}>{s.title}</p>
                      {s.description && <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: "0 0 6px" }}>{s.description}</p>}
                      <p style={{ color: "#a0aec0", fontSize: ".78rem", margin: 0 }}>
                        📅 {new Date(s.scheduled_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                      <p style={{ margin: "4px 0 0" }}>
                        <a href={s.meeting_link} target="_blank" rel="noreferrer" style={{ color: "#155eef", fontSize: ".78rem", fontWeight: 700 }}>
                          {s.meeting_link.length > 60 ? s.meeting_link.slice(0, 60) + "…" : s.meeting_link}
                        </a>
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button onClick={() => { setEditingId(s.id); setEditForm({ title: s.title, description: s.description, meeting_link: s.meeting_link, platform: s.platform, scheduled_at: s.scheduled_at.slice(0, 16), is_active: s.is_active }); }}
                        style={{ padding: "6px 12px", borderRadius: 8, background: "#eff6ff", border: "none", color: "#155eef", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>Edit</button>
                      <button onClick={() => toggleActive(s)}
                        style={{ padding: "6px 12px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: ".78rem", cursor: "pointer", background: s.is_active ? "#fef3c7" : "#d1fae5", color: s.is_active ? "#92400e" : "#065f46" }}>
                        {s.is_active ? "Hide" : "Show"}
                      </button>
                      <button onClick={() => deleteSession(s.id)}
                        style={{ padding: "6px 12px", borderRadius: 8, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>Delete</button>
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
