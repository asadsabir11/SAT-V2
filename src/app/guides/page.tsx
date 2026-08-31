import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site";
import { GUIDES } from "@/lib/guides/data";

const BASE_URL = "https://academy.thedigitaltutor.net";

export const metadata: Metadata = {
  title: "Guides for Parents",
  description:
    "Practical guides for parents choosing Cambridge O Level tuition in Pakistan — what it costs, online versus home tuition, how to choose a tutor, and when to start preparing.",
  alternates: { canonical: `${BASE_URL}/guides` },
  openGraph: {
    title: "O Level Guides for Parents",
    description:
      "What O Level tuition costs, online versus home tuition, how to choose a tutor, how much your child should study, and when to start.",
    url: `${BASE_URL}/guides`,
    type: "website",
    images: ["/opengraph-image"],
  },
};

// The hub exists so the guides are reachable by crawlers and by readers. The
// O Level subject pages were previously orphaned — in the sitemap but linked
// from nowhere — and Google never discovered them. Not repeating that.
export default function GuidesHub() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${BASE_URL}/guides` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <PageHero eyebrow="Guides for parents" title="Straight answers to the questions parents actually ask">
        Practical guidance on choosing and paying for Cambridge O Level tuition — written from how our own programme
        runs, with no invented figures.
      </PageHero>

      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ display: "grid", gap: 16 }}>
            {GUIDES.map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`} style={{ textDecoration: "none" }}>
                <article className="card">
                  <h2 style={{ color: "var(--navy)", fontSize: "1.15rem", fontWeight: 800, margin: "0 0 6px" }}>
                    {g.h1}
                  </h2>
                  <p style={{ margin: "0 0 10px" }}>{g.description}</p>
                  <span style={{ color: "var(--blue)", fontWeight: 700, fontSize: ".85rem" }}>Read the guide →</span>
                </article>
              </Link>
            ))}
          </div>

          <div className="card" style={{ marginTop: 32, background: "#eaf1ff", borderColor: "#c9dcfb" }}>
            <h2 style={{ marginTop: 0, fontSize: "1.05rem", color: "var(--navy)" }}>Looking at the programme itself?</h2>
            <p style={{ margin: "0 0 16px" }}>
              Cohort dates, class times, syllabus codes and per-subject pricing for Cambridge O Level English Language,
              Mathematics and Computer Science.
            </p>
            <Link href="/o-level" className="btn btn-primary">View O Level programme</Link>
          </div>
        </div>
      </section>
    </>
  );
}
