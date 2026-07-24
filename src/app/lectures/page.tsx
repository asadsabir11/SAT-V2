"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PageHero } from "@/components/site";
import { UnlockModal, type AccessLevel } from "@/components/unlock-modal";

type LectureCategory = "introduction" | "math" | "english";

interface Lecture {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  category: LectureCategory;
  is_free_preview: boolean;
  is_locked: boolean;
  order_index: number;
  created_at: string;
}

type Tab = LectureCategory;

const TAB_META: Record<Tab, { label: string; icon: string; color: string; bg: string; free?: boolean }> = {
  introduction: { label: "Introduction", icon: "📝", color: "#15803d", bg: "#dcfce7", free: true },
  math:         { label: "Math",         icon: "📐", color: "#1d4ed8", bg: "#dbeafe" },
  english:      { label: "English",      icon: "📖", color: "#7c3aed", bg: "#ede9fe" },
};

const TAB_ORDER: Tab[] = ["introduction", "math", "english"];

// ─── Lock Overlay ─────────────────────────────────────────────────────────────
function LockOverlay({ accessLevel, onUnlock }: { accessLevel: AccessLevel; onUnlock: () => void }) {
  const isPending = accessLevel === "pending";
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(7,27,51,.72)", backdropFilter: "blur(3px)", borderRadius: "inherit" }}>
      <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>{isPending ? "⏳" : "🔒"}</div>
      <p style={{ color: "#fff", fontWeight: 800, fontSize: ".82rem", margin: "0 0 12px", textAlign: "center", padding: "0 12px", lineHeight: 1.4 }}>
        {isPending ? "Verifying your payment…" : "Full access required"}
      </p>
      {!isPending && (
        <button onClick={onUnlock} style={{ padding: "8px 18px", background: "#155eef", color: "#fff", border: "none", borderRadius: 8, fontWeight: 800, fontSize: ".78rem", cursor: "pointer" }}>
          Unlock Full Access
        </button>
      )}
    </div>
  );
}

// ─── Lecture Card ─────────────────────────────────────────────────────────────
function LectureCard({ lec, index, accessLevel, onUnlock }: {
  lec: Lecture; index: number; accessLevel: AccessLevel; onUnlock: () => void;
}) {
  const meta = TAB_META[lec.category];
  const locked = lec.is_locked;

  const inner = (
    <div
      className="card"
      style={{ padding: 0, overflow: "hidden", transition: "transform .15s, box-shadow .15s", cursor: locked ? "default" : "pointer", position: "relative" }}
      onMouseEnter={e => { if (!locked) { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(7,27,51,.12)"; } }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
    >
      {locked && <LockOverlay accessLevel={accessLevel} onUnlock={onUnlock} />}

      {/* Thumbnail */}
      <div style={{ aspectRatio: "16/9", background: "linear-gradient(135deg,#0c1629 0%,#1e3a5f 60%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        {lec.thumbnail_url && <img src={lec.thumbnail_url} alt={lec.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: locked ? "blur(2px) brightness(.7)" : "none" }} />}
        <div style={{ position: "relative", width: 56, height: 56, borderRadius: "50%", background: "rgba(0,0,0,.45)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,.35)" }}>
          <div style={{ width: 0, height: 0, borderTop: "10px solid transparent", borderBottom: "10px solid transparent", borderLeft: "18px solid rgba(255,255,255,.9)", marginLeft: 4 }} />
        </div>
        <div style={{ position: "absolute", top: 10, left: 12, padding: "3px 10px", borderRadius: 999, background: "rgba(0,0,0,.45)", color: "#fff", fontSize: ".7rem", fontWeight: 800, letterSpacing: ".06em" }}>
          {meta.icon} {lec.category === "introduction" ? "INTRO" : "LECTURE"} {index + 1}
        </div>
        {/* FREE badge on intro or free-preview */}
        {!locked && (lec.category === "introduction" || lec.is_free_preview) && (
          <div style={{ position: "absolute", top: 10, right: 12, padding: "3px 10px", borderRadius: 999, background: "#22c55e", color: "#fff", fontSize: ".68rem", fontWeight: 800 }}>FREE</div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "16px 18px 18px" }}>
        <h3 style={{ color: locked ? "#a0aec0" : "#071b33", fontWeight: 800, fontSize: ".95rem", margin: "0 0 6px", lineHeight: 1.35 }}>{lec.title}</h3>
        {lec.description && (
          <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: "0 0 10px", lineHeight: 1.55 }}>
            {lec.description.length > 100 ? lec.description.slice(0, 100) + "…" : lec.description}
          </p>
        )}
        <span style={{ fontSize: ".75rem", color: locked ? "#a0aec0" : meta.color, fontWeight: 700 }}>
          {locked ? (accessLevel === "pending" ? "Verification pending" : "Locked") : "Watch now →"}
        </span>
      </div>
    </div>
  );

  if (locked) return <div onClick={accessLevel === "free" ? onUnlock : undefined}>{inner}</div>;
  return <Link href={`/lectures/${lec.id}`} style={{ textDecoration: "none" }}>{inner}</Link>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LecturesPage() {
  const [lectures, setLectures]       = useState<Lecture[]>([]);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("free");
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState<Tab>("introduction");
  const [showModal, setShowModal]     = useState(false);

  const load = useCallback(() => {
    fetch("/api/lectures")
      .then(r => r.json())
      .then(d => {
        setLectures(d.lectures ?? []);
        setAccessLevel(d.access_level ?? "free");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const byCategory = (cat: Tab) => lectures.filter(l => l.category === cat);
  const visible     = byCategory(tab);
  const lockedCount = lectures.filter(l => l.is_locked).length;

  return (
    <>
      {showModal && (
        <UnlockModal
          accessLevel={accessLevel}
          onClose={() => setShowModal(false)}
          onSubmitted={() => { setAccessLevel("pending"); load(); }}
        />
      )}

      <PageHero eyebrow="Your study library" title="Lectures">
        Watch your class recordings at any time. Each lecture is available on demand so you can rewatch, pause, and take notes at your own pace.
      </PageHero>

      <section className="section">
        <div className="container">

          {/* Access banner — only for Math/English when locked */}
          {!loading && accessLevel === "free" && lockedCount > 0 && (
            <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", padding: "16px 20px", borderRadius: 14, background: "linear-gradient(135deg,#071b33,#1e3a5f)", color: "#fff", marginBottom: 28 }}>
              <div>
                <p style={{ fontWeight: 800, fontSize: ".95rem", margin: "0 0 3px" }}>🔒 {lockedCount} lectures require full access</p>
                <p style={{ color: "#93c5fd", fontSize: ".83rem", margin: 0 }}>Unlock all Math &amp; English lectures, live sessions, Q&amp;A, and more.</p>
              </div>
              <button onClick={() => setShowModal(true)} style={{ padding: "10px 22px", background: "#155eef", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: ".88rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                Unlock Full Access
              </button>
            </div>
          )}

          {!loading && accessLevel === "pending" && (
            <div style={{ padding: "16px 20px", borderRadius: 14, background: "#fffbeb", border: "1.5px solid #fde68a", marginBottom: 28, display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: "1.3rem" }}>⏳</span>
              <div>
                <p style={{ fontWeight: 800, color: "#92400e", margin: "0 0 2px", fontSize: ".92rem" }}>Payment verification in progress</p>
                <p style={{ color: "#78350f", fontSize: ".83rem", margin: 0 }}>Your full access will unlock automatically once your payment is confirmed.</p>
              </div>
            </div>
          )}

          {/* Category tabs */}
          <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
            {TAB_ORDER.map(t => {
              const meta = TAB_META[t];
              const count = byCategory(t).length;
              const active = tab === t;
              return (
                <button key={t} onClick={() => setTab(t)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 12, fontWeight: 800, fontSize: ".92rem", cursor: "pointer", transition: "all .15s", border: active ? `2px solid ${meta.color}` : "2px solid #e8eef6", background: active ? meta.bg : "#f8fafc", color: active ? meta.color : "#6b7c93", boxShadow: active ? `0 2px 12px ${meta.color}22` : "none" }}>
                  <span style={{ fontSize: "1.1rem" }}>{meta.icon}</span>
                  {meta.label}
                  {meta.free && <span style={{ padding: "2px 7px", borderRadius: 999, background: "#22c55e", color: "#fff", fontSize: ".65rem", fontWeight: 800 }}>FREE</span>}
                  {count > 0 && <span style={{ padding: "2px 8px", borderRadius: 999, background: active ? meta.color : "#e8eef6", color: active ? "#fff" : "#6b7c93", fontSize: ".72rem", fontWeight: 800 }}>{count}</span>}
                </button>
              );
            })}
          </div>

          {/* Intro description */}
          {tab === "introduction" && !loading && (
            <div style={{ padding: "14px 18px", borderRadius: 12, background: "#f0fdf4", border: "1.5px solid #86efac", marginBottom: 24, display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: "1.1rem" }}>🎁</span>
              <p style={{ color: "#15803d", fontSize: ".88rem", fontWeight: 600, margin: 0 }}>
                These videos are completely free — no payment needed. Watch them to get a feel for the programme.
              </p>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="card" style={{ maxWidth: 400 }}><p>Loading lectures…</p></div>
          ) : visible.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 56, maxWidth: 480 }}>
              <div style={{ fontSize: "3rem", marginBottom: 14 }}>{TAB_META[tab].icon}</div>
              <h2 style={{ color: "#071b33", marginBottom: 8 }}>No {TAB_META[tab].label} lectures yet</h2>
              <p style={{ color: "#6b7c93" }}>Check back soon — lectures are added regularly.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {visible.map((lec, i) => (
                <LectureCard key={lec.id} lec={lec} index={i} accessLevel={accessLevel} onUnlock={() => setShowModal(true)} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
