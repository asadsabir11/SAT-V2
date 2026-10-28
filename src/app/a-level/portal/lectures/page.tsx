"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/site";

type Category = "computer-science-vol1" | "computer-science-vol2";
const SUBJECTS: { category: Category; label: string; icon: string }[] = [
  { category: "computer-science-vol1", label: "Computer Science (CS 9618 Vol 1)", icon: "💻" },
  { category: "computer-science-vol2", label: "Computer Science (CS 9618 Vol 2)", icon: "💻" },
];

interface Lecture {
  id: string;
  program: "a-level";
  category: Category;
  is_locked?: boolean;
}

export default function ALevelLecturesLanding() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/lectures")
      .then((r) => r.json())
      .then((d) => {
        setLectures((d.lectures ?? []).filter((l: Lecture) => l.program === "a-level"));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHero eyebrow="A Level materials" title="Lessons" backHref="/a-level/portal" backLabel="Portal">
        Recorded A Level Computer Science lessons, split by volume — pick which one to open.
      </PageHero>

      <section className="section">
        <div className="container">
          {loading ? (
            <div className="card" style={{ maxWidth: 400 }}><p>Loading…</p></div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {SUBJECTS.map(({ category, label, icon }) => {
                const group = lectures.filter((l) => l.category === category);
                const lockedCount = group.filter((l) => l.is_locked).length;
                const allLocked = group.length > 0 && lockedCount === group.length;
                return (
                  <Link key={category} href={`/a-level/portal/lectures/${category}`} style={{ textDecoration: "none" }}>
                    <div
                      className="card"
                      style={{ padding: "26px 24px", cursor: "pointer", transition: "transform .15s, box-shadow .15s" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(7,27,51,.12)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
                    >
                      <div style={{ fontSize: "2rem", marginBottom: 10 }}>{icon}</div>
                      <h3 style={{ color: "#071b33", fontWeight: 800, fontSize: "1.05rem", margin: "0 0 8px" }}>{label}</h3>
                      <p style={{ color: "#6b7c93", fontSize: ".85rem", margin: "0 0 12px" }}>
                        {group.length} lesson{group.length === 1 ? "" : "s"}
                      </p>
                      {allLocked ? (
                        <span style={{ fontSize: ".78rem", color: "#9f1239", fontWeight: 700 }}>🔒 Unlock to watch</span>
                      ) : (
                        <span style={{ fontSize: ".78rem", color: "#be123c", fontWeight: 700 }}>Open →</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
