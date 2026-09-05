import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { findByField } from "@/lib/storage";
import { subjectsForStudyGroup, subjectSlugToLabel, getActivePunjab9thSessionsForSubjectAndGroup } from "@/lib/punjab9thSessions";
import { getPunjab9thAccessLevel } from "@/lib/punjab9thAccess";

interface Punjab9thLead { studyGroup: string; }

export const metadata: Metadata = { robots: { index: false, follow: false } };

function fmtWhen(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function Punjab9thSubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "punjab-9th") {
    redirect("/login?role=student&program=punjab-9th&next=/punjab-board-9th-class/portal");
  }

  const { subject: slug } = await params;
  const subject = subjectSlugToLabel(slug);
  const lead = await findByField<Punjab9thLead>("leads-punjab-9th.json", "studentEmail", session!.email);
  const group = lead?.studyGroup ?? "Biology";

  // Only allow subjects that resolve to a real slug AND are actually part
  // of this student's group — guards against both a bad slug and someone
  // hand-editing the URL to a subject that isn't theirs (e.g. a
  // Biology-group student trying /portal/computer-science).
  if (!subject || !subjectsForStudyGroup(group).includes(subject)) {
    notFound();
  }

  const accessLevel = await getPunjab9thAccessLevel(session!.email);
  const unlocked = accessLevel === "unlocked";
  const sessions = unlocked ? await getActivePunjab9thSessionsForSubjectAndGroup(subject, group) : [];

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <Link href="/punjab-board-9th-class/portal" style={{ color: "#6b7c93", fontSize: ".85rem", textDecoration: "none" }}>← Your subjects</Link>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "10px 0 24px" }}>{subject}</h1>

        {!unlocked ? (
          <div className="card" style={{ textAlign: "center", padding: 40, background: "linear-gradient(135deg,#fff7ed,#eaf4ff)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔒</div>
            <p style={{ fontWeight: 800, color: "#9a3412", marginBottom: 8, fontSize: "1.05rem" }}>
              {accessLevel === "pending" ? "Payment under review" : "Full access required"}
            </p>
            <p style={{ color: "#7c4a1e", lineHeight: 1.65, maxWidth: 420, margin: "0 auto 20px" }}>
              {accessLevel === "pending"
                ? "We're verifying your payment — the Zoom link for this subject will appear here once your account is unlocked."
                : `Unlock full access to see the class and Zoom link for ${subject}.`}
            </p>
            {accessLevel !== "pending" && (
              <Link href="/punjab-board-9th-class/portal/unlock" className="btn btn-primary">Unlock Full Access →</Link>
            )}
          </div>
        ) : sessions.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>📅</div>
            <p style={{ fontWeight: 700 }}>No class scheduled yet for {subject}</p>
            <p style={{ fontSize: ".88rem" }}>Once your batch timing is set, the Zoom link will appear here — we&apos;ll also message your parent on WhatsApp.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {sessions.map((s) => (
              <div key={s.id} className="card" style={{ padding: "20px 24px" }}>
                <p style={{ margin: "0 0 4px", fontWeight: 900, color: "#071b33", fontSize: "1.05rem" }}>{s.title}</p>
                <p style={{ margin: "0 0 16px", color: "#6b7c93", fontSize: ".9rem" }}>{fmtWhen(s.scheduled_at)}</p>
                <a href={s.meeting_link} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: "10px 22px" }}>
                  Join Zoom →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
