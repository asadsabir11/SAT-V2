import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "My Account", robots: { index: false, follow: false } };

const WHATSAPP_LINK = "https://wa.me/923316663291?text=Assalam-oAlaikum%2C%20mujhe%209th%20Class%20online%20program%20ki%20details%20chahiye.";

// Deliberately its own page rather than the shared /dashboard — that page
// (and /lectures, /quizzes, /sessions, etc.) is built entirely around the
// SAT/O-Level content model, which doesn't exist for this program yet
// (phase 1 is online classes coordinated over WhatsApp, nothing on-platform
// to browse). This just confirms the account is real and working, and
// points back to WhatsApp, matching how the rest of this module runs.
export default async function Punjab9thPortal() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "punjab-9th") {
    redirect("/login?role=student&program=punjab-9th&next=/punjab-board-9th-class/portal");
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="card" style={{ textAlign: "center", padding: "48px 32px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>🎓</div>
          <h1 style={{ margin: "0 0 8px", color: "#071b33" }}>Welcome, {session!.name.split(" ")[0]}!</h1>
          <p style={{ color: "#344054", lineHeight: 1.7, margin: "0 auto 24px" }}>
            Your account is set up. Class timings, joining instructions and any updates for the Punjab Board 9th
            Class program are sent directly to your parent&apos;s WhatsApp — that&apos;s still the fastest way to reach
            the admissions team.
          </p>
          <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: "inline-flex", padding: "12px 24px" }}>
            Message Us on WhatsApp →
          </a>
        </div>
      </div>
    </section>
  );
}
