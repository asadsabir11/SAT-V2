import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, getGuide } from "@/lib/guides/data";

const BASE_URL = "https://academy.thedigitaltutor.net";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: "Guide not found" };
  return {
    // absolute: seoTitle already reads as a complete search result. Letting the
    // root layout append the brand pushed these past the ~60 chars Google shows.
    title: { absolute: guide.seoTitle },
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: guide.seoTitle,
      description: guide.description,
      url: `/guides/${guide.slug}`,
      type: "article",
      images: ["/opengraph-image"],
    },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const url = `${BASE_URL}/guides/${guide.slug}`;
  const others = GUIDES.filter((g) => g.slug !== guide.slug);

  // author is the organisation, not a person. Attributing these to Ibrahim
  // without him having written or reviewed them would be exactly the
  // "artificial author profile" §34 warns against. Swap to a Person byline
  // once he has actually reviewed the copy.
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.h1,
    description: guide.description,
    url,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "The Digital Tutor", url: BASE_URL },
    publisher: {
      "@type": "EducationalOrganization",
      name: "The Digital Tutor",
      url: BASE_URL,
      logo: `${BASE_URL}/icon.png`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${BASE_URL}/guides` },
      { "@type": "ListItem", position: 3, name: guide.navLabel, item: url },
    ],
  };

  const faqSchema = guide.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: guide.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <section className="section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <div className="container" style={{ maxWidth: 780 }}>
        <nav style={{ marginBottom: 20, color: "var(--muted)", fontSize: ".85rem" }}>
          <Link href="/" style={{ color: "var(--muted)" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/guides" style={{ color: "var(--muted)" }}>Guides</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--navy)" }}>{guide.navLabel}</span>
        </nav>

        <div className="eyebrow">Guide for parents</div>
        <h1 className="title" style={{ marginTop: 8 }}>{guide.h1}</h1>
        <p className="lead">{guide.intro}</p>

        {guide.sections.map((s) => (
          <section key={s.h2} style={{ marginTop: 40 }}>
            <h2 style={{ color: "var(--navy)", fontSize: "1.15rem", fontWeight: 800 }}>{s.h2}</h2>
            {s.body.map((p) => (
              <p key={p.slice(0, 40)} style={{ color: "var(--muted)", lineHeight: 1.8, marginTop: 12 }}>{p}</p>
            ))}
            {s.bullets && (
              <ul className="check-list" style={{ marginTop: 14 }}>
                {s.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
            )}
          </section>
        ))}

        {guide.faqs && guide.faqs.length > 0 && (
          <section style={{ marginTop: 48 }}>
            <h2 style={{ color: "var(--navy)", fontSize: "1.15rem", fontWeight: 800 }}>Frequently asked questions</h2>
            <div style={{ marginTop: 8 }}>
              {guide.faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <div className="card" style={{ marginTop: 48, background: "#eaf1ff", borderColor: "#c9dcfb" }}>
          <h2 style={{ marginTop: 0, fontSize: "1.05rem", color: "var(--navy)" }}>{guide.cta.heading}</h2>
          <p style={{ margin: "0 0 16px" }}>{guide.cta.body}</p>
          <Link href={guide.cta.href} className="btn btn-primary">{guide.cta.label}</Link>
        </div>

        <section style={{ marginTop: 48 }}>
          <h2 style={{ color: "var(--navy)", fontSize: "1.05rem", fontWeight: 800 }}>Related guides</h2>
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {others.map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`} style={{ color: "var(--blue)", fontWeight: 700, fontSize: ".92rem", textDecoration: "none" }}>
                {g.h1} →
              </Link>
            ))}
          </div>
        </section>

        <p style={{ marginTop: 40, fontSize: ".78rem", color: "var(--muted)", lineHeight: 1.7 }}>
          Cambridge O Level and IGCSE are qualifications of Cambridge University Press &amp; Assessment. The Digital
          Tutor is an independent tuition provider and is not affiliated with or endorsed by Cambridge University Press
          &amp; Assessment. No examination grade is guaranteed.
        </p>
      </div>
    </section>
  );
}
