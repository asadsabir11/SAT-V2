import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { findByField } from "@/lib/storage";
import { subjectsForStudyGroup } from "@/lib/punjab9thSessions";

export const metadata: Metadata = { title: "My Account", robots: { index: false, follow: false } };

const WHATSAPP_LINK = "https://wa.me/923316663291?text=Assalam-oAlaikum%2C%20mujhe%209th%20Class%20online%20program%20ki%20details%20chahiye.";

interface Punjab9thLead { studyGroup: string; }

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
  const subjects = subjectsForStudyGroup(lead?.studyGroup ?? "Biology");

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 780 }}>
        <div className="card" style={{ textAlign: "center", padding: "40px 32px", marginBottom: 24 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>🎓</div>
          <h1 style={{ margin: "0 0 8px", color: "#071b33" }}>Welcome, {session!.name.split(" ")[0]}!</h1>
          <p style={{ color: "#344054", lineHeight: 1.7, margin: "0 auto 20px" }}>
            {lead ? `You're registered for the ${lead.studyGroup} group.` : "Your account is set up."} Pick a subject
            below to see its class and Zoom link. For anything else, the fastest way to reach us is WhatsApp.
          </p>
          <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ display: "inline-flex", padding: "10px 20px" }}>
            Message Us on WhatsApp →
          </a>
        </div>

        <h2 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#071b33", margin: "0 0 14px" }}>Your subjects</h2>
        <div className="grid grid-3">
          {subjects.map((subject) => (
            <Link
              key={subject}
              href={`/punjab-board-9th-class/portal/${encodeURIComponent(subject)}`}
              className="card"
              style={{ display: "flex", flexDirection: "column", gap: 8, textDecoration: "none" }}
            >
              <div className="icon">📘</div>
              <h3 style={{ margin: 0, color: "#071b33" }}>{subject}</h3>
              <span style={{ marginTop: "auto", fontWeight: 700, fontSize: ".85rem", color: "#155eef" }}>View class →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
