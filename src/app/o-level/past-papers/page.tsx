"use client";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHero } from "@/components/site";
import { getOLevelSubjects } from "@/lib/academy/data";
import { LockedBanner, type AccessLevel } from "@/components/unlock-modal";

type OLevelCategory = "mathematics" | "computer-science" | "english-language" | "islamiyat" | "pakistan-studies" | "physics";
type PaperType = "question_paper" | "mark_scheme" | "examiner_report" | "other";

interface PastPaper {
  id: string;
  subject: OLevelCategory;
  title: string;
  description: string;
  session: string;
  paper_type: PaperType;
  file_url: string;
}

const SUBJECT_ICON: Record<OLevelCategory, string> = {
  mathematics: "📐",
  "computer-science": "💻",
  "english-language": "📖",
  islamiyat: "🕌",
  "pakistan-studies": "🌍",
  physics: "⚛️",
};
const SUBJECTS = getOLevelSubjects().map((s) => ({ slug: s.slug as OLevelCategory, name: s.name }));

const PAPER_TYPE_META: Record<PaperType, { label: string; color: string; bg: string }> = {
  question_paper: { label: "Question Paper", color: "#1d4ed8", bg: "#dbeafe" },
  mark_scheme: { label: "Mark Scheme", color: "#15803d", bg: "#dcfce7" },
  examiner_report: { label: "Examiner Report", color: "#7c3aed", bg: "#ede9fe" },
  other: { label: "Other", color: "#92400e", bg: "#fef3c7" },
};

function PaperCard({ p }: { p: PastPaper }) {
  const t = PAPER_TYPE_META[p.paper_type] ?? PAPER_TYPE_META.other;
  return (
    <div className="card" style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>📄</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".7rem", fontWeight: 700, background: t.bg, color: t.color }}>{t.label}</span>
          <p style={{ fontWeight: 800, color: "#071b33", margin: "8px 0 2px", fontSize: ".95rem" }}>{p.title}</p>
          {p.session && <p style={{ color: "#6b7c93", fontSize: ".8rem", margin: "0 0 4px" }}>{p.session}</p>}
          {p.description && <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: "0 0 10px" }}>{p.description}</p>}
          <a href={p.file_url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--blue)", fontWeight: 700, fontSize: ".85rem" }}>
            View / Download →
          </a>
        </div>
      </div>
    </div>
  );
}

function OLevelPastPapersInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselect = searchParams.get("subject") as OLevelCategory | null;

  const [papers, setPapers] = useState<PastPaper[]>([]);
  const [access, setAccess] = useState<AccessLevel>("free");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<OLevelCategory>(
    preselect && SUBJECTS.some((s) => s.slug === preselect) ? preselect : SUBJECTS[0].slug
  );

  const load = useCallback((subject: OLevelCategory) => {
    setLoading(true);
    fetch(`/api/past-papers?subject=${subject}`)
      .then((r) => r.json())
      .then((d) => { setPapers(d.papers ?? []); setAccess(d.access ?? "free"); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  const subjectName = SUBJECTS.find((s) => s.slug === tab)?.name ?? tab;

  return (
    <>
      <PageHero eyebrow="O Level past papers" title="Past Papers" backHref="/o-level" backLabel="O Level">
        Practice with past exam papers, mark schemes, and examiner reports. Unlock a subject to access its papers.
      </PageHero>

      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
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
              onUnlock={() => router.push(`/o-level/unlock?subject=${tab}`)}
              title={`🔒 Unlock ${subjectName}`}
              subtitle="Unlock this subject to access its past papers."
              buttonLabel="Unlock this subject"
            />
          )}

          {loading ? (
            <div className="card" style={{ maxWidth: 400 }}><p>Loading past papers…</p></div>
          ) : access !== "unlocked" ? null : papers.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 56, maxWidth: 480 }}>
              <div style={{ fontSize: "3rem", marginBottom: 14 }}>{SUBJECT_ICON[tab]}</div>
              <h2 style={{ color: "#071b33", marginBottom: 8 }}>No past papers yet</h2>
              <p style={{ color: "#6b7c93" }}>Check back soon — papers are added regularly.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {papers.map((p) => <PaperCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function OLevelPastPapersPage() {
  return (
    <Suspense fallback={<section className="section"><div className="container"><div className="card" style={{ maxWidth: 400 }}><p>Loading…</p></div></div></section>}>
      <OLevelPastPapersInner />
    </Suspense>
  );
}
