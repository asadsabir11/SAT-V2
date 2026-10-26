"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/site";

interface Paper {
  id: string;
  title: string;
  description: string;
  session: string;
  paper_type: "question_paper" | "mark_scheme" | "examiner_report" | "other";
  file_url: string;
  file_name: string;
}

const TYPE_META: Record<Paper["paper_type"], { label: string; icon: string }> = {
  question_paper: { label: "Question Paper", icon: "📄" },
  mark_scheme: { label: "Mark Scheme", icon: "✅" },
  examiner_report: { label: "Examiner Report", icon: "📊" },
  other: { label: "Other", icon: "📎" },
};

export default function ALevelPastPapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [access, setAccess] = useState<"free" | "pending" | "unlocked">("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/a-level/past-papers")
      .then((r) => r.json())
      .then((d) => { setPapers(d.papers ?? []); setAccess(d.access ?? "free"); })
      .finally(() => setLoading(false));
  }, []);

  const locked = !loading && access !== "unlocked";

  return (
    <>
      <PageHero eyebrow="A Level past papers" title="Practice with real exam questions" backHref="/a-level/portal" backLabel="Portal">
        Question papers, mark schemes and examiner reports for A Level Computer Science.
      </PageHero>

      <section className="section">
        <div className="container" style={{ maxWidth: 780 }}>
          {loading ? (
            <div className="card" style={{ maxWidth: 400 }}><p>Loading past papers…</p></div>
          ) : locked ? (
            <div className="card" style={{ textAlign: "center", padding: 56 }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔒</div>
              <p style={{ fontWeight: 700, color: "#071b33", marginBottom: 6 }}>
                {access === "pending" ? "Payment under review" : "Full access required"}
              </p>
              <p style={{ color: "#6b7c93", fontSize: ".88rem", marginBottom: 16 }}>
                {access === "pending" ? "We're verifying your payment — past papers will appear here once unlocked." : "Unlock full access to view past papers."}
              </p>
              {access !== "pending" && <Link href="/a-level/portal/unlock" className="btn btn-primary" style={{ background: "#be123c", borderColor: "#be123c" }}>Unlock Full Access →</Link>}
            </div>
          ) : papers.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>
              <div style={{ fontSize: "2rem", marginBottom: 10 }}>📄</div>
              <p style={{ fontWeight: 700 }}>No past papers yet</p>
              <p style={{ fontSize: ".88rem" }}>Check back soon — papers are added regularly.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {papers.map((p) => (
                <a key={p.id} href={p.file_url} target="_blank" rel="noreferrer" className="card" style={{ textDecoration: "none", display: "flex", gap: 16, alignItems: "center", padding: "16px 20px" }}>
                  <div style={{ fontSize: "1.8rem" }}>{TYPE_META[p.paper_type].icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, color: "#071b33", margin: "0 0 4px" }}>{p.title}</p>
                    <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: 0 }}>
                      {TYPE_META[p.paper_type].label}{p.session ? ` · ${p.session}` : ""}
                    </p>
                  </div>
                  <span style={{ color: "#be123c", fontWeight: 700, fontSize: ".85rem", flexShrink: 0 }}>Download →</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
