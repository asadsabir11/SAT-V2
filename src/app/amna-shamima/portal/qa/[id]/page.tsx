import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getQAPostById, getQAReplies } from "@/lib/amnaShamimaQA";

export const metadata: Metadata = { robots: { index: false, follow: false } };

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// Read-only for students — only staff reply, from /admin/amna-shamima-qa —
// so this is a plain server component with no client JS needed at all.
export default async function AmnaShamimaQAThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "amna-shamima") {
    redirect("/login?role=student&program=amna-shamima&next=/amna-shamima/portal/qa");
  }

  const { id } = await params;
  const post = await getQAPostById(id);
  if (!post) notFound();

  const replies = await getQAReplies(id);

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 800 }}>
        <Link href="/amna-shamima/portal/qa" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none", display: "block", marginBottom: 16 }}>
          ← Back to Q&amp;A board
        </Link>

        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 12 }}>
            {post.is_answered
              ? <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: "#d1fae5", color: "#065f46" }}>✓ Answered</span>
              : <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>⏳ Waiting for answer</span>}
          </div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#071b33", margin: "0 0 12px", lineHeight: 1.3 }}>{post.title}</h1>
          <p style={{ color: "#344054", lineHeight: 1.75, margin: "0 0 16px", whiteSpace: "pre-wrap" }}>{post.body}</p>
          {post.attachment_url && (
            <a href={post.attachment_url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, padding: "6px 12px", borderRadius: 8, background: "#f1f5f9", color: "#344054", fontWeight: 700, fontSize: ".82rem", textDecoration: "none" }}>
              📎 View attachment
            </a>
          )}
          <div>
            <span style={{ color: "#94a3b8", fontSize: ".78rem" }}>
              Asked by <strong style={{ color: "#6b7c93" }}>{post.author_name}</strong> · {timeAgo(post.created_at)}
            </span>
          </div>
        </div>

        <div>
          <p style={{ fontWeight: 800, color: "#071b33", margin: "0 0 12px", fontSize: ".9rem" }}>
            {replies.length} {replies.length === 1 ? "answer" : "answers"}
          </p>

          {replies.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 32, color: "#6b7c93" }}>
              <p style={{ margin: 0, fontSize: ".88rem" }}>No answer yet — your teacher will reply here soon.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {replies.map((r) => (
                <div key={r.id} className="card" style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: ".7rem", fontWeight: 800, background: "#d97706", color: "#fff" }}>Teacher</span>
                  </div>
                  <p style={{ color: "#344054", lineHeight: 1.75, margin: "0 0 12px", whiteSpace: "pre-wrap" }}>{r.body}</p>
                  {r.attachment_url && (
                    <a href={r.attachment_url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12, padding: "6px 12px", borderRadius: 8, background: "#f1f5f9", color: "#344054", fontWeight: 700, fontSize: ".82rem", textDecoration: "none" }}>
                      📎 View attachment
                    </a>
                  )}
                  <div>
                    <span style={{ color: "#94a3b8", fontSize: ".78rem" }}>
                      <strong style={{ color: "#6b7c93" }}>{r.author_name}</strong> · {timeAgo(r.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
