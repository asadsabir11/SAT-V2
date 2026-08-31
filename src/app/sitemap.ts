import { MetadataRoute } from "next";
import { getOLevelSubjects } from "@/lib/academy/data";
import { GUIDES } from "@/lib/guides/data";

const BASE = "https://academy.thedigitaltutor.net";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = [
    { url: BASE, priority: 1.0 },
    { url: `${BASE}/o-level`, priority: 0.9 },
    { url: `${BASE}/founder-cohort`, priority: 0.9 },
    { url: `${BASE}/academy`, priority: 0.8 },
    { url: `${BASE}/register`, priority: 0.9 },
    { url: `${BASE}/login`, priority: 0.7 },
    { url: `${BASE}/parent-webinar`, priority: 0.8 },
    { url: `${BASE}/scholarship`, priority: 0.7 },
    { url: `${BASE}/sample-report`, priority: 0.6 },
    { url: `${BASE}/contact`, priority: 0.6 },
    { url: `${BASE}/materials`, priority: 0.6 },
    { url: `${BASE}/guides`, priority: 0.7 },
    { url: `${BASE}/privacy`, priority: 0.4 },
    { url: `${BASE}/terms`, priority: 0.4 },
    // Cambridge O Level subject pages — the commercial money pages Google
    // has the most specific query intent to match against.
    ...getOLevelSubjects().map((s) => ({
      url: `${BASE}/o-level/${s.slug}`,
      priority: s.slug === "mathematics" || s.slug === "english-language" || s.slug === "computer-science" ? 0.85 : 0.5,
    })),
    // Parent guides — informational pages targeting near-purchase parent
    // queries, feeding the commercial O Level pages (SEO Phase 2 §23).
    ...GUIDES.map((g) => ({ url: `${BASE}/guides/${g.slug}`, priority: 0.7 })),
  ];
  return publicRoutes.map(r => ({
    url: r.url,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: r.priority,
  }));
}
