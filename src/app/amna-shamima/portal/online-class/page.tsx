import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getActiveAmnaShamimaSessions } from "@/lib/amnaShamimaSessions";

export const metadata: Metadata = { title: "Online Class", robots: { index: false, follow: false } };

function fmtWhen(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function AmnaShamimaOnlineClassPage() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "amna-shamima") {
    redirect("/login?role=student&program=amna-shamima&next=/amna-shamima/portal/online-class");
  }

  const sessions = await getActiveAmnaShamimaSessions();

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <Link href="/amna-shamima/portal" style={{ color: "#6b7c93", fontSize: ".85rem", textDecoration: "none" }}>← Portal</Link>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "10px 0 24px" }}>Online Class</h1>

        {sessions.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>📅</div>
            <p style={{ fontWeight: 700 }}>No class scheduled yet</p>
            <p style={{ fontSize: ".88rem" }}>Once your class timing is set, the join link will appear here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {sessions.map((s) => (
              <div key={s.id} className="card" style={{ padding: "20px 24px" }}>
                <p style={{ margin: "0 0 4px", fontWeight: 900, color: "#071b33", fontSize: "1.05rem" }}>{s.title}</p>
                {s.description && <p style={{ margin: "0 0 8px", color: "#6b7c93", fontSize: ".85rem" }}>{s.description}</p>}
                <p style={{ margin: "0 0 16px", color: "#6b7c93", fontSize: ".9rem" }}>{fmtWhen(s.scheduled_at)}</p>
                <a href={s.meeting_link} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: "10px 22px" }}>
                  Join Class →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
