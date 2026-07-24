"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Announcement { id: string; title: string; body: string; created_at: string; }

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", body: "" });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/announcements").then(r => r.json()).then(d => setItems(d.announcements ?? [])).finally(() => setLoading(false));
  }, []);

  async function post() {
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true);
    const res = await fetch("/api/announcements", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const { id } = await res.json();
    setItems(a => [{ id, ...form, created_at: new Date().toISOString() }, ...a]);
    setForm({ title: "", body: "" });
    setShowForm(false);
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    setItems(a => a.filter(x => x.id !== id));
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <div>
            <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>Announcements</h1>
            <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>Posts appear on every student&apos;s dashboard immediately.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            {showForm ? "Cancel" : "+ New announcement"}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ border: "2px solid #155eef", marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 16px", color: "#071b33" }}>New announcement</h3>
            <div className="field" style={{ marginBottom: 12 }}>
              <label>Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Class rescheduled — Friday 5 PM" />
            </div>
            <div className="field" style={{ marginBottom: 16 }}>
              <label>Message *</label>
              <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                rows={3} placeholder="Full details for students…"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d0d7e3", fontSize: ".9rem", fontFamily: "inherit", resize: "vertical" }} />
            </div>
            <button className="btn btn-primary" onClick={post} disabled={saving || !form.title.trim() || !form.body.trim()}>
              {saving ? "Posting…" : "Post to all students"}
            </button>
          </div>
        )}

        {loading ? (
          <div className="card"><p>Loading…</p></div>
        ) : items.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>📢</div>
            <p style={{ fontWeight: 700, marginBottom: 4 }}>No announcements yet</p>
            <p style={{ fontSize: ".88rem" }}>Post one above — it will appear on every student&apos;s dashboard.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {items.map(a => (
              <div key={a.id} className="card" style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, color: "#071b33", margin: "0 0 6px" }}>{a.title}</p>
                    <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: "0 0 8px", lineHeight: 1.6 }}>{a.body}</p>
                    <span style={{ color: "#a0aec0", fontSize: ".75rem" }}>Posted {timeAgo(a.created_at)}</span>
                  </div>
                  <button onClick={() => remove(a.id)}
                    style={{ padding: "6px 12px", borderRadius: 8, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".78rem", cursor: "pointer", flexShrink: 0 }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
