"use client";
import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHero } from "@/components/site";
import { getOLevelSubjects } from "@/lib/academy/data";
import { UnlockModal, LockedBanner, type AccessLevel } from "@/components/unlock-modal";

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
  const [access, setAccess] = useState<AccessLevel>("free");
  const [loading, setLoading] = useState(true);
  const [showUnlock, setShowUnlock] = useState(false);

  const load = useCallback((subject: OLevelCategory) => {
    setLoading(true);
    fetch(`/api/o-level/quizzes?subject=${subject}`)
      .then((r) => r.json())
      .then((d) => { setQuizzes(d.quizzes ?? []); setAccess(d.access ?? "free"); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  const subjectName = SUBJECTS.find((s) => s.slug === tab)?.name ?? tab;

  return (
    <>
      <PageHero eyebrow="O Level quizzes" title="Practice Quizzes" backHref="/o-level" backLabel="O Level">
        Short subject quizzes to check your understanding. Unlock a subject to take its quizzes — your best score is saved.
      </PageHero>

      {showUnlock && (
        <UnlockModal
          accessLevel={access}
          onClose={() => setShowUnlock(false)}
          onSubmitted={() => load(tab)}
          eyebrow="O Level subject access"
          title={`Unlock O Level ${subjectName}`}
          features={["All lessons", "Practice quizzes", "Live sessions", "Past papers"]}
          endpoint="/api/o-level/access/request"
          requestBody={{ subject: tab }}
        />
      )}

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

          {!loading && access !== "unlocked" && (
            <LockedBanner
              accessLevel={access}
              onUnlock={() => setShowUnlock(true)}
              title={`🔒 Unlock ${subjectName}`}
              subtitle="Unlock this subject to take its quizzes and see your scores."
              buttonLabel="Unlock this subject"
            />
          )}

          {loading ? (
            <div className="card" style={{ maxWidth: 400 }}><p>Loading quizzes…</p></div>
          ) : access !== "unlocked" ? null : quizzes.length === 0 ? (
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
