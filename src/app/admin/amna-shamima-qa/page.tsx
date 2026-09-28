"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";

interface Post {
  id: string; title: string; body: string; attachment_url: string | null;
  author_name: string; author_email: string; is_answered: boolean;
  reply_count: number; created_at: string;
}
interface Reply {
  id: string; body: string; attachment_url: string | null; author_name: string; created_at: string;
}

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminAmnaShamimaQA() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unanswered">("all");

  const [openId, setOpenId] = useState<string | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replyAttachment, setReplyAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const replyAttachRef = useRef<HTMLInputElement>(null);

  function loadPosts() {
    return fetch("/api/amna-shamima/qa").then((r) => r.json()).then((d) => setPosts(d.posts ?? []));
  }

  useEffect(() => {
    loadPosts().finally(() => setLoading(false));
  }, []);

  async function openThread(id: string) {
    if (openId === id) { setOpenId(null); return; }
    setOpenId(id);
    setReplyBody("");
    setReplyAttachment(null);
    setSubmitError("");
    setLoadingThread(true);
    const d = await fetch(`/api/amna-shamima/qa/${id}`).then((r) => r.json());
    setReplies(d.replies ?? []);
    setLoadingThread(false);
  }

  async function submitReply(postId: string) {
    if (!replyBody.trim()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      let attachmentUrl = "";
      if (replyAttachment) {
        const blob = await upload(replyAttachment.name, replyAttachment, {
          access: "public",
          handleUploadUrl: "/api/amna-shamima/materials/upload",
        }).catch((e) => { throw new Error(`Attachment upload failed: ${e?.message ?? e}`); });
        attachmentUrl = blob.url;
      }
      const res = await fetch(`/api/amna-shamima/qa/${postId}/reply`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: replyBody, attachment_url: attachmentUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitError(data.error ?? "Failed to post."); setSubmitting(false); return; }
      setReplies((r) => [...r, { id: data.id, body: replyBody, attachment_url: attachmentUrl || null, author_name: "You", created_at: new Date().toISOString() }]);
      setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, is_answered: true, reply_count: p.reply_count + 1 } : p)));
      setReplyBody("");
      setReplyAttachment(null);
      if (replyAttachRef.current) replyAttachRef.current.value = "";
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteReply(postId: string, replyId: string) {
    if (!confirm("Delete this reply?")) return;
    await fetch(`/api/amna-shamima/qa/${postId}/reply/${replyId}`, { method: "DELETE" });
    setReplies((r) => r.filter((x) => x.id !== replyId));
    setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, reply_count: Math.max(0, p.reply_count - 1) } : p)));
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this question and all replies?")) return;
    await fetch(`/api/amna-shamima/qa/${id}`, { method: "DELETE" });
    setPosts((ps) => ps.filter((p) => p.id !== id));
    if (openId === id) setOpenId(null);
  }

  const visible = filter === "unanswered" ? posts.filter((p) => !p.is_answered) : posts;
  const unansweredCount = posts.filter((p) => !p.is_answered).length;

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 820 }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>Amna Shamima — Q&amp;A</h1>
          <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>
            {posts.length} question{posts.length === 1 ? "" : "s"} · {unansweredCount} waiting for an answer
          </p>
        </div>

        {!loading && posts.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {([["all", "All"], ["unanswered", `Unanswered (${unansweredCount})`]] as [typeof filter, string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                style={{
                  padding: "7px 16px", borderRadius: 999, fontWeight: 700, fontSize: ".82rem", cursor: "pointer",
                  border: filter === val ? "2px solid #d97706" : "2px solid #e8eef6",
                  background: filter === val ? "#fffbeb" : "#fff",
                  color: filter === val ? "#92400e" : "#6b7c93",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="card"><p>Loading…</p></div>
        ) : visible.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>💬</div>
            <p style={{ fontWeight: 700 }}>{filter === "unanswered" ? "Nothing waiting for an answer" : "No questions yet"}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {visible.map((p) => (
              <div key={p.id} className="card" style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{ flex: 1, cursor: "pointer" }} onClick={() => openThread(p.id)}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                      {p.is_answered
                        ? <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: ".71rem", fontWeight: 700, background: "#d1fae5", color: "#065f46" }}>✓ Answered</span>
                        : <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: ".71rem", fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>⏳ Waiting</span>}
                      <span style={{ color: "#a0aec0", fontSize: ".75rem" }}>{p.reply_count} repl{p.reply_count === 1 ? "y" : "ies"}</span>
                    </div>
                    <p style={{ fontWeight: 800, color: "#071b33", margin: "0 0 4px", fontSize: ".95rem" }}>{p.title}</p>
                    <p style={{ color: "#6b7c93", fontSize: ".85rem", margin: "0 0 4px" }}>{p.body}</p>
                    {p.attachment_url && (
                      <a href={p.attachment_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center", gap: 4, margin: "0 0 4px", color: "#344054", fontWeight: 700, fontSize: ".78rem", textDecoration: "none" }}>
                        📎 View attachment
                      </a>
                    )}
                    <br />
                    <span style={{ color: "#a0aec0", fontSize: ".75rem" }}>{p.author_name} ({p.author_email}) · {timeAgo(p.created_at)}</span>
                  </div>
                  <button onClick={() => deletePost(p.id)} style={{ padding: "6px 12px", borderRadius: 8, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".78rem", cursor: "pointer", flexShrink: 0 }}>
                    Delete
                  </button>
                </div>

                {openId === p.id && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e8eef6" }}>
                    {loadingThread ? (
                      <p style={{ color: "#6b7c93", fontSize: ".88rem" }}>Loading replies…</p>
                    ) : (
                      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
                        {replies.map((r) => (
                          <div key={r.id} style={{ padding: "12px 14px", borderRadius: 8, background: "#f8fafc" }}>
                            <p style={{ color: "#344054", fontSize: ".88rem", margin: "0 0 8px", whiteSpace: "pre-wrap" }}>{r.body}</p>
                            {r.attachment_url && (
                              <a href={r.attachment_url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 8, color: "#344054", fontWeight: 700, fontSize: ".78rem", textDecoration: "none" }}>
                                📎 View attachment
                              </a>
                            )}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ color: "#a0aec0", fontSize: ".72rem" }}>{r.author_name} · {timeAgo(r.created_at)}</span>
                              <button onClick={() => deleteReply(p.id, r.id)} style={{ padding: "3px 9px", borderRadius: 6, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".72rem", cursor: "pointer" }}>
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <textarea
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder="Write your answer…"
                      rows={3}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d0d7e3", fontSize: ".88rem", fontFamily: "inherit", resize: "vertical", marginBottom: 10 }}
                    />
                    <div
                      onClick={() => replyAttachRef.current?.click()}
                      style={{ border: `2px dashed ${replyAttachment ? "#10b981" : "#c8d5e3"}`, borderRadius: 8, padding: "10px 14px", cursor: "pointer", background: replyAttachment ? "#f0fdf4" : "#f8fafc", marginBottom: 10 }}
                    >
                      <span style={{ fontSize: ".82rem", fontWeight: 700, color: replyAttachment ? "#065f46" : "#6b7c93" }}>
                        {replyAttachment ? `📎 ${replyAttachment.name} · Click to change` : "📎 Attach a file (optional)"}
                      </span>
                    </div>
                    <input ref={replyAttachRef} type="file" accept="application/pdf,image/*" style={{ display: "none" }} onChange={(e) => setReplyAttachment(e.target.files?.[0] ?? null)} />
                    {submitError && <p style={{ color: "#dc2626", fontWeight: 600, fontSize: ".82rem", marginBottom: 10 }}>⚠ {submitError}</p>}
                    <button className="btn btn-primary" onClick={() => submitReply(p.id)} disabled={submitting || !replyBody.trim()} style={{ padding: "8px 18px", fontSize: ".85rem" }}>
                      {submitting ? "Posting…" : "Post answer"}
                    </button>
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
