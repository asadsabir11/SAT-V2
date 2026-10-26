"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Platform = "zoom" | "google_classroom" | "google_meet" | "other";

interface Session {
  id: string;
  title: string;
  description: string;
  meeting_link: string;
  platform: Platform;
  scheduled_at: string;
  is_active: boolean;
  created_at: string;
}

const PLATFORM_LABEL: Record<Platform, string> = { zoom: "Zoom", google_classroom: "Google Classroom", google_meet: "Google Meet", other: "Other" };
const BLANK = { title: "", description: "", meeting_link: "", platform: "zoom" as Platform, scheduled_at: "" };

function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function AdminALevelSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(BLANK);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(BLANK);

  function load() {
    return fetch("/api/admin/a-level-sessions").then((r) => r.json()).then((d) => setSessions(d.sessions ?? []));
  }

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  async function createSession() {
    if (!form.title.trim() || !form.meeting_link.trim() || !form.scheduled_at) return;
    setCreating(true);
    await fetch("/api/admin/a-level-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, scheduled_at: new Date(form.scheduled_at).toISOString() }),
    });
    await load();
    setForm(BLANK);
    setCreating(false);
  }

  async function saveEdit(id: string) {
    await fetch(`/api/admin/a-level-sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, scheduled_at: new Date(editForm.scheduled_at).toISOString() }),
    });
    await load();
    setEditingId(null);
  }

  async function toggleActive(s: Session) {
    await fetch(`/api/admin/a-level-sessions/${s.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: !s.is_active }),
    });
    setSessions((ss) => ss.map((x) => (x.id === s.id ? { ...x, is_active: !x.is_active } : x)));
  }

  async function deleteSession(id: string) {
    if (!confirm("Delete this session? This cannot be undone.")) return;
    await fetch(`/api/admin/a-level-sessions/${id}`, { method: "DELETE" });
    setSessions((ss) => ss.filter((x) => x.id !== id));
  }

  return (
    <section className="section">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>A Level — Live Sessions</h1>
          <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>{sessions.length} session{sessions.length === 1 ? "" : "s"}</p>
        </div>

        <div className="card" style={{ marginBottom: 28, border: "2px solid #e8eef6" }}>
          <h3 style={{ margin: "0 0 18px", color: "#071b33", fontSize: "1rem" }}>New session</h3>
          <div className="form-grid" style={{ marginBottom: 14 }}>
            <div className="field"><label>Title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Topic 3 live class" /></div>
            <div className="field"><label>Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <div className="form-grid" style={{ marginBottom: 14 }}>
            <div className="field"><label>Meeting link *</label><input value={form.meeting_link} onChange={(e) => setForm({ ...form, meeting_link: e.target.value })} placeholder="https://zoom.us/..." /></div>
            <div className="field"><label>Scheduled at *</label><input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} /></div>
          </div>
          <div className="field" style={{ marginBottom: 16, maxWidth: 320 }}>
            <label>Platform</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(Object.keys(PLATFORM_LABEL) as Platform[]).map((p) => (
                <button key={p} type="button" onClick={() => setForm({ ...form, platform: p })} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, fontWeight: 700, fontSize: ".8rem", cursor: "pointer", border: form.platform === p ? "2px solid #be123c" : "2px solid #e8eef6", background: form.platform === p ? "#fff1f2" : "#fff", color: form.platform === p ? "#be123c" : "#6b7c93" }}>
                  {PLATFORM_LABEL[p]}
                </button>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" onClick={createSession} disabled={creating || !form.title.trim() || !form.meeting_link.trim() || !form.scheduled_at} style={{ background: "#be123c", borderColor: "#be123c" }}>
            {creating ? "Creating…" : "Create session"}
          </button>
        </div>

        {loading ? (
          <div className="card"><p>Loading sessions…</p></div>
        ) : sessions.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>No sessions yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {sessions.map((s) => (
              <div key={s.id} className="card" style={{ padding: "16px 20px" }}>
                {editingId === s.id ? (
                  <div>
                    <div className="form-grid" style={{ marginBottom: 10 }}>
                      <div className="field"><label>Title</label><input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></div>
                      <div className="field"><label>Meeting link</label><input value={editForm.meeting_link} onChange={(e) => setEditForm({ ...editForm, meeting_link: e.target.value })} /></div>
                    </div>
                    <div className="form-grid" style={{ marginBottom: 10 }}>
                      <div className="field"><label>Scheduled at</label><input type="datetime-local" value={editForm.scheduled_at} onChange={(e) => setEditForm({ ...editForm, scheduled_at: e.target.value })} /></div>
                      <div className="field"><label>Description</label><input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} /></div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-primary" onClick={() => saveEdit(s.id)} style={{ padding: "8px 18px", fontSize: ".85rem", background: "#be123c", borderColor: "#be123c" }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ padding: "8px 16px", borderRadius: 8, background: "#f1f5f9", border: "none", fontWeight: 700, cursor: "pointer", color: "#6b7c93", fontSize: ".85rem" }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: s.is_active ? "#d1fae5" : "#f3f4f6", color: s.is_active ? "#065f46" : "#6b7c93" }}>
                          {s.is_active ? "● Active" : "○ Inactive"}
                        </span>
                        <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: "#fff1f2", color: "#be123c" }}>{PLATFORM_LABEL[s.platform]}</span>
                      </div>
                      <p style={{ fontWeight: 700, color: "#071b33", margin: "0 0 2px", fontSize: ".95rem" }}>{s.title}</p>
                      {s.description && <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: 0 }}>{s.description}</p>}
                      <p style={{ color: "#a0aec0", fontSize: ".75rem", margin: "6px 0 0" }}>{new Date(s.scheduled_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true })}</p>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button onClick={() => { setEditingId(s.id); setEditForm({ title: s.title, description: s.description, meeting_link: s.meeting_link, platform: s.platform, scheduled_at: toLocalInputValue(s.scheduled_at) }); }} style={{ padding: "6px 12px", borderRadius: 8, background: "#fff1f2", border: "none", color: "#be123c", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>
                        Edit
                      </button>
                      <button onClick={() => toggleActive(s)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: ".78rem", cursor: "pointer", background: s.is_active ? "#fef3c7" : "#d1fae5", color: s.is_active ? "#92400e" : "#065f46" }}>
                        {s.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => deleteSession(s.id)} style={{ padding: "6px 12px", borderRadius: 8, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>
                        Delete
                      </button>
                    </div>
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
