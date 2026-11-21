import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPunjab9thAccessLevel } from "@/lib/punjab9thAccess";
import { PRIVATE_CLASS_SCHEDULE_9TH } from "@/lib/privateClassSchedule";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Punjab9thPrivateClassPage() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "punjab-9th") {
    redirect("/login?role=student&program=punjab-9th&next=/punjab-board-9th-class/portal/private-class");
  }

  const accessLevel = await getPunjab9thAccessLevel(session!.email);
  const unlocked = accessLevel === "unlocked";

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <Link href="/punjab-board-9th-class/portal" style={{ color: "#6b7c93", fontSize: ".85rem", textDecoration: "none" }}>← Your portal</Link>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "10px 0 24px" }}>Private Class</h1>

        {!unlocked ? (
          <div className="card" style={{ textAlign: "center", padding: 40, background: "linear-gradient(135deg,#fff7ed,#eaf4ff)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔒</div>
            <p style={{ fontWeight: 800, color: "#9a3412", marginBottom: 8, fontSize: "1.05rem" }}>
              {accessLevel === "pending" ? "Payment under review" : "Full access required"}
            </p>
            <p style={{ color: "#7c4a1e", lineHeight: 1.65, maxWidth: 420, margin: "0 auto 20px" }}>
              {accessLevel === "pending"
                ? "We're verifying your payment — the private class Zoom links will appear here once your account is unlocked."
                : "Unlock full access to see the Zoom links for your private classes."}
            </p>
            {accessLevel !== "pending" && (
              <Link href="/punjab-board-9th-class/portal/unlock" className="btn btn-primary">Unlock Full Access →</Link>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {PRIVATE_CLASS_SCHEDULE_9TH.map((slot) => (
              <div key={slot.subject} className="card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <p style={{ margin: "0 0 4px", fontWeight: 900, color: "#071b33", fontSize: "1.05rem" }}>{slot.subject}</p>
                  <p style={{ margin: 0, color: "#6b7c93", fontSize: ".9rem" }}>Every {slot.day} · {slot.time} (PKT)</p>
                </div>
                <a href={slot.zoomUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: "10px 22px", flexShrink: 0 }}>
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
