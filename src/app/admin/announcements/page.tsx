"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Announcement { id: string; title: string; body: string; created_at: string; program: "sat" | "o-level" | null; }
type Program = "sat" | "o-level";
type Filter = "all" | Program;

const PROGRAM_META: Record<Program, { label: string; bg: string; color: string }> = {
  sat:      { label: "SAT",     bg: "#eff6ff", color: "#155eef" },
  "o-level": { label: "O Level", bg: "#eef2ff", color: "#4338ca" },
};

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
  const [filter, setFilter] = useState<Filter>("all");
  const [form, setForm] = useState<{ title: string; body: string; program: Program }>({ title: "", body: "", program: "sat" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/announcements").then(r => r.json()).then(d => setItems(d.announcements ?? [])).finally(() => setLoading(false));
  }, []);

  async function post() {
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true); setFormError("");
    const res = await fetch("/api/announcements", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setFormError(data.error ?? "Failed to post."); setSaving(false); return; }
    setItems(a => [{ id: data.id, title: form.title, body: form.body, program: form.program, created_at: new Date().toISOString() }, ...a]);
    setForm({ title: "", body: "", program: "sat" });
    setShowForm(false);
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    setItems(a => a.filter(x => x.id !== id));
  }

  const visible = items.filter(a => filter === "all" || a.program === filter);

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <div>
            <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>Announcements</h1>
            <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>
              Posts appear only on that program&apos;s student dashboards, immediately.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            {showForm ? "Cancel" : "+ New announcement"}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ border: "2px solid #155eef", marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 16px", color: "#071b33" }}>New announcement</h3>

            <div className="field" style={{ marginBottom: 14 }}>
              <label>Program *</label>
              <div style={{ display: "flex", gap: 8, background: "#f1f5f9", borderRadius: 10, padding: 4 }}>
                {(["sat", "o-level"] as Program[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={form.program === p}
                    onClick={() => setForm(f => ({ ...f, program: p }))}
                    style={{
                      flex: 1, padding: "9px 8px", borderRadius: 7, border: "none", cursor: "pointer",
                      fontWeight: 700, fontSize: ".85rem", transition: ".15s",
                      background: form.program === p ? "#fff" : "transparent",
                      color: form.program === p ? PROGRAM_META[p].color : "#6b7c93",
                      boxShadow: form.program === p ? "0 1px 6px rgba(7,27,51,.10)" : "none",
                    }}
                  >
                    {PROGRAM_META[p].label}
                  </button>
                ))}
              </div>
              <p style={{ margin: "6px 0 0", fontSize: ".76rem", color: "#a0aec0" }}>
                Only shown on {PROGRAM_META[form.program].label} students&apos; dashboards.
              </p>
            </div>

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
            {formError && <p style={{ color: "#dc2626", fontWeight: 600, fontSize: ".85rem", marginBottom: 12 }}>⚠ {formError}</p>}
            <button className="btn btn-primary" onClick={post} disabled={saving || !form.title.trim() || !form.body.trim()}>
              {saving ? "Posting…" : `Post to ${PROGRAM_META[form.program].label} students →`}
            </button>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {(["all", "sat", "o-level"] as Filter[]).map(f => {
              const active = filter === f;
              const label = f === "all" ? "All" : PROGRAM_META[f].label;
              return (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 16px", borderRadius: 999, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", border: active ? "2px solid #155eef" : "2px solid #e8eef6", background: active ? "#eff6ff" : "#fff", color: active ? "#155eef" : "#6b7c93" }}>
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="card"><p>Loading…</p></div>
        ) : visible.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>📢</div>
            <p style={{ fontWeight: 700, marginBottom: 4 }}>No announcements yet</p>
            <p style={{ fontSize: ".88rem" }}>Post one above — it will appear on that program&apos;s student dashboards.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {visible.map(a => {
              const meta = a.program ? PROGRAM_META[a.program] : { label: "All programs", bg: "#f3f4f6", color: "#6b7c93" };
              return (
                <div key={a.id} className="card" style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: meta.bg, color: meta.color }}>
                          {meta.label}
                        </span>
                        <p style={{ fontWeight: 800, color: "#071b33", margin: 0 }}>{a.title}</p>
                      </div>
                      <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: "0 0 8px", lineHeight: 1.6 }}>{a.body}</p>
                      <span style={{ color: "#a0aec0", fontSize: ".75rem" }}>Posted {timeAgo(a.created_at)}</span>
                    </div>
                    <button onClick={() => remove(a.id)}
                      style={{ padding: "6px 12px", borderRadius: 8, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".78rem", cursor: "pointer", flexShrink: 0 }}>
                      Delete
                    </button>
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
