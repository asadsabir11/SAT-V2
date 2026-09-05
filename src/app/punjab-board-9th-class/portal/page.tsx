import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { findByField } from "@/lib/storage";
import { getActivePunjab9thSessionsForGroup } from "@/lib/punjab9thSessions";
import { Punjab9thClassSchedule } from "@/components/Punjab9thClassSchedule";

export const metadata: Metadata = { title: "My Account", robots: { index: false, follow: false } };

const WHATSAPP_LINK = "https://wa.me/923316663291?text=Assalam-oAlaikum%2C%20mujhe%209th%20Class%20online%20program%20ki%20details%20chahiye.";

interface Punjab9thLead { studyGroup: string; }

// Deliberately its own page rather than the shared /dashboard — that page
// (and /lectures, /quizzes, /sessions, etc.) is built entirely around the
// SAT/O-Level content model, which doesn't exist for this program yet.
// This shows the student's live class schedule (subject, time, Join Zoom
// link) filtered to their registered group, and otherwise points back to
// WhatsApp for anything else.
export default async function Punjab9thPortal() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "punjab-9th") {
    redirect("/login?role=student&program=punjab-9th&next=/punjab-board-9th-class/portal");
  }

  const lead = await findByField<Punjab9thLead>("leads-punjab-9th.json", "studentEmail", session!.email);
  const sessions = lead ? await getActivePunjab9thSessionsForGroup(lead.studyGroup) : [];

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="card" style={{ textAlign: "center", padding: "40px 32px", marginBottom: 24 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>🎓</div>
          <h1 style={{ margin: "0 0 8px", color: "#071b33" }}>Welcome, {session!.name.split(" ")[0]}!</h1>
          <p style={{ color: "#344054", lineHeight: 1.7, margin: "0 auto 20px" }}>
            {lead ? `You're registered for the ${lead.studyGroup} group.` : "Your account is set up."} Your class
            schedule is below — join any class using its Zoom link. For anything else, the fastest way to reach us
            is WhatsApp.
          </p>
          <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ display: "inline-flex", padding: "10px 20px" }}>
            Message Us on WhatsApp →
          </a>
        </div>

        <h2 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#071b33", margin: "0 0 14px" }}>Your class schedule</h2>
        <Punjab9thClassSchedule sessions={sessions} />
      </div>
    </section>
  );
}
