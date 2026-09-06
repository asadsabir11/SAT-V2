import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { findByField } from "@/lib/storage";
import { subjectEntriesForStudyGroup } from "@/lib/punjab9thSessions";
import { getPunjab9thAccessLevel } from "@/lib/punjab9thAccess";
import { PageHero } from "@/components/site";

export const metadata: Metadata = { title: "My Account", robots: { index: false, follow: false } };

const WHATSAPP_LINK = "https://wa.me/923316663291?text=Assalam-oAlaikum%2C%20mujhe%209th%20Class%20online%20program%20ki%20details%20chahiye.";

interface Punjab9thLead { studyGroup: string; }

const SUBJECT_THEME: Record<string, { icon: string; accent: string; grad: string; glow: string }> = {
  "english": { icon: "📖", accent: "#155eef", grad: "linear-gradient(135deg,#155eef,#18a999)", glow: "rgba(21,94,239,.35)" },
  "urdu": { icon: "🖋️", accent: "#7c3aed", grad: "linear-gradient(135deg,#7c3aed,#a855f7)", glow: "rgba(124,58,237,.35)" },
  "maths": { icon: "➗", accent: "#ea580c", grad: "linear-gradient(135deg,#ea580c,#f59e0b)", glow: "rgba(234,88,12,.35)" },
  "physics": { icon: "⚛️", accent: "#0e7490", grad: "linear-gradient(135deg,#0e7490,#06b6d4)", glow: "rgba(14,116,144,.35)" },
  "chemistry": { icon: "🧪", accent: "#059669", grad: "linear-gradient(135deg,#059669,#10b981)", glow: "rgba(5,150,105,.35)" },
  "biology": { icon: "🧬", accent: "#dc2626", grad: "linear-gradient(135deg,#dc2626,#f87171)", glow: "rgba(220,38,38,.35)" },
  "computer-science": { icon: "💻", accent: "#1d4ed8", grad: "linear-gradient(135deg,#1d4ed8,#38bdf8)", glow: "rgba(29,78,216,.35)" },
  "islamiat": { icon: "🕌", accent: "#15803d", grad: "linear-gradient(135deg,#15803d,#65a30d)", glow: "rgba(21,128,61,.35)" },
  "tarjuma-tul-quran-or-ethics": { icon: "📜", accent: "#b45309", grad: "linear-gradient(135deg,#b45309,#d97706)", glow: "rgba(180,83,9,.35)" },
};
const DEFAULT_THEME = { icon: "📘", accent: "#155eef", grad: "linear-gradient(135deg,#155eef,#18a999)", glow: "rgba(21,94,239,.35)" };

// Deliberately its own page rather than the shared /dashboard — that page
// (and /lectures, /quizzes, /sessions, etc.) is built entirely around the
// SAT/O-Level content model, which doesn't exist for this program yet.
// Shows one permanent card per subject in the student's registered group
// (always visible, regardless of whether a class is scheduled yet) — each
// links through to that subject's own page, which is where the actual
// Zoom link (once one exists) is shown.
export default async function Punjab9thPortal() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "punjab-9th") {
    redirect("/login?role=student&program=punjab-9th&next=/punjab-board-9th-class/portal");
  }

  const lead = await findByField<Punjab9thLead>("leads-punjab-9th.json", "studentEmail", session!.email);
  const subjects = subjectEntriesForStudyGroup(lead?.studyGroup ?? "Biology");
  const accessLevel = await getPunjab9thAccessLevel(session!.email);
  const unlocked = accessLevel === "unlocked";

  return (
    <>
      <PageHero
        eyebrow={`🎓 9th Class · ${lead ? lead.studyGroup : "Your"} Group`}
        title={`Welcome, ${session!.name.split(" ")[0]}!`}
        actions={
          <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ display: "inline-flex", padding: "10px 20px" }}>
            Message Us on WhatsApp →
          </a>
        }
      >
        Pick a subject below to see its class and quizzes. For anything else, the fastest way to reach us is WhatsApp.
      </PageHero>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ maxWidth: 780 }}>
        {!unlocked && (
          <div className="card" style={{ marginBottom: 24, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, background: accessLevel === "pending" ? "#fffbeb" : "#fff7ed", borderColor: accessLevel === "pending" ? "#fde68a" : "#fed7aa" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 800, color: accessLevel === "pending" ? "#92400e" : "#9a3412" }}>
                {accessLevel === "pending" ? "⏳ Payment under review" : "🔒 Full access required"}
              </p>
              <p style={{ margin: "4px 0 0", color: accessLevel === "pending" ? "#78350f" : "#7c4a1e", fontSize: ".85rem" }}>
                {accessLevel === "pending"
                  ? "We're verifying your payment. This usually takes a business day."
                  : "Unlock to see Zoom links for all your subjects."}
              </p>
            </div>
            {accessLevel !== "pending" && (
              <Link href="/punjab-board-9th-class/portal/unlock" className="btn btn-primary" style={{ padding: "10px 22px", flexShrink: 0 }}>
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

        <h2 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#071b33", margin: "0 0 14px" }}>Your subjects</h2>
        <div className="grid grid-3">
          {subjects.map((subject) => {
            const theme = SUBJECT_THEME[subject.slug] ?? DEFAULT_THEME;
            return (
              <Link
                key={subject.slug}
                href={`/punjab-board-9th-class/portal/${subject.slug}`}
                className="module-card fade-up"
                style={{ "--module-accent": theme.accent, "--module-accent-grad": theme.grad, "--module-glow": theme.glow } as CSSProperties}
              >
                <article className="card" style={{ height: "100%", position: "relative", overflow: "hidden", opacity: unlocked ? 1 : 0.82 }}>
                  <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: theme.grad, opacity: 0.1 }} />
                  <div className="module-icon" style={!unlocked ? { background: "linear-gradient(135deg,#94a3b8,#cbd5e1)", boxShadow: "none" } : undefined}>
                    {unlocked ? theme.icon : "🔒"}
                  </div>
                  <h3 style={{ margin: "14px 0 0", color: "#071b33" }}>{subject.label}</h3>
                  <span className="module-arrow" style={{ marginTop: 10, display: "inline-flex", fontWeight: 700, fontSize: ".85rem", color: unlocked ? theme.accent : "#9a3412" }}>
                    {unlocked ? "View class →" : "Locked →"}
                  </span>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
      </section>
    </>
  );
}
