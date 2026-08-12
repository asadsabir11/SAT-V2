import { MetadataRoute } from "next";

const BASE = "https://digital-tutor-sat-prep.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = [
    { url: BASE, priority: 1.0 },
    { url: `${BASE}/founder-cohort`, priority: 0.9 },
    { url: `${BASE}/register`, priority: 0.9 },
    { url: `${BASE}/login`, priority: 0.7 },
    { url: `${BASE}/parent-webinar`, priority: 0.8 },
    { url: `${BASE}/contact`, priority: 0.6 },
    { url: `${BASE}/materials`, priority: 0.6 },
    { url: `${BASE}/privacy`, priority: 0.4 },
    { url: `${BASE}/terms`, priority: 0.4 },
  ];
  return publicRoutes.map(r => ({
    url: r.url,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: r.priority,
  }));
}
