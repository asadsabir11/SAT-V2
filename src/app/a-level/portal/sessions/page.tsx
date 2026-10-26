"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/site";

interface Session {
  id: string;
  title: string;
  description: string;
  meeting_link: string;
  platform: "zoom" | "google_classroom" | "google_meet" | "other";
  scheduled_at: string;
  is_active: boolean;
}

const PLATFORM_LABEL: Record<Session["platform"], string> = {
  zoom: "Zoom", google_classroom: "Google Classroom", google_meet: "Google Meet", other: "Online",
};

function fmt(d: string) {
  return new Date(d).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
}

export default function ALevelSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [access, setAccess] = useState<"free" | "pending" | "unlocked">("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/a-level/sessions")
      .then((r) => r.json())
      .then((d) => { setSessions(d.sessions ?? []); setAccess(d.access ?? "free"); })
      .finally(() => setLoading(false));
  }, []);

  const locked = !loading && access !== "unlocked";

  return (
    <>
      <PageHero eyebrow="A Level live sessions" title="Join your live classes" backHref="/a-level/portal" backLabel="Portal">
        Live classes and office hours for A Level Computer Science.
      </PageHero>

      <section className="section">
        <div className="container" style={{ maxWidth: 700 }}>
          {loading ? (
            <div className="card" style={{ maxWidth: 400 }}><p>Loading sessions…</p></div>
          ) : locked ? (
            <div className="card" style={{ textAlign: "center", padding: 56 }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔒</div>
              <p style={{ fontWeight: 700, color: "#071b33", marginBottom: 6 }}>
                {access === "pending" ? "Payment under review" : "Full access required"}
              </p>
              <p style={{ color: "#6b7c93", fontSize: ".88rem", marginBottom: 16 }}>
                {access === "pending" ? "We're verifying your payment — session links will appear here once unlocked." : "Unlock full access to see your class links."}
              </p>
              {access !== "pending" && <Link href="/a-level/portal/unlock" className="btn btn-primary" style={{ background: "#be123c", borderColor: "#be123c" }}>Unlock Full Access →</Link>}
            </div>
          ) : sessions.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>
              <div style={{ fontSize: "2rem", marginBottom: 10 }}>📅</div>
              <p style={{ fontWeight: 700 }}>No sessions scheduled yet</p>
              <p style={{ fontSize: ".88rem" }}>Check back soon, or message us on WhatsApp.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {sessions.map((s) => (
                <div key={s.id} className="card" style={{ padding: "18px 20px", display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ fontSize: "1.8rem" }}>📅</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, color: "#071b33", margin: "0 0 4px" }}>{s.title}</p>
                    {s.description && <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: "0 0 4px" }}>{s.description}</p>}
                    <p style={{ color: "#a0aec0", fontSize: ".78rem", margin: 0 }}>{PLATFORM_LABEL[s.platform]} · {fmt(s.scheduled_at)}</p>
                  </div>
                  <a href={s.meeting_link} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ flexShrink: 0, background: "#be123c", borderColor: "#be123c" }}>
                    Join →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
