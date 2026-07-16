"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/site";

interface Lecture {
  id: string;
  title: string;
  description: string;
  video_url: string;
  order_index: number;
  created_at: string;
}

export default function LecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/lectures")
      .then(r => r.json())
      .then(d => setLectures(d.lectures ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHero eyebrow="Your study library" title="Lectures">
        Watch your class recordings at any time. Each lecture is available on demand so you can rewatch, pause, and take notes at your own pace.
      </PageHero>

      <section className="section">
        <div className="container">
          {loading ? (
            <div className="card" style={{ maxWidth: 400 }}><p>Loading lectures…</p></div>
          ) : lectures.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 56, maxWidth: 480 }}>
              <div style={{ fontSize: "3rem", marginBottom: 14 }}>🎬</div>
              <h2 style={{ color: "#071b33", marginBottom: 8 }}>No lectures yet</h2>
              <p style={{ color: "#6b7c93" }}>Your instructor hasn't published any lectures yet. Check back soon.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {lectures.map((lec, i) => (
                <Link key={lec.id} href={`/lectures/${lec.id}`} style={{ textDecoration: "none" }}>
                  <div className="card" style={{ padding: 0, overflow: "hidden", transition: "transform .15s, box-shadow .15s", cursor: "pointer" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(7,27,51,.12)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
                  >
                    {/* Thumbnail */}
                    <div style={{ aspectRatio: "16/9", background: "linear-gradient(135deg,#0c1629 0%,#1e3a5f 60%,#155eef22 100%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,.12)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,.2)" }}>
                        <div style={{ width: 0, height: 0, borderTop: "10px solid transparent", borderBottom: "10px solid transparent", borderLeft: "18px solid rgba(255,255,255,.9)", marginLeft: 4 }} />
                      </div>
                      <div style={{ position: "absolute", top: 10, left: 12, padding: "3px 10px", borderRadius: 999, background: "rgba(0,0,0,.45)", color: "#fff", fontSize: ".7rem", fontWeight: 800, letterSpacing: ".06em" }}>
                        LECTURE {i + 1}
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: "16px 18px 18px" }}>
                      <h3 style={{ color: "#071b33", fontWeight: 800, fontSize: ".95rem", margin: "0 0 6px", lineHeight: 1.35 }}>{lec.title}</h3>
                      {lec.description && (
                        <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: "0 0 10px", lineHeight: 1.55 }}>
                          {lec.description.length > 100 ? lec.description.slice(0, 100) + "…" : lec.description}
                        </p>
                      )}
                      <span style={{ fontSize: ".75rem", color: "#155eef", fontWeight: 700 }}>Watch now →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
