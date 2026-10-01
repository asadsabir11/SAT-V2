import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAnnouncements } from "@/lib/announcements";
import { PageHero } from "@/components/site";

export const metadata: Metadata = { title: "My Account", robots: { index: false, follow: false } };

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// Deliberately its own page rather than the shared /dashboard — that page is
// built entirely around the SAT/O-Level content model. This program has no
// fee gating, no subjects, no quizzes — just lectures, the online class, and
// study material — so the portal is intentionally just permanent cards, no
// dashboard stats.
export default async function AmnaShamimaPortal() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "amna-shamima") {
    redirect("/login?role=student&program=amna-shamima&next=/amna-shamima/portal");
  }

  const announcements = await getAnnouncements("amna-shamima");

  return (
    <>
      <PageHero eyebrow="🤖 AI Course · Amna Shamima Foundation" title={`Welcome, ${session!.name.split(" ")[0]}!`}>
        Watch lectures at your own pace, or join the live online class.
      </PageHero>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ maxWidth: 700 }}>
          {announcements.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              {announcements.map((a) => (
                <div key={a.id} style={{
                  display: "flex", gap: 14, alignItems: "flex-start",
                  background: "#fffbeb", border: "1.5px solid #fde68a",
                  borderRadius: 12, padding: "14px 18px", marginBottom: 10,
                }}>
                  <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>📢</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, color: "#92400e", margin: "0 0 3px", fontSize: ".92rem" }}>{a.title}</p>
                    <p style={{ color: "#78350f", fontSize: ".85rem", margin: "0 0 4px", lineHeight: 1.5 }}>{a.body}</p>
                    <span style={{ color: "#b45309", fontSize: ".72rem" }}>{timeAgo(a.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-3">
            <Link
              href="/amna-shamima/portal/lectures"
              className="module-card fade-up"
              style={{ "--module-accent": "#7c3aed", "--module-accent-grad": "linear-gradient(135deg,#7c3aed,#a855f7)", "--module-glow": "rgba(124,58,237,.35)" } as CSSProperties}
            >
              <article className="card" style={{ height: "100%" }}>
                <div className="module-icon">🎥</div>
                <h3>Lectures</h3>
                <p>Watch recorded video lessons at your own pace.</p>
                <span className="module-arrow" style={{ color: "#7c3aed", fontWeight: 700, fontSize: ".85rem" }}>Open →</span>
              </article>
            </Link>
            <Link
              href="/amna-shamima/portal/online-class"
              className="module-card fade-up"
              style={{ "--module-accent": "#059669", "--module-accent-grad": "linear-gradient(135deg,#059669,#10b981)", "--module-glow": "rgba(5,150,105,.35)" } as CSSProperties}
            >
              <article className="card" style={{ height: "100%" }}>
                <div className="module-icon">💻</div>
                <h3>Online Class</h3>
                <p>Join the live class and ask questions in real time.</p>
                <span className="module-arrow" style={{ color: "#059669", fontWeight: 700, fontSize: ".85rem" }}>Open →</span>
              </article>
            </Link>
            <Link
              href="/amna-shamima/portal/materials"
              className="module-card fade-up"
              style={{ "--module-accent": "#d97706", "--module-accent-grad": "linear-gradient(135deg,#d97706,#f59e0b)", "--module-glow": "rgba(217,119,6,.35)" } as CSSProperties}
            >
              <article className="card" style={{ height: "100%" }}>
                <div className="module-icon">📄</div>
                <h3>Study Material</h3>
                <p>View or download PDFs and images shared by your teacher.</p>
                <span className="module-arrow" style={{ color: "#d97706", fontWeight: 700, fontSize: ".85rem" }}>Open →</span>
              </article>
            </Link>
            <Link
              href="/amna-shamima/portal/qa"
              className="module-card fade-up"
              style={{ "--module-accent": "#dc2626", "--module-accent-grad": "linear-gradient(135deg,#dc2626,#f87171)", "--module-glow": "rgba(220,38,38,.35)" } as CSSProperties}
            >
              <article className="card" style={{ height: "100%" }}>
                <div className="module-icon">💬</div>
                <h3>Ask a Question</h3>
                <p>Post a question and get an answer from your teacher.</p>
                <span className="module-arrow" style={{ color: "#dc2626", fontWeight: 700, fontSize: ".85rem" }}>Open →</span>
              </article>
            </Link>
            <Link
              href="/amna-shamima/portal/assignments"
              className="module-card fade-up"
              style={{ "--module-accent": "#0e7490", "--module-accent-grad": "linear-gradient(135deg,#0e7490,#06b6d4)", "--module-glow": "rgba(14,116,144,.35)" } as CSSProperties}
            >
              <article className="card" style={{ height: "100%" }}>
                <div className="module-icon">📋</div>
                <h3>Assignments</h3>
                <p>Submit your work and see your grades.</p>
                <span className="module-arrow" style={{ color: "#0e7490", fontWeight: 700, fontSize: ".85rem" }}>Open →</span>
              </article>
            </Link>
            <Link
              href="/amna-shamima/portal/recordings"
              className="module-card fade-up"
              style={{ "--module-accent": "#1d4ed8", "--module-accent-grad": "linear-gradient(135deg,#1d4ed8,#38bdf8)", "--module-glow": "rgba(29,78,216,.35)" } as CSSProperties}
            >
              <article className="card" style={{ height: "100%" }}>
                <div className="module-icon">🎥</div>
                <h3>Recordings</h3>
                <p>Missed a class? Watch the recording here.</p>
                <span className="module-arrow" style={{ color: "#1d4ed8", fontWeight: 700, fontSize: ".85rem" }}>Open →</span>
              </article>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
