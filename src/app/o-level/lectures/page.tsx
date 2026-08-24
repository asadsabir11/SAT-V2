"use client";
import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHero } from "@/components/site";
import { getOLevelSubjects } from "@/lib/academy/data";
import type { AccessLevel } from "@/components/unlock-modal";

type OLevelCategory = "mathematics" | "computer-science" | "english-language" | "islamiyat" | "pakistan-studies" | "physics";

interface Lecture {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  program: "sat" | "o-level";
  category: OLevelCategory;
  order_index: number;
  created_at: string;
  is_locked?: boolean;
  is_free_preview?: boolean;
}

const SUBJECT_ICON: Record<OLevelCategory, string> = {
  mathematics: "📐",
  "computer-science": "💻",
  "english-language": "📖",
  islamiyat: "🕌",
  "pakistan-studies": "🌍",
  physics: "⚛️",
};

const SUBJECTS = getOLevelSubjects().map((s) => ({
  slug: s.slug as OLevelCategory,
  name: s.name,
}));

function LectureCard({ lec, index, onLockedClick }: { lec: Lecture; index: number; onLockedClick: () => void }) {
  const card = (
    <div
      className="card"
      style={{ padding: 0, overflow: "hidden", transition: "transform .15s, box-shadow .15s", cursor: "pointer", position: "relative" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(7,27,51,.12)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
    >
      <div style={{ aspectRatio: "16/9", background: "linear-gradient(135deg,#0c1629 0%,#1e3a5f 60%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        {lec.thumbnail_url && <img src={lec.thumbnail_url} alt={lec.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: lec.is_locked ? "blur(3px) brightness(.6)" : undefined }} />}
        <div style={{ position: "relative", width: 56, height: 56, borderRadius: "50%", background: "rgba(0,0,0,.45)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,.35)" }}>
          {lec.is_locked ? (
            <span style={{ fontSize: "1.4rem" }}>🔒</span>
          ) : (
            <div style={{ width: 0, height: 0, borderTop: "10px solid transparent", borderBottom: "10px solid transparent", borderLeft: "18px solid rgba(255,255,255,.9)", marginLeft: 4 }} />
          )}
        </div>
        <div style={{ position: "absolute", top: 10, left: 12, padding: "3px 10px", borderRadius: 999, background: "rgba(0,0,0,.45)", color: "#fff", fontSize: ".7rem", fontWeight: 800, letterSpacing: ".06em" }}>
          {SUBJECT_ICON[lec.category]} LESSON {index + 1}
        </div>
        {!lec.is_locked && lec.is_free_preview && (
          <div style={{ position: "absolute", top: 10, right: 12, padding: "3px 10px", borderRadius: 999, background: "#22c55e", color: "#fff", fontSize: ".68rem", fontWeight: 800 }}>FREE</div>
        )}
      </div>
      <div style={{ padding: "16px 18px 18px" }}>
        <h3 style={{ color: "#071b33", fontWeight: 800, fontSize: ".95rem", margin: "0 0 6px", lineHeight: 1.35 }}>{lec.title}</h3>
        {lec.description && (
          <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: "0 0 10px", lineHeight: 1.55 }}>
            {lec.description.length > 100 ? lec.description.slice(0, 100) + "…" : lec.description}
          </p>
        )}
        {lec.is_locked ? (
          <span style={{ fontSize: ".75rem", color: "#92400e", fontWeight: 700 }}>🔒 Unlock to watch</span>
        ) : (
          <span style={{ fontSize: ".75rem", color: "var(--blue)", fontWeight: 700 }}>Watch now →</span>
        )}
      </div>
    </div>
  );

  if (lec.is_locked) {
    return <div onClick={onLockedClick} style={{ textDecoration: "none" }}>{card}</div>;
  }
  return <Link href={`/lectures/${lec.id}`} style={{ textDecoration: "none" }}>{card}</Link>;
}

function OLevelLecturesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselect = searchParams.get("subject") as OLevelCategory | null;

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [oLevelAccess, setOLevelAccess] = useState<Record<string, AccessLevel>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<OLevelCategory>(
    preselect && SUBJECTS.some((s) => s.slug === preselect) ? preselect : SUBJECTS[0].slug
  );

  const load = useCallback(() => {
    fetch("/api/lectures")
      .then((r) => r.json())
      .then((d) => {
        setLectures((d.lectures ?? []).filter((l: Lecture) => l.program === "o-level"));
        setOLevelAccess(d.o_level_access ?? {});
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const byCategory = (cat: OLevelCategory) => lectures.filter((l) => l.category === cat);
  const visible = byCategory(tab);

  return (
    <>
      <PageHero eyebrow="O Level materials" title="Lessons" backHref="/o-level" backLabel="O Level">
        Recorded lessons for each O Level subject — watch on demand, rewatch, and take the quiz after each one. Unlock a subject to access its lessons.
      </PageHero>

      <section className="section">
        <div className="container">
          {/* Subject tabs */}
          <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
            {SUBJECTS.map(({ slug, name }) => {
              const active = tab === slug;
              const count = byCategory(slug).length;
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
                  {oLevelAccess[slug] !== "unlocked" && <span style={{ fontSize: ".85rem" }}>🔒</span>}
                  {count > 0 && <span style={{ padding: "2px 8px", borderRadius: 999, background: active ? "var(--blue)" : "#e8eef6", color: active ? "#fff" : "#6b7c93", fontSize: ".72rem", fontWeight: 800 }}>{count}</span>}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="card" style={{ maxWidth: 400 }}><p>Loading lessons…</p></div>
          ) : visible.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 56, maxWidth: 480 }}>
              <div style={{ fontSize: "3rem", marginBottom: 14 }}>{SUBJECT_ICON[tab]}</div>
              <h2 style={{ color: "#071b33", marginBottom: 8 }}>No lessons yet</h2>
              <p style={{ color: "#6b7c93" }}>Check back soon — lessons are added regularly.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {visible.map((lec, i) => (
                <LectureCard key={lec.id} lec={lec} index={i} onLockedClick={() => router.push(`/o-level/unlock?subject=${lec.category}`)} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function OLevelLecturesPage() {
  return (
    <Suspense fallback={<section className="section"><div className="container"><div className="card" style={{ maxWidth: 400 }}><p>Loading…</p></div></div></section>}>
      <OLevelLecturesInner />
    </Suspense>
  );
}
