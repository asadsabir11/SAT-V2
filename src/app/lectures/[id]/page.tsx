"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";

interface Lecture {
  id: string;
  title: string;
  description: string;
  video_url: string;
  order_index: number;
  created_at: string;
}

export default function WatchLecture({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [allLectures, setAllLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/lectures/${id}`).then(r => r.json()),
      fetch("/api/lectures").then(r => r.json()),
    ]).then(([lec, all]) => {
      if (lec.error) { setNotFound(true); }
      else { setLecture(lec.lecture); }
      setAllLectures(all.lectures ?? []);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <section className="section"><div className="container"><div className="card" style={{ maxWidth: 400 }}><p>Loading lecture…</p></div></div></section>;
  }

  if (notFound || !lecture) {
    return (
      <section className="section">
        <div className="container">
          <div className="card" style={{ maxWidth: 400, textAlign: "center", padding: 40 }}>
            <p style={{ fontWeight: 700, marginBottom: 12 }}>Lecture not found.</p>
            <Link href="/lectures" style={{ color: "#155eef", fontWeight: 700 }}>← Back to lectures</Link>
          </div>
        </div>
      </section>
    );
  }

  const currentIndex = allLectures.findIndex(l => l.id === id);
  const prevLec = currentIndex > 0 ? allLectures[currentIndex - 1] : null;
  const nextLec = currentIndex < allLectures.length - 1 ? allLectures[currentIndex + 1] : null;

  return (
    <section className="section">
      <div className="container">
        <Link href="/lectures" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none", display: "inline-block", marginBottom: 16 }}>
          ← All lectures
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>

          {/* Main player */}
          <div>
            {/* Video */}
            <div style={{ borderRadius: 14, overflow: "hidden", background: "#000", boxShadow: "0 8px 40px rgba(7,27,51,.18)", marginBottom: 20 }}>
              <video
                key={lecture.video_url}
                controls
                style={{ width: "100%", display: "block", maxHeight: 520 }}
                preload="metadata"
              >
                <source src={lecture.video_url} />
                Your browser does not support the video player.
              </video>
            </div>

            {/* Title & info */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: ".75rem", fontWeight: 800, color: "#155eef", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>
                Lecture {currentIndex + 1} of {allLectures.length}
              </div>
              <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#071b33", letterSpacing: "-.03em", margin: "0 0 10px" }}>
                {lecture.title}
              </h1>
              {lecture.description && (
                <p style={{ color: "#6b7c93", lineHeight: 1.7, fontSize: ".92rem" }}>{lecture.description}</p>
              )}
            </div>

            {/* Prev / Next */}
            <div style={{ display: "flex", gap: 10 }}>
              {prevLec && (
                <Link href={`/lectures/${prevLec.id}`} style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e8eef6", textDecoration: "none", display: "block", background: "#f8fafc" }}>
                  <div style={{ fontSize: ".7rem", fontWeight: 700, color: "#6b7c93", marginBottom: 3 }}>← Previous</div>
                  <div style={{ fontSize: ".85rem", fontWeight: 700, color: "#071b33" }}>{prevLec.title}</div>
                </Link>
              )}
              {nextLec && (
                <Link href={`/lectures/${nextLec.id}`} style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "1.5px solid #155eef", textDecoration: "none", display: "block", background: "#eff6ff", textAlign: "right" }}>
                  <div style={{ fontSize: ".7rem", fontWeight: 700, color: "#155eef", marginBottom: 3 }}>Next →</div>
                  <div style={{ fontSize: ".85rem", fontWeight: 700, color: "#071b33" }}>{nextLec.title}</div>
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar — lecture list */}
          <div>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #e8eef6" }}>
                <p style={{ fontWeight: 800, color: "#071b33", fontSize: ".9rem", margin: 0 }}>All Lectures</p>
              </div>
              <div style={{ maxHeight: 480, overflowY: "auto" }}>
                {allLectures.map((lec, i) => (
                  <Link key={lec.id} href={`/lectures/${lec.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9", background: lec.id === id ? "#eff6ff" : "transparent", transition: "background .12s" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: lec.id === id ? "#155eef" : "#f1f5f9", color: lec.id === id ? "#fff" : "#6b7c93", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".72rem", fontWeight: 800, flexShrink: 0 }}>
                        {lec.id === id ? "▶" : i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: ".82rem", fontWeight: lec.id === id ? 800 : 600, color: lec.id === id ? "#155eef" : "#344054", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {lec.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
