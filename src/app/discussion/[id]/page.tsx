"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";

const TOPIC_COLORS: Record<string, { bg: string; color: string }> = {
  "Math":             { bg: "#dbeafe", color: "#1d4ed8" },
  "Reading & Writing":{ bg: "#ede9fe", color: "#7c3aed" },
  "Test Strategy":    { bg: "#fef3c7", color: "#92400e" },
  "General":          { bg: "#f1f5f9", color: "#475569" },
};

interface Post {
  id: string; title: string; body: string; topic: string;
  author_name: string; author_email: string; is_answered: boolean;
  reply_count: number; created_at: string;
}
interface Reply {
  id: string; body: string; author_name: string; author_email: string;
  is_best_answer: boolean; is_instructor: boolean; created_at: string;
}
interface Me { email: string; role: string; name: string; }

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function DiscussionPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/discussion/${id}`).then(r => r.json()),
      fetch("/api/auth/me").then(r => r.json()),
    ]).then(([d, auth]) => {
      setPost(d.post); setReplies(d.replies ?? []);
      setMe(auth.user ?? null);
    }).finally(() => setLoading(false));
  }, [id]);

  async function submitReply() {
    if (!replyBody.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/discussion/${id}/reply`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: replyBody }),
    });
    const { id: rid } = await res.json();
    const newReply: Reply = {
      id: rid, body: replyBody, author_name: me?.name ?? "You",
      author_email: me?.email ?? "", is_best_answer: false,
      is_instructor: me?.role === "founder", created_at: new Date().toISOString(),
    };
    setReplies(r => [...r, newReply]);
    setReplyBody("");
    setSubmitting(false);
  }

  async function markBest(replyId: string) {
    await fetch(`/api/discussion/${id}/reply/${replyId}`, { method: "PATCH" });
    setReplies(r => r.map(x => ({ ...x, is_best_answer: x.id === replyId })));
    setPost(p => p ? { ...p, is_answered: true } : p);
  }

  async function deleteReply(replyId: string) {
    if (!confirm("Delete this reply?")) return;
    await fetch(`/api/discussion/${id}/reply/${replyId}`, { method: "DELETE" });
    setReplies(r => r.filter(x => x.id !== replyId));
  }

  async function deletePost() {
    if (!confirm("Delete this question and all replies?")) return;
    await fetch(`/api/discussion/${id}`, { method: "DELETE" });
    window.location.href = "/discussion";
  }

  if (loading) return <section className="section"><div className="container" style={{ maxWidth: 800 }}><div className="card" style={{ padding: 40, textAlign: "center", color: "#6b7c93" }}>Loading…</div></div></section>;
  if (!post) return <section className="section"><div className="container" style={{ maxWidth: 800 }}><div className="card" style={{ padding: 40, textAlign: "center", color: "#6b7c93" }}>Question not found.</div></div></section>;

  const tc = TOPIC_COLORS[post.topic] ?? TOPIC_COLORS["General"];
  const isFounder = me?.role === "founder";
  const bestFirst = [...replies].sort((a, b) => (b.is_best_answer ? 1 : 0) - (a.is_best_answer ? 1 : 0));

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 800 }}>

        {/* Breadcrumb */}
        <Link href="/discussion" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none", display: "block", marginBottom: 16 }}>
          ← Back to Q&A board
        </Link>

        {/* Question */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
            <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: tc.bg, color: tc.color }}>{post.topic}</span>
            {post.is_answered && <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: "#d1fae5", color: "#065f46" }}>✓ Answered</span>}
          </div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#071b33", margin: "0 0 12px", lineHeight: 1.3 }}>{post.title}</h1>
          <p style={{ color: "#344054", lineHeight: 1.75, margin: "0 0 16px", whiteSpace: "pre-wrap" }}>{post.body}</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span style={{ color: "#94a3b8", fontSize: ".78rem" }}>
              Asked by <strong style={{ color: "#6b7c93" }}>{post.author_name}</strong> · {timeAgo(post.created_at)}
            </span>
            {(isFounder || me?.email === post.author_email) && (
              <button onClick={deletePost}
                style={{ padding: "4px 10px", borderRadius: 6, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".75rem", cursor: "pointer" }}>
                Delete question
              </button>
            )}
          </div>
        </div>

        {/* Replies */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontWeight: 800, color: "#071b33", margin: "0 0 12px", fontSize: ".9rem" }}>
            {replies.length} {replies.length === 1 ? "answer" : "answers"}
          </p>

          {bestFirst.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 32, color: "#6b7c93" }}>
              <p style={{ margin: 0, fontSize: ".88rem" }}>No answers yet — be the first to help!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {bestFirst.map(r => (
                <div key={r.id} className="card" style={{
                  padding: "16px 20px",
                  border: r.is_best_answer ? "2px solid #16a34a" : undefined,
                  background: r.is_best_answer ? "#f0fdf4" : undefined,
                }}>
                  {r.is_best_answer && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <span style={{ fontSize: "1rem" }}>✅</span>
                      <span style={{ fontSize: ".75rem", fontWeight: 800, color: "#16a34a", textTransform: "uppercase", letterSpacing: ".08em" }}>Best answer</span>
                    </div>
                  )}
                  <p style={{ color: "#344054", lineHeight: 1.75, margin: "0 0 12px", whiteSpace: "pre-wrap" }}>{r.body}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {r.is_instructor && (
                        <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: ".7rem", fontWeight: 800, background: "#155eef", color: "#fff" }}>Instructor</span>
                      )}
                      <span style={{ color: "#94a3b8", fontSize: ".78rem" }}>
                        <strong style={{ color: "#6b7c93" }}>{r.author_name}</strong> · {timeAgo(r.created_at)}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {isFounder && !r.is_best_answer && (
                        <button onClick={() => markBest(r.id)}
                          style={{ padding: "4px 10px", borderRadius: 6, background: "#d1fae5", border: "none", color: "#065f46", fontWeight: 700, fontSize: ".75rem", cursor: "pointer" }}>
                          ✓ Mark best
                        </button>
                      )}
                      {(isFounder || me?.email === r.author_email) && (
                        <button onClick={() => deleteReply(r.id)}
                          style={{ padding: "4px 10px", borderRadius: 6, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".75rem", cursor: "pointer" }}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply form */}
        <div className="card">
          <h3 style={{ margin: "0 0 14px", color: "#071b33", fontSize: "1rem" }}>Your answer</h3>
          <textarea value={replyBody} onChange={e => setReplyBody(e.target.value)}
            placeholder="Write a clear, helpful answer…"
            rows={4} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d0d7e3", fontSize: ".9rem", fontFamily: "inherit", resize: "vertical", marginBottom: 12 }} />
          <button className="btn btn-primary" onClick={submitReply} disabled={submitting || !replyBody.trim()}>
            {submitting ? "Posting…" : "Post answer"}
          </button>
        </div>

      </div>
    </section>
  );
}
