"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { UnlockModal, LockedBanner, type AccessLevel } from "@/components/unlock-modal";

const TOPICS = ["All", "Math", "Reading & Writing", "Test Strategy", "General"];

const TOPIC_COLORS: Record<string, { bg: string; color: string }> = {
  "Math":              { bg: "#dbeafe", color: "#1d4ed8" },
  "Reading & Writing": { bg: "#ede9fe", color: "#7c3aed" },
  "Test Strategy":     { bg: "#fef3c7", color: "#92400e" },
  "General":           { bg: "#f1f5f9", color: "#475569" },
};

interface Post {
  id: string; title: string; body: string; topic: string;
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

export default function DiscussionPage() {
  const [posts, setPosts]         = useState<Post[]>([]);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("free");
  const [locked, setLocked]       = useState(false);
  const [topic, setTopic]         = useState("All");
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ title: "", body: "", topic: "General" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/discussion?topic=${encodeURIComponent(topic)}`)
      .then(r => r.json())
      .then(d => {
        setPosts(d.posts ?? []);
        setAccessLevel(d.access_level ?? "free");
        setLocked(d.locked === true);
      })
      .finally(() => setLoading(false));
  }, [topic]);

  useEffect(() => { load(); }, [load]);

  const filtered = search.trim()
    ? posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.body.toLowerCase().includes(search.toLowerCase()))
    : posts;

  async function submitPost() {
    if (!form.title.trim() || !form.body.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/discussion", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const { id } = await res.json();
    setPosts(p => [{ id, ...form, author_name: "You", is_answered: false, reply_count: 0, created_at: new Date().toISOString() }, ...p]);
    setForm({ title: "", body: "", topic: "General" });
    setShowForm(false);
    setSubmitting(false);
  }

  return (
    <section className="section">
      {showModal && (
        <UnlockModal
          accessLevel={accessLevel}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="container" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
          <div>
            <Link href="/sat" style={{ display: "inline-block", marginBottom: 8, color: "#6b7c93", fontSize: ".82rem", fontWeight: 600, textDecoration: "none" }}>← SAT toolkit</Link>
            <h1 style={{ fontSize: "1.7rem", fontWeight: 900, color: "#071b33", margin: "0 0 4px", letterSpacing: "-.03em" }}>Q&amp;A Board</h1>
            <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>Ask questions, help classmates, get answers from your instructor.</p>
          </div>
          {!locked && (
            <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
              {showForm ? "Cancel" : "Ask a question"}
            </button>
          )}
        </div>

        {/* Access banners */}
        {!loading && locked && (
          <LockedBanner accessLevel={accessLevel} onUnlock={() => setShowModal(true)} />
        )}

        {/* Ask form (only when unlocked) */}
        {!locked && showForm && (
          <div className="card" style={{ border: "2px solid #155eef", marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 16px", color: "#071b33" }}>New question</h3>
            <div className="field" style={{ marginBottom: 12 }}>
              <label htmlFor="disc-title">Title *</label>
              <input id="disc-title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. How do I solve systems of equations quickly?" />
            </div>
            <div className="field" style={{ marginBottom: 12 }}>
              <label htmlFor="disc-body">Details *</label>
              <textarea id="disc-body" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Describe your question in detail."
                rows={4} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d0d7e3", fontSize: ".9rem", fontFamily: "inherit", resize: "vertical" }} />
            </div>
            <div className="field" style={{ marginBottom: 16 }}>
              <label htmlFor="disc-topic">Topic</label>
              <select id="disc-topic" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}>
                {TOPICS.filter(t => t !== "All").map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={submitPost} disabled={submitting || !form.title.trim() || !form.body.trim()}>
              {submitting ? "Posting…" : "Post question"}
            </button>
          </div>
        )}

        {/* Locked content */}
        {locked ? (
          <div style={{ position: "relative" }}>
            <div style={{ filter: "blur(3px)", pointerEvents: "none", userSelect: "none", opacity: .4 }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="card" style={{ padding: "16px 20px", marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 48, height: 56, borderRadius: 8, background: "#e8eef6", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 10, background: "#e8eef6", borderRadius: 4, width: "30%", marginBottom: 10 }} />
                      <div style={{ height: 14, background: "#e8eef6", borderRadius: 4, width: "70%", marginBottom: 8 }} />
                      <div style={{ height: 10, background: "#e8eef6", borderRadius: 4, width: "25%" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
              <div style={{ fontSize: "2.5rem" }}>💬</div>
              <p style={{ fontWeight: 800, color: "#071b33", fontSize: "1rem", margin: 0 }}>Q&amp;A Board is for paid students</p>
              <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>Ask questions and get answers from your instructor after unlocking.</p>
              <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: 4 }}>Unlock Full Access</button>
            </div>
          </div>
        ) : (
          <>
            {/* Search */}
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="disc-search" className="sr-only">Search questions</label>
              <input id="disc-search" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search questions…" aria-label="Search questions"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #d0d7e3", fontSize: ".9rem" }} />
            </div>

            {/* Topic tabs */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {TOPICS.map(t => (
                <button key={t} onClick={() => setTopic(t)}
                  style={{ padding: "6px 14px", borderRadius: 999, border: "1.5px solid", fontWeight: 700, fontSize: ".8rem", cursor: "pointer",
                    background: topic === t ? "#155eef" : "#fff", color: topic === t ? "#fff" : "#6b7c93",
                    borderColor: topic === t ? "#155eef" : "#d0d7e3" }}>
                  {t}
                </button>
              ))}
            </div>

            {/* Posts */}
            {loading ? (
              <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: 56 }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>💬</div>
                <p style={{ fontWeight: 700, color: "#071b33", marginBottom: 6 }}>No questions yet</p>
                <p style={{ color: "#6b7c93", fontSize: ".88rem" }}>Be the first to ask something.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {filtered.map(p => {
                  const tc = TOPIC_COLORS[p.topic] ?? TOPIC_COLORS["General"];
                  return (
                    <Link key={p.id} href={`/discussion/${p.id}`} style={{ textDecoration: "none" }}>
                      <div className="card" style={{ padding: "16px 20px", cursor: "pointer", transition: "box-shadow .15s" }}
                        onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(21,94,239,.12)")}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = "")}>
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <div style={{ minWidth: 48, textAlign: "center", padding: "8px 4px", borderRadius: 8, background: p.reply_count > 0 ? "#f0fdf4" : "#f8fafc", flexShrink: 0 }}>
                            <div style={{ fontSize: "1.1rem", fontWeight: 900, color: p.reply_count > 0 ? "#16a34a" : "#94a3b8" }}>{p.reply_count}</div>
                            <div style={{ fontSize: ".65rem", color: "#94a3b8", fontWeight: 600 }}>replies</div>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                              <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: ".71rem", fontWeight: 700, background: tc.bg, color: tc.color }}>{p.topic}</span>
                              {p.is_answered && <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: ".71rem", fontWeight: 700, background: "#d1fae5", color: "#065f46" }}>✓ Answered</span>}
                            </div>
                            <p style={{ fontWeight: 800, color: "#071b33", margin: "0 0 4px", fontSize: ".95rem" }}>{p.title}</p>
                            <p style={{ color: "#6b7c93", fontSize: ".8rem", margin: 0 }}>{p.author_name} · {timeAgo(p.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
