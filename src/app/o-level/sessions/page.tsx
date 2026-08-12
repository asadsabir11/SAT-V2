"use client";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { PageHero } from "@/components/site";
import { getOLevelSubjects } from "@/lib/academy/data";

type OLevelCategory = "mathematics" | "computer-science" | "english-language" | "islamiyat" | "pakistan-studies";
type Platform = "zoom" | "google_classroom" | "google_meet" | "other";

interface LiveSession {
  id: string;
  title: string;
  description: string;
  meeting_link: string;
  platform: Platform;
  scheduled_at: string;
  is_active: boolean;
  subject: OLevelCategory | null;
}

const SUBJECT_ICON: Record<OLevelCategory, string> = {
  mathematics: "📐",
  "computer-science": "💻",
  "english-language": "📖",
  islamiyat: "🕌",
  "pakistan-studies": "🌍",
};
const SUBJECTS = getOLevelSubjects().map((s) => ({ slug: s.slug as OLevelCategory, name: s.name }));

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

function SessionCard({ s }: { s: LiveSession }) {
  const p = PLATFORM_META[s.platform] ?? PLATFORM_META.other;
  const { label: timeLabel, isNow, isPast } = timeUntil(s.scheduled_at);

  return (
    <div className="card" style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>
          {p.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8, alignItems: "center" }}>
            <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: ".71rem", fontWeight: 800, background: p.bg, color: p.color }}>{p.label}</span>
            {isNow && <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: ".71rem", fontWeight: 800, background: "#fee2e2", color: "#dc2626" }}>● Live now</span>}
            {!isPast && !isNow && <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: ".71rem", fontWeight: 700, background: "#f1f5f9", color: "#475569" }}>{timeLabel}</span>}
          </div>
          <p style={{ fontWeight: 800, color: "#071b33", margin: "0 0 4px", fontSize: "1rem" }}>{s.title}</p>
          {s.description && <p style={{ color: "#6b7c93", fontSize: ".85rem", margin: "0 0 8px", lineHeight: 1.5 }}>{s.description}</p>}
          <p style={{ color: "#a0aec0", fontSize: ".78rem", margin: "0 0 14px" }}>
            📅 {new Date(s.scheduled_at).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
          </p>
          {!isPast ? (
            <a href={s.meeting_link} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 10, fontWeight: 800, fontSize: ".88rem", background: isNow ? "#dc2626" : "var(--blue)", color: "#fff", textDecoration: "none" }}>
              {isNow ? "Join now →" : `Join on ${p.label} →`}
            </a>
          ) : (
            <span style={{ fontSize: ".8rem", color: "#a0aec0", fontStyle: "italic" }}>Session has ended</span>
          )}
        </div>
      </div>
    </div>
  );
}

function OLevelSessionsInner() {
  const searchParams = useSearchParams();
  const preselect = searchParams.get("subject") as OLevelCategory | null;

  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<OLevelCategory>(
    preselect && SUBJECTS.some((s) => s.slug === preselect) ? preselect : SUBJECTS[0].slug
  );

  const load = useCallback(() => {
    fetch("/api/sessions?program=o-level")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const bySubject = (subj: OLevelCategory) => sessions.filter((s) => s.subject === subj);
  const visible = bySubject(tab);
  const upcoming = visible.filter((s) => new Date(s.scheduled_at).getTime() > Date.now() - 3600000);
  const past = visible.filter((s) => new Date(s.scheduled_at).getTime() <= Date.now() - 3600000);

  return (
    <>
      <PageHero eyebrow="O Level live sessions" title="Live Sessions">
        Join live classes and office hours with your teacher. Open to any enrolled student.
      </PageHero>

      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
            {SUBJECTS.map(({ slug, name }) => {
              const active = tab === slug;
              return (
                <button
                  key={slug}
                  onClick={() => setTab(slug)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 12, fontWeight: 800, fontSize: ".88rem", cursor: "pointer", transition: "all .15s",
                    border: active ? "2px solid var(--blue)" : "2px solid #e8eef6",
                    background: active ? "#eff6ff" : "#f8fafc",
                    color: active ? "var(--blue)" : "#6b7c93",
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{SUBJECT_ICON[slug]}</span>
                  {name}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>Loading sessions…</div>
          ) : visible.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 56 }}>
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>{SUBJECT_ICON[tab]}</div>
              <p style={{ fontWeight: 700, color: "#071b33", marginBottom: 6 }}>No sessions scheduled yet</p>
              <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>Check back soon — live sessions will appear here when scheduled.</p>
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <>
                  <p style={{ fontSize: ".75rem", fontWeight: 800, color: "var(--blue)", textTransform: "uppercase", letterSpacing: ".12em", margin: "0 0 12px" }}>Upcoming &amp; Live</p>
                  <div style={{ display: "grid", gap: 14, marginBottom: 36 }}>
                    {upcoming.map((s) => <SessionCard key={s.id} s={s} />)}
                  </div>
                </>
              )}
              {past.length > 0 && (
                <>
                  <p style={{ fontSize: ".75rem", fontWeight: 800, color: "#a0aec0", textTransform: "uppercase", letterSpacing: ".12em", margin: "0 0 12px" }}>Past sessions</p>
                  <div style={{ display: "grid", gap: 12, opacity: 0.7 }}>
                    {past.map((s) => <SessionCard key={s.id} s={s} />)}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default function OLevelSessionsPage() {
  return (
    <Suspense fallback={<section className="section"><div className="container"><div className="card" style={{ maxWidth: 400 }}><p>Loading…</p></div></div></section>}>
      <OLevelSessionsInner />
    </Suspense>
  );
}
