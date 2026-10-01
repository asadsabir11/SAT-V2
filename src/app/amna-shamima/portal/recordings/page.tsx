import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPublishedRecordings } from "@/lib/amnaShamimaRecordings";

export const metadata: Metadata = { title: "Recordings", robots: { index: false, follow: false } };

function fmtWhen(d: string) {
  return new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
}

export default async function AmnaShamimaRecordingsPage() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "amna-shamima") {
    redirect("/login?role=student&program=amna-shamima&next=/amna-shamima/portal/recordings");
  }

  const recordings = await getPublishedRecordings();

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 700 }}>
        <Link href="/amna-shamima/portal" style={{ color: "#6b7c93", fontSize: ".85rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16, fontWeight: 600 }}>
          ← Portal
        </Link>

        <div className="card" style={{ marginBottom: 20, position: "relative", overflow: "hidden", padding: "24px 26px" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a855f7)", opacity: 0.08 }} />
          <div style={{ display: "flex", gap: 16, alignItems: "center", position: "relative" }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, flexShrink: 0, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", boxShadow: "0 8px 22px rgba(124,58,237,.35)" }}>
              🎥
            </div>
            <div>
              <h1 style={{ fontSize: "1.55rem", fontWeight: 900, color: "#071b33", margin: "0 0 3px", letterSpacing: "-.02em" }}>Recordings</h1>
              <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>Missed a class? Watch the recording here.</p>
            </div>
          </div>
        </div>

        {recordings.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 56 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🎥</div>
            <p style={{ fontWeight: 700, color: "#071b33", marginBottom: 6 }}>No recordings yet</p>
            <p style={{ color: "#6b7c93", fontSize: ".88rem" }}>Check back after your next class.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {recordings.map((r) => (
              <div key={r.id} className="card" style={{ padding: "18px 20px" }}>
                <p style={{ fontWeight: 800, color: "#071b33", margin: "0 0 4px", fontSize: ".98rem" }}>{r.title}</p>
                {r.description && <p style={{ color: "#6b7c93", fontSize: ".85rem", margin: "0 0 10px" }}>{r.description}</p>}
                <p style={{ color: "#a0aec0", fontSize: ".78rem", margin: "0 0 14px" }}>Added {fmtWhen(r.created_at)}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <a href={r.zoom_link} target="_blank" rel="noreferrer" style={{
                    display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10,
                    background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", fontWeight: 800, fontSize: ".85rem",
                    textDecoration: "none", boxShadow: "0 4px 14px rgba(124,58,237,.3)",
                  }}>
                    🎬 Watch Recording
                  </a>
                  {r.passcode && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, background: "#f5f3ff", color: "#6d28d9", fontWeight: 700, fontSize: ".85rem" }}>
                      🔑 Passcode: <strong style={{ letterSpacing: ".02em" }}>{r.passcode}</strong>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
