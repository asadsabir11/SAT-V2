import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getALevelAccessLevel } from "@/lib/aLevelAccess";
import { getAnnouncements } from "@/lib/announcements";
import { PageHero } from "@/components/site";

export const metadata: Metadata = { title: "My Account", robots: { index: false, follow: false } };

const WHATSAPP_LINK = "https://wa.me/923316663291?text=Assalam-oAlaikum%2C%20mujhe%20A%20Level%20Computer%20Science%20program%20ki%20details%20chahiye.";

const MODULES = [
  { href: "/a-level/portal/lectures", icon: "🎬", title: "Lectures", description: "Watch recorded lessons on demand, anytime.", accent: "#be123c", grad: "linear-gradient(135deg,#be123c,#fb7185)", glow: "rgba(190,18,60,.35)" },
  { href: "/a-level/portal/quizzes", icon: "📝", title: "Quizzes", description: "Practice with topic quizzes and track your best scores.", accent: "#7c3aed", grad: "linear-gradient(135deg,#7c3aed,#a855f7)", glow: "rgba(124,58,237,.35)" },
  { href: "/a-level/portal/sessions", icon: "📅", title: "Live Sessions", description: "Join live classes and office hours.", accent: "#059669", grad: "linear-gradient(135deg,#059669,#10b981)", glow: "rgba(5,150,105,.35)" },
  { href: "/a-level/portal/past-papers", icon: "📄", title: "Past Papers", description: "Practice with past-paper style questions.", accent: "#ea580c", grad: "linear-gradient(135deg,#ea580c,#f59e0b)", glow: "rgba(234,88,12,.35)" },
  { href: "/a-level/portal/assignments", icon: "📋", title: "Assignments", description: "Submit your work and see your grades.", accent: "#1d4ed8", grad: "linear-gradient(135deg,#1d4ed8,#38bdf8)", glow: "rgba(29,78,216,.35)" },
];

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function ALevelPortal() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "a-level") {
    redirect("/login?role=student&program=a-level&next=/a-level/portal");
  }

  const accessLevel = await getALevelAccessLevel(session!.email);
  const unlocked = accessLevel === "unlocked";
  const announcements = await getAnnouncements("a-level");

  return (
    <>
      <PageHero
        eyebrow="🎯 A Level · Computer Science"
        title={`Welcome, ${session!.name.split(" ")[0]}!`}
        actions={
          <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ display: "inline-flex", padding: "10px 20px" }}>
            Message Us on WhatsApp →
          </a>
        }
      >
        Open any module below. For anything else, the fastest way to reach us is WhatsApp.
      </PageHero>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ maxWidth: 900 }}>
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

          {!unlocked && (
            <div className="card" style={{ marginBottom: 24, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, background: accessLevel === "pending" ? "#fffbeb" : "#fff1f2", borderColor: accessLevel === "pending" ? "#fde68a" : "#fecdd3" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 800, color: accessLevel === "pending" ? "#92400e" : "#9f1239" }}>
                  {accessLevel === "pending" ? "⏳ Payment under review" : "🔒 Full access required"}
                </p>
                <p style={{ margin: "4px 0 0", color: accessLevel === "pending" ? "#78350f" : "#9d174d", fontSize: ".85rem" }}>
                  {accessLevel === "pending"
                    ? "We're verifying your payment. This usually takes a business day."
                    : "Unlock to see lessons, quizzes, past papers and class links."}
                </p>
              </div>
              {accessLevel !== "pending" && (
                <Link href="/a-level/portal/unlock" className="btn btn-primary" style={{ padding: "10px 22px", flexShrink: 0, background: "#be123c", borderColor: "#be123c" }}>
                  Unlock Full Access →
                </Link>
              )}
            </div>
          )}

          <Link
            href="/fees"
            className="module-card fade-up"
            style={{ "--module-accent": "#0e7490", "--module-accent-grad": "linear-gradient(135deg,#0e7490,#06b6d4)", "--module-glow": "rgba(14,116,144,.35)", display: "block", marginBottom: 24 } as CSSProperties}
          >
            <article className="card" style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 16, padding: "18px 22px" }}>
              <div className="module-icon" style={{ flexShrink: 0 }}>💰</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, color: "#071b33" }}>Fees</h3>
                <p style={{ margin: "2px 0 0", color: "#6b7c93", fontSize: ".85rem" }}>View your fee challans and submit payment proof</p>
              </div>
              <span className="module-arrow" style={{ fontWeight: 700, fontSize: ".85rem", color: "#0e7490", flexShrink: 0 }}>Open →</span>
            </article>
          </Link>

          <div className="grid grid-3">
            {MODULES.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="module-card fade-up"
                style={{ "--module-accent": m.accent, "--module-accent-grad": m.grad, "--module-glow": m.glow } as CSSProperties}
              >
                <article className="card" style={{ height: "100%", opacity: unlocked ? 1 : 0.85 }}>
                  <div className="module-icon">{unlocked ? m.icon : "🔒"}</div>
                  <h3>{m.title}</h3>
                  <p>{m.description}</p>
                  <span className="module-arrow" style={{ color: m.accent, fontWeight: 700, fontSize: ".85rem" }}>{unlocked ? "Open →" : "Locked →"}</span>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
