"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/site";

interface QuizSummary {
  id: string;
  title: string;
  description: string;
  question_count: number;
  created_at: string;
}

export default function ALevelQuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [access, setAccess] = useState<"free" | "pending" | "unlocked">("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/a-level/quizzes")
      .then((r) => r.json())
      .then((d) => { setQuizzes(d.quizzes ?? []); setAccess(d.access ?? "free"); })
      .finally(() => setLoading(false));
  }, []);

  const locked = !loading && access !== "unlocked";

  return (
    <>
      <PageHero eyebrow="A Level quizzes" title="Test your understanding" backHref="/a-level/portal" backLabel="Portal">
        Practice with topic quizzes and track your best scores.
      </PageHero>

      <section className="section">
        <div className="container" style={{ maxWidth: 780 }}>
          {loading ? (
            <div className="card" style={{ maxWidth: 400 }}><p>Loading quizzes…</p></div>
          ) : locked ? (
            <div className="card" style={{ textAlign: "center", padding: 56 }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔒</div>
              <p style={{ fontWeight: 700, color: "#071b33", marginBottom: 6 }}>
                {access === "pending" ? "Payment under review" : "Full access required"}
              </p>
              <p style={{ color: "#6b7c93", fontSize: ".88rem", marginBottom: 16 }}>
                {access === "pending" ? "We're verifying your payment — quizzes will appear here once unlocked." : "Unlock full access to take quizzes."}
              </p>
              {access !== "pending" && <Link href="/a-level/portal/unlock" className="btn btn-primary" style={{ background: "#be123c", borderColor: "#be123c" }}>Unlock Full Access →</Link>}
            </div>
          ) : quizzes.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>
              <div style={{ fontSize: "2rem", marginBottom: 10 }}>📝</div>
              <p style={{ fontWeight: 700 }}>No quizzes yet</p>
              <p style={{ fontSize: ".88rem" }}>Check back soon — quizzes are added regularly.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
              {quizzes.map((q) => (
                <Link key={q.id} href={`/a-level/portal/quizzes/${q.id}`} className="card" style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  <div className="eyebrow">📝 {q.question_count} question{q.question_count === 1 ? "" : "s"}</div>
                  <h3 style={{ margin: 0, color: "#071b33" }}>{q.title}</h3>
                  {q.description && <p style={{ margin: 0, color: "#6b7c93", fontSize: ".85rem" }}>{q.description}</p>}
                  <span style={{ marginTop: "auto", fontWeight: 700, fontSize: ".85rem", color: "#be123c" }}>Start quiz →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
