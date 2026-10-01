"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Recording {
  id: string;
  title: string;
  description: string;
  zoom_link: string;
  passcode: string;
  is_published: boolean;
  created_at: string;
}

function fmtWhen(d: string) {
  return new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
}

export default function AdminAmnaShamimaRecordings() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [zoomLink, setZoomLink] = useState("");
  const [passcode, setPasscode] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editPasscode, setEditPasscode] = useState("");

  function loadRecordings() {
    return fetch("/api/admin/amna-shamima-recordings").then((r) => r.json()).then((d) => setRecordings(d.recordings ?? []));
  }

  useEffect(() => {
    loadRecordings().finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!title.trim() || !zoomLink.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/admin/amna-shamima-recordings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, zoom_link: zoomLink, passcode }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error ?? `Save failed (${res.status})`);
      }
      await loadRecordings();
      setTitle("");
      setDescription("");
      setZoomLink("");
      setPasscode("");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(r: Recording) {
    const action = r.is_published ? "unpublish" : "publish";
    await fetch(`/api/admin/amna-shamima-recordings/${r.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }),
    });
    setRecordings((rs) => rs.map((x) => (x.id === r.id ? { ...x, is_published: !x.is_published } : x)));
  }

  async function deleteRecording(id: string) {
    if (!confirm("Delete this recording link? This cannot be undone.")) return;
    await fetch(`/api/admin/amna-shamima-recordings/${id}`, { method: "DELETE" });
    setRecordings((rs) => rs.filter((x) => x.id !== id));
  }

  async function saveEdit(id: string) {
    if (!editTitle.trim() || !editLink.trim()) return;
    await fetch(`/api/admin/amna-shamima-recordings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, description: editDesc, zoom_link: editLink, passcode: editPasscode }),
    });
    setRecordings((rs) => rs.map((x) => (x.id === id ? { ...x, title: editTitle, description: editDesc, zoom_link: editLink, passcode: editPasscode } : x)));
    setEditingId(null);
  }

  const published = recordings.filter((r) => r.is_published).length;

  return (
    <section className="section">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <div>
            <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>Amna Shamima — Recordings</h1>
            <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>
              {recordings.length} total · {published} published · {recordings.length - published} draft
            </p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 28, border: "2px solid #e8eef6" }}>
          <h3 style={{ margin: "0 0 18px", color: "#071b33", fontSize: "1rem" }}>Add recording</h3>

          <div className="form-grid" style={{ marginBottom: 14 }}>
            <div className="field">
              <label>Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Week 1 Recording" />
            </div>
            <div className="field">
              <label>Note (optional)</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this class covered…" />
            </div>
          </div>

          <div className="form-grid" style={{ marginBottom: 16 }}>
            <div className="field">
              <label>Zoom link *</label>
              <input value={zoomLink} onChange={(e) => setZoomLink(e.target.value)} placeholder="https://zoom.us/rec/share/…" />
            </div>
            <div className="field">
              <label>Passcode (optional)</label>
              <input value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="e.g. 1rvFvT++" />
            </div>
          </div>

          {saveError && <p style={{ color: "#dc2626", fontSize: ".85rem", marginBottom: 12, fontWeight: 600 }}>⚠ {saveError}</p>}

          <button className="btn btn-primary" onClick={handleCreate} disabled={saving || !title.trim() || !zoomLink.trim()} style={{ minWidth: 180 }}>
            {saving ? "Saving…" : "Add recording"}
          </button>
        </div>

        {loading ? (
          <div className="card"><p>Loading recordings…</p></div>
        ) : recordings.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🎥</div>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>No recordings yet</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {recordings.map((r) => (
              <div key={r.id} className="card" style={{ padding: "16px 20px", border: editingId === r.id ? "2px solid #155eef" : "1px solid #e8eef6" }}>
                {editingId === r.id ? (
                  <div>
                    <div className="form-grid" style={{ marginBottom: 12 }}>
                      <div className="field"><label>Title *</label><input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} /></div>
                      <div className="field"><label>Note</label><input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} /></div>
                    </div>
                    <div className="form-grid" style={{ marginBottom: 12 }}>
                      <div className="field"><label>Zoom link *</label><input value={editLink} onChange={(e) => setEditLink(e.target.value)} /></div>
                      <div className="field"><label>Passcode</label><input value={editPasscode} onChange={(e) => setEditPasscode(e.target.value)} /></div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-primary" onClick={() => saveEdit(r.id)} disabled={!editTitle.trim() || !editLink.trim()} style={{ padding: "8px 18px", fontSize: ".85rem" }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ padding: "8px 16px", borderRadius: 8, background: "#f1f5f9", border: "none", fontWeight: 700, cursor: "pointer", color: "#6b7c93", fontSize: ".85rem" }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: r.is_published ? "#d1fae5" : "#f3f4f6", color: r.is_published ? "#065f46" : "#6b7c93" }}>
                          {r.is_published ? "● Published" : "○ Draft"}
                        </span>
                      </div>
                      <p style={{ fontWeight: 700, color: "#071b33", margin: "0 0 2px", fontSize: ".95rem" }}>{r.title}</p>
                      {r.description && <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: 0 }}>{r.description}</p>}
                      <p style={{ color: "#a0aec0", fontSize: ".75rem", margin: "6px 0 2px", wordBreak: "break-all" }}>{r.zoom_link}</p>
                      {r.passcode && <p style={{ color: "#a0aec0", fontSize: ".75rem", margin: 0 }}>Passcode: <strong style={{ color: "#6b7c93" }}>{r.passcode}</strong></p>}
                      <p style={{ color: "#a0aec0", fontSize: ".75rem", margin: "6px 0 0" }}>Added {fmtWhen(r.created_at)}</p>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <a href={r.zoom_link} target="_blank" rel="noreferrer" style={{ padding: "6px 12px", borderRadius: 8, background: "#f1f5f9", border: "none", fontWeight: 700, fontSize: ".78rem", color: "#344054", textDecoration: "none" }}>
                        Preview
                      </a>
                      <button onClick={() => { setEditingId(r.id); setEditTitle(r.title); setEditDesc(r.description); setEditLink(r.zoom_link); setEditPasscode(r.passcode); }} style={{ padding: "6px 12px", borderRadius: 8, background: "#eff6ff", border: "none", color: "#155eef", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>
                        Edit
                      </button>
                      <button onClick={() => togglePublish(r)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: ".78rem", cursor: "pointer", background: r.is_published ? "#fef3c7" : "#d1fae5", color: r.is_published ? "#92400e" : "#065f46" }}>
                        {r.is_published ? "Unpublish" : "Publish"}
                      </button>
                      <button onClick={() => deleteRecording(r.id)} style={{ padding: "6px 12px", borderRadius: 8, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>
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
