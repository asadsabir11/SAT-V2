"use client";
import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHero } from "@/components/site";
import { getOLevelSubjects } from "@/lib/academy/data";

type OLevelCategory = "mathematics" | "computer-science" | "english-language" | "islamiyat" | "pakistan-studies";

interface QuizSummary {
  id: string;
  subject: OLevelCategory;
  title: string;
  description: string;
  question_count: number;
  created_at: string;
}

const SUBJECT_ICON: Record<OLevelCategory, string> = {
  mathematics: "📐",
  "computer-science": "💻",
  "english-language": "📖",
  islamiyat: "🕌",
  "pakistan-studies": "🌍",
};

const SUBJECTS = getOLevelSubjects().map((s) => ({ slug: s.slug as OLevelCategory, name: s.name }));

function OLevelQuizzesInner() {
  const searchParams = useSearchParams();
  const preselect = searchParams.get("subject") as OLevelCategory | null;

  const [tab, setTab] = useState<OLevelCategory>(
    preselect && SUBJECTS.some((s) => s.slug === preselect) ? preselect : SUBJECTS[0].slug
  );
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback((subject: OLevelCategory) => {
    setLoading(true);
    fetch(`/api/o-level/quizzes?subject=${subject}`)
      .then((r) => r.json())
      .then((d) => setQuizzes(d.quizzes ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  return (
    <>
      <PageHero eyebrow="O Level quizzes" title="Practice Quizzes">
        Short subject quizzes to check your understanding. Take as many as you like — your best score is saved.
      </PageHero>

      <section className="section">
        <div className="container">
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
            <div className="card" style={{ maxWidth: 400 }}><p>Loading quizzes…</p></div>
          ) : quizzes.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 56, maxWidth: 480 }}>
              <div style={{ fontSize: "3rem", marginBottom: 14 }}>{SUBJECT_ICON[tab]}</div>
              <h2 style={{ color: "#071b33", marginBottom: 8 }}>No quizzes yet</h2>
              <p style={{ color: "#6b7c93" }}>Check back soon — quizzes are added regularly.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {quizzes.map((q) => (
                <Link key={q.id} href={`/o-level/quizzes/${q.id}`} style={{ textDecoration: "none" }}>
                  <article className="card" style={{ height: "100%" }}>
                    <div className="eyebrow">{SUBJECT_ICON[q.subject]} {q.question_count} question{q.question_count === 1 ? "" : "s"}</div>
                    <h3 style={{ marginTop: 6 }}>{q.title}</h3>
                    {q.description && <p>{q.description}</p>}
                    <span style={{ color: "var(--blue)", fontWeight: 700, fontSize: ".85rem" }}>Start quiz →</span>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function OLevelQuizzesPage() {
  return (
    <Suspense fallback={<section className="section"><div className="container"><div className="card" style={{ maxWidth: 400 }}><p>Loading…</p></div></div></section>}>
      <OLevelQuizzesInner />
    </Suspense>
  );
}
