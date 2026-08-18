"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { UnlockModal, LockedBanner, type AccessLevel } from "@/components/unlock-modal";

type Platform = "zoom" | "google_classroom" | "google_meet" | "other";

interface LiveSession {
  id: string;
  title: string;
  description: string;
  meeting_link: string;
  platform: Platform;
  scheduled_at: string;
  is_active: boolean;
}

const PLATFORM_META: Record<Platform, { label: string; icon: string; color: string; bg: string }> = {
  zoom:             { label: "Zoom",             icon: "💻", color: "#1d4ed8", bg: "#dbeafe" },
  google_classroom: { label: "Google Classroom", icon: "🎓", color: "#065f46", bg: "#d1fae5" },
  google_meet:      { label: "Google Meet",      icon: "🎥", color: "#7c3aed", bg: "#ede9fe" },
  other:            { label: "Other",            icon: "🔗", color: "#92400e", bg: "#fef3c7" },
};

function timeUntil(dateStr: string): { label: string; isNow: boolean; isPast: boolean } {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0 && diff > -3600000) return { label: "Happening now!", isNow: true, isPast: false };
  if (diff < 0) return { label: "Session ended", isNow: false, isPast: true };
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d >= 1) return { label: `In ${d} day${d > 1 ? "s" : ""}`, isNow: false, isPast: false };
  if (h >= 1) return { label: `In ${h} hour${h > 1 ? "s" : ""}`, isNow: false, isPast: false };
  const m = Math.floor(diff / 60000);
  return { label: `In ${m} minute${m !== 1 ? "s" : ""}`, isNow: false, isPast: false };
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("free");
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(() => {
    fetch("/api/sessions")
      .then(r => r.json())
      .then(d => {
        setSessions(d.sessions ?? []);
        setAccessLevel(d.access_level ?? "free");
        setLocked(d.locked === true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const upcoming = sessions.filter(s => new Date(s.scheduled_at).getTime() > Date.now() - 3600000);
  const past     = sessions.filter(s => new Date(s.scheduled_at).getTime() <= Date.now() - 3600000);

  return (
    <section className="section">
      {showModal && (
        <UnlockModal
          accessLevel={accessLevel}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="container" style={{ maxWidth: 760 }}>
        <div style={{ marginBottom: 32 }}>
          <Link href="/sat" style={{ display: "inline-block", marginBottom: 8, color: "#6b7c93", fontSize: ".82rem", fontWeight: 600, textDecoration: "none" }}>← SAT toolkit</Link>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 900, color: "#071b33", margin: "0 0 6px", letterSpacing: "-.03em" }}>Live Sessions</h1>
          <p style={{ color: "#6b7c93", fontSize: ".92rem", margin: 0 }}>Join live classes, tutoring sessions, and Q&amp;A calls with your instructor.</p>
        </div>

        {/* Access banners */}
        {!loading && locked && (
          <LockedBanner accessLevel={accessLevel} onUnlock={() => setShowModal(true)} />
        )}

        {loading ? (
          <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>Loading sessions…</div>
        ) : locked ? (
          /* Locked state preview */
          <div style={{ position: "relative" }}>
            <div style={{ filter: "blur(3px)", pointerEvents: "none", userSelect: "none", opacity: .45 }}>
              {/* Ghost sessions to show what's behind the lock */}
              {[1, 2].map(i => (
                <div key={i} className="card" style={{ padding: "20px 22px", marginBottom: 14 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "#e8eef6" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 14, background: "#e8eef6", borderRadius: 4, width: "60%", marginBottom: 10 }} />
                      <div style={{ height: 10, background: "#e8eef6", borderRadius: 4, width: "40%" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
              <div style={{ fontSize: "2.5rem" }}>📅</div>
              <p style={{ fontWeight: 800, color: "#071b33", fontSize: "1rem", margin: 0 }}>Live sessions are for paid students</p>
              <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>Join live classes and Q&amp;A calls once your access is unlocked.</p>
              <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: 4 }}>Unlock Full Access</button>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 56 }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>📅</div>
            <p style={{ fontWeight: 700, color: "#071b33", marginBottom: 6 }}>No sessions scheduled yet</p>
            <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>Check back soon — live sessions will appear here when scheduled.</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <p style={{ fontSize: ".75rem", fontWeight: 800, color: "#155eef", textTransform: "uppercase", letterSpacing: ".12em", margin: "0 0 12px" }}>Upcoming &amp; Live</p>
                <div style={{ display: "grid", gap: 14, marginBottom: 36 }}>
                  {upcoming.map(s => <SessionCard key={s.id} s={s} />)}
                </div>
              </>
            )}
            {past.length > 0 && (
              <>
                <p style={{ fontSize: ".75rem", fontWeight: 800, color: "#a0aec0", textTransform: "uppercase", letterSpacing: ".12em", margin: "0 0 12px" }}>Past sessions</p>
                <div style={{ display: "grid", gap: 12, opacity: .7 }}>
                  {past.map(s => <SessionCard key={s.id} s={s} isPast />)}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function SessionCard({ s, isPast }: { s: LiveSession; isPast?: boolean }) {
  const p = PLATFORM_META[s.platform] ?? PLATFORM_META.other;
  const { label: timeLabel, isNow } = timeUntil(s.scheduled_at);

  return (
    <div className="card" style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>
          {p.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8, alignItems: "center" }}>
            <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: ".71rem", fontWeight: 800, background: p.bg, color: p.color }}>{p.label}</span>
            {isNow && <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: ".71rem", fontWeight: 800, background: "#fee2e2", color: "#dc2626", animation: "pulse 2s ease-in-out infinite" }}>● Live now</span>}
            {!isPast && !isNow && <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: ".71rem", fontWeight: 700, background: "#f1f5f9", color: "#475569" }}>{timeLabel}</span>}
          </div>
          <p style={{ fontWeight: 800, color: "#071b33", margin: "0 0 4px", fontSize: "1rem" }}>{s.title}</p>
          {s.description && <p style={{ color: "#6b7c93", fontSize: ".85rem", margin: "0 0 8px", lineHeight: 1.5 }}>{s.description}</p>}
          <p style={{ color: "#a0aec0", fontSize: ".78rem", margin: "0 0 14px" }}>
            📅 {new Date(s.scheduled_at).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
          </p>
          {!isPast ? (
            <a href={s.meeting_link} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 10, fontWeight: 800, fontSize: ".88rem", background: isNow ? "#dc2626" : "#155eef", color: "#fff", textDecoration: "none", boxShadow: isNow ? "0 4px 16px #dc262640" : "0 4px 16px #155eef30" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = ".88")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
              {isNow ? "Join now →" : `Join on ${p.label} →`}
            </a>
          ) : (
            <span style={{ fontSize: ".8rem", color: "#a0aec0", fontStyle: "italic" }}>Session has ended</span>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}
