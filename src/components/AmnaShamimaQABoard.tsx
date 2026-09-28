"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Post {
  id: string; title: string; body: string;
  author_name: string; is_answered: boolean;
  reply_count: number; created_at: string;
}

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// The auth check (session + program) lives in the server page.tsx that
// renders this — the API additionally re-checks on every request, so this
// component itself doesn't need to.
export default function AmnaShamimaQABoard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/amna-shamima/qa").then(r => r.json()).then(d => setPosts(d.posts ?? [])).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function submitPost() {
    if (!form.title.trim() || !form.body.trim()) return;
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/amna-shamima/qa", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to post."); setSubmitting(false); return; }
    setPosts(p => [{ id: data.id, ...form, author_name: "You", is_answered: false, reply_count: 0, created_at: new Date().toISOString() }, ...p]);
    setForm({ title: "", body: "" });
    setShowForm(false);
    setSubmitting(false);
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
          <div>
            <Link href="/amna-shamima/portal" style={{ display: "inline-block", marginBottom: 8, color: "#6b7c93", fontSize: ".82rem", fontWeight: 600, textDecoration: "none" }}>← Portal</Link>
            <h1 style={{ fontSize: "1.7rem", fontWeight: 900, color: "#071b33", margin: "0 0 4px", letterSpacing: "-.03em" }}>Q&amp;A Board</h1>
            <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>Ask a question — your teacher will answer it here.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            {showForm ? "Cancel" : "Ask a question"}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ border: "2px solid #d97706", marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 16px", color: "#071b33" }}>New question</h3>
            <div className="field" style={{ marginBottom: 12 }}>
              <label htmlFor="qa-title">Title *</label>
              <input id="qa-title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. How do I write a good AI prompt?" />
            </div>
            <div className="field" style={{ marginBottom: 12 }}>
              <label htmlFor="qa-body">Details *</label>
              <textarea id="qa-body" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Describe your question in detail."
                rows={4} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d0d7e3", fontSize: ".9rem", fontFamily: "inherit", resize: "vertical" }} />
            </div>
            {error && <p style={{ color: "#dc2626", fontWeight: 600, fontSize: ".85rem", marginBottom: 12 }}>⚠ {error}</p>}
            <button className="btn btn-primary" onClick={submitPost} disabled={submitting || !form.title.trim() || !form.body.trim()}>
              {submitting ? "Posting…" : "Post question"}
            </button>
          </div>
        )}

        {loading ? (
          <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>Loading…</div>
        ) : posts.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 56 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>💬</div>
            <p style={{ fontWeight: 700, color: "#071b33", marginBottom: 6 }}>No questions yet</p>
            <p style={{ color: "#6b7c93", fontSize: ".88rem" }}>Be the first to ask something.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {posts.map(p => (
              <Link key={p.id} href={`/amna-shamima/portal/qa/${p.id}`} style={{ textDecoration: "none" }}>
                <div className="card" style={{ padding: "16px 20px", cursor: "pointer", transition: "box-shadow .15s" }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(217,119,6,.12)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "")}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ minWidth: 48, textAlign: "center", padding: "8px 4px", borderRadius: 8, background: p.reply_count > 0 ? "#f0fdf4" : "#f8fafc", flexShrink: 0 }}>
                      <div style={{ fontSize: "1.1rem", fontWeight: 900, color: p.reply_count > 0 ? "#16a34a" : "#94a3b8" }}>{p.reply_count}</div>
                      <div style={{ fontSize: ".65rem", color: "#94a3b8", fontWeight: 600 }}>replies</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                        {p.is_answered
                          ? <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: ".71rem", fontWeight: 700, background: "#d1fae5", color: "#065f46" }}>✓ Answered</span>
                          : <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: ".71rem", fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>⏳ Waiting for answer</span>}
                      </div>
                      <p style={{ fontWeight: 800, color: "#071b33", margin: "0 0 4px", fontSize: ".95rem" }}>{p.title}</p>
                      <p style={{ color: "#6b7c93", fontSize: ".8rem", margin: 0 }}>{p.author_name} · {timeAgo(p.created_at)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
