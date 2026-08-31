import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { PageHero } from "@/components/site";

const BASE_URL = "https://academy.thedigitaltutor.net";

export const metadata: Metadata = {
  title: "Academy — Choose Your Program",
  description: "The Digital Tutor Academy offers live, founder-led SAT prep and Cambridge O Level / IGCSE tuition. Choose your program to get started.",
  alternates: { canonical: `${BASE_URL}/academy` },
};

const PROGRAMS = [
  {
    key: "sat",
    name: "SAT Prep",
    tagline: "For students applying to university abroad",
    description: "Live weekly classes, an AI tutor available 24/7, original mock tests, and weekly parent progress reports.",
    href: "/",
    accent: "#155eef",
    grad: "linear-gradient(135deg,#155eef,#18a999)",
    glow: "rgba(21,94,239,.35)",
    icon: "🎓",
    points: ["Free diagnostic test", "Weekly live class", "AI tutor access", "Parent progress reports"],
  },
  {
    key: "o-level",
    name: "O Level / IGCSE",
    tagline: "For students preparing for Cambridge exams",
    description: "Founder-led classes in English Language, Mathematics and Computer Science, weekly office hours, and past-paper practice — more subjects opening soon.",
    href: "/o-level",
    accent: "#7c3aed",
    grad: "linear-gradient(135deg,#7c3aed,#a855f7)",
    glow: "rgba(124,58,237,.35)",
    icon: "📘",
    points: ["Register free, pay to unlock", "Live founder-led classes", "Weekly office hours", "Past-paper practice"],
  },
] as const;

export default function AcademyPage() {
  return (
    <>
      <PageHero eyebrow="The Digital Tutor Academy" title="Which program are you here for?">
        Live, founder-led tuition for students preparing for the SAT or Cambridge O Level / IGCSE exams.
      </PageHero>

      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ maxWidth: 800, margin: "0 auto" }}>
            {PROGRAMS.map((p) => (
              <Link
                key={p.key}
                href={p.href}
                className="module-card"
                style={{ "--module-accent": p.accent, "--module-accent-grad": p.grad, "--module-glow": p.glow } as CSSProperties}
              >
                <article className="card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <div className="module-icon" style={{ fontSize: "1.8rem" }}>{p.icon}</div>
                  <h3 style={{ marginBottom: 2 }}>{p.name}</h3>
                  <p style={{ color: "var(--blue)", fontWeight: 700, fontSize: ".85rem", margin: "0 0 10px" }}>{p.tagline}</p>
                  <p style={{ flex: 1 }}>{p.description}</p>
                  <ul className="check-list" style={{ margin: "14px 0 20px" }}>
                    {p.points.map((pt) => <li key={pt}>{pt}</li>)}
                  </ul>
                  <span className="module-arrow" style={{ color: p.accent, fontWeight: 800, fontSize: ".92rem" }}>
                    Explore {p.name} →
                  </span>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
