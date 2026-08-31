import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WORKBOOK_PAGES, getWorkbookPage } from "@/lib/guides/workbooks";
import { listWorkbooks } from "@/lib/workbooks";
import { WorkbookDownloadLink } from "@/components/WorkbookDownloadLink";

const BASE_URL = "https://academy.thedigitaltutor.net";

// Reads the live workbook list per request so a re-uploaded PDF is picked up
// without a code change.
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return WORKBOOK_PAGES.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getWorkbookPage(slug);
  if (!page) return { title: "Resource not found" };
  return {
    title: { absolute: page.seoTitle },
    description: page.description,
    alternates: { canonical: `/resources/${page.slug}` },
    openGraph: {
      title: page.seoTitle,
      description: page.description,
      url: `/resources/${page.slug}`,
      type: "article",
      images: ["/opengraph-image"],
    },
  };
}

export default async function WorkbookLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getWorkbookPage(slug);
  if (!page) notFound();

  const workbooks = await listWorkbooks();
  const workbook = workbooks.find((w) => w.title.toLowerCase().includes(page.matchTitle));

  const url = `${BASE_URL}/resources/${page.slug}`;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "O Level", item: `${BASE_URL}/o-level` },
      { "@type": "ListItem", position: 3, name: page.subjectName, item: `${BASE_URL}${page.subjectHref}` },
      { "@type": "ListItem", position: 4, name: "Free workbook", item: url },
    ],
  };
  const resourceSchema = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: page.h1,
    description: page.description,
    url,
    learningResourceType: "Workbook",
    educationalLevel: "Cambridge O Level",
    isAccessibleForFree: true,
    provider: { "@type": "EducationalOrganization", name: "The Digital Tutor", url: BASE_URL },
  };

  return (
    <section className="section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(resourceSchema) }} />

      <div className="container" style={{ maxWidth: 780 }}>
        <nav style={{ marginBottom: 20, color: "var(--muted)", fontSize: ".85rem" }}>
          <Link href="/" style={{ color: "var(--muted)" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/o-level" style={{ color: "var(--muted)" }}>O Level</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href={page.subjectHref} style={{ color: "var(--muted)" }}>{page.subjectName}</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--navy)" }}>Free workbook</span>
        </nav>

        <div className="eyebrow">Free download · No account needed</div>
        <h1 className="title" style={{ marginTop: 8 }}>{page.h1}</h1>
        <p className="lead">{page.intro}</p>

        <div className="card" style={{ marginTop: 28, background: "#eaf1ff", borderColor: "#c9dcfb" }}>
          {workbook ? (
            <>
              <p style={{ margin: "0 0 14px", fontWeight: 700, color: "var(--navy)" }}>
                {workbook.title} — free PDF
              </p>
              <WorkbookDownloadLink
                id={workbook.id}
                href={workbook.fileUrl}
                fileName={workbook.fileName}
                title={workbook.title}
                className="btn btn-primary"
              >
                Download the workbook (PDF)
              </WorkbookDownloadLink>
            </>
          ) : (
            <>
              <p style={{ margin: "0 0 6px", fontWeight: 700, color: "var(--navy)" }}>Coming shortly</p>
              <p style={{ margin: 0, color: "var(--muted)" }}>
                This workbook is being prepared. In the meantime, the{" "}
                <Link href={page.subjectHref} style={{ color: "var(--blue)", fontWeight: 700 }}>
                  {page.subjectName} programme page
                </Link>{" "}
                covers what the course itself includes.
              </p>
            </>
          )}
        </div>

        <section style={{ marginTop: 40 }}>
          <h2 style={{ color: "var(--navy)", fontSize: "1.15rem", fontWeight: 800 }}>What it covers</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.8, marginTop: 12 }}>
            Topic areas for Cambridge O Level {page.subjectName}. These are indicative areas, not a reproduction of the
            official Cambridge syllabus.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", marginTop: 4 }}>
            {page.topics.map((t) => <span className="badge" key={t}>{t}</span>)}
          </div>
        </section>

        <section style={{ marginTop: 40 }}>
          <h2 style={{ color: "var(--navy)", fontSize: "1.15rem", fontWeight: 800 }}>Who it is for</h2>
          <ul className="check-list" style={{ marginTop: 14 }}>
            {page.forWho.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </section>

        <section style={{ marginTop: 40 }}>
          <h2 style={{ color: "var(--navy)", fontSize: "1.15rem", fontWeight: 800 }}>How to use it</h2>
          <ul className="check-list" style={{ marginTop: 14 }}>
            {page.howToUse.map((h) => <li key={h}>{h}</li>)}
          </ul>
        </section>

        <section style={{ marginTop: 40 }}>
          <h2 style={{ color: "var(--navy)", fontSize: "1.15rem", fontWeight: 800 }}>Who wrote it</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.8, marginTop: 12 }}>
            The workbook is produced by The Digital Tutor, an independent online tuition provider running live Cambridge
            O Level classes for students in Pakistan and abroad. Classes are taught by Ibrahim Sajid Malick, founder of
            The Digital Tutor.
          </p>
        </section>

        <div className="card" style={{ marginTop: 40 }}>
          <h2 style={{ marginTop: 0, fontSize: "1.05rem", color: "var(--navy)" }}>
            Want structured O Level {page.subjectName} preparation?
          </h2>
          <p style={{ margin: "0 0 16px" }}>
            The workbook is practice on its own. The programme adds a weekly live class, homework with feedback, open
            office hours when your child is stuck, and progress reports for parents.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href={page.subjectHref} className="btn btn-primary">O Level {page.subjectName} →</Link>
            <Link href="/guides/o-level-tuition-cost-pakistan" className="btn btn-secondary">What tuition costs</Link>
          </div>
        </div>

        <section style={{ marginTop: 40 }}>
          <h2 style={{ color: "var(--navy)", fontSize: "1.05rem", fontWeight: 800 }}>Other free resources</h2>
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {WORKBOOK_PAGES.filter((w) => w.slug !== page.slug).map((w) => (
              <Link key={w.slug} href={`/resources/${w.slug}`} style={{ color: "var(--blue)", fontWeight: 700, fontSize: ".92rem", textDecoration: "none" }}>
                {w.h1} →
              </Link>
            ))}
            <Link href="/guides" style={{ color: "var(--blue)", fontWeight: 700, fontSize: ".92rem", textDecoration: "none" }}>
              Guides for parents →
            </Link>
          </div>
        </section>

        <p style={{ marginTop: 40, fontSize: ".78rem", color: "var(--muted)", lineHeight: 1.7 }}>
          Cambridge O Level and IGCSE are qualifications of Cambridge University Press &amp; Assessment. The Digital
          Tutor is an independent tuition provider and is not affiliated with or endorsed by Cambridge University Press
          &amp; Assessment. All practice material is original.
        </p>
      </div>
    </section>
  );
}
