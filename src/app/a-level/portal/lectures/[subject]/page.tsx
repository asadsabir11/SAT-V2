"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHero } from "@/components/site";

type Category = "computer-science-vol1" | "computer-science-vol2";
const SUBJECT_LABELS: Record<Category, string> = {
  "computer-science-vol1": "Computer Science (CS 9618 Vol 1)",
  "computer-science-vol2": "Computer Science (CS 9618 Vol 2)",
};

interface Lecture {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  program: "a-level";
  category: Category;
  order_index: number;
  created_at: string;
  is_locked?: boolean;
  is_free_preview?: boolean;
}

function LectureCard({ lec, index, onLockedClick }: { lec: Lecture; index: number; onLockedClick: (category: Category) => void }) {
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
          💻 LESSON {index + 1}
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
          <span style={{ fontSize: ".75rem", color: "#9f1239", fontWeight: 700 }}>🔒 Unlock to watch</span>
        ) : (
          <span style={{ fontSize: ".75rem", color: "#be123c", fontWeight: 700 }}>Watch now →</span>
        )}
      </div>
    </div>
  );

  if (lec.is_locked) {
    return <div onClick={() => onLockedClick(lec.category)} style={{ textDecoration: "none" }}>{card}</div>;
  }
  return <Link href={`/lectures/${lec.id}`} style={{ textDecoration: "none" }}>{card}</Link>;
}

export default function ALevelVolumeLecturesPage() {
  const params = useParams<{ subject: string }>();
  const category = params.subject as Category;
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch("/api/lectures")
      .then((r) => r.json())
      .then((d) => {
        setLectures((d.lectures ?? []).filter((l: Lecture) => l.program === "a-level" && l.category === category));
      })
      .finally(() => setLoading(false));
  }, [category]);

  useEffect(() => { load(); }, [load]);

  if (!SUBJECT_LABELS[category]) {
    return (
      <section className="section">
        <div className="container">
          <div className="card" style={{ maxWidth: 480, textAlign: "center", padding: 40 }}>
            <p style={{ fontWeight: 800, color: "#071b33", marginBottom: 8 }}>Not found</p>
            <Link href="/a-level/portal/lectures" className="btn btn-primary">Back to Lessons →</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHero eyebrow="A Level materials" title={SUBJECT_LABELS[category]} backHref="/a-level/portal/lectures" backLabel="Lessons">
        Recorded lessons for {SUBJECT_LABELS[category]} — watch on demand and rewatch anytime.
      </PageHero>

      <section className="section">
        <div className="container">
          {loading ? (
            <div className="card" style={{ maxWidth: 400 }}><p>Loading lessons…</p></div>
          ) : lectures.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 56, maxWidth: 480 }}>
              <div style={{ fontSize: "3rem", marginBottom: 14 }}>💻</div>
              <h2 style={{ color: "#071b33", marginBottom: 8 }}>No lessons yet</h2>
              <p style={{ color: "#6b7c93" }}>Check back soon — lessons are added regularly.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {lectures.map((lec, i) => (
                <LectureCard key={lec.id} lec={lec} index={i} onLockedClick={(cat) => { window.location.href = `/a-level/portal/unlock?subject=${cat}`; }} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
