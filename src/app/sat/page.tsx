import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site";

export const metadata: Metadata = {
  title: "SAT",
  description: "Everything for your SAT prep in one place — Q&A, live sessions, lectures, diagnostic, and AI tutor.",
  // Signed-in students only — middleware 307s anonymous visitors (including
  // crawlers) to /login, so this must not be offered to the index.
  robots: { index: false, follow: false },
};

const MODULES = [
  { href: "/discussion", icon: "💬", title: "Q&A", description: "Ask questions and get help from your instructor and classmates." },
  { href: "/sessions", icon: "📅", title: "Sessions", description: "Join live classes, tutoring sessions, and Q&A calls." },
  { href: "/lectures", icon: "🎬", title: "Lectures", description: "Watch class recordings on demand, anytime." },
  { href: "/diagnostic", icon: "📝", title: "Diagnostic", description: "Take your baseline test and see your starting score." },
  { href: "/ai-tutor", icon: "🤖", title: "AI Tutor", description: "Get instant help and personalized practice." },
];

export default function SatHubPage() {
  return (
    <>
      <PageHero eyebrow="Your SAT toolkit" title="Everything for your SAT prep, in one place." backHref="/dashboard" backLabel="Dashboard">
        Open any module below — your Q&amp;A board, live sessions, recorded lectures, diagnostic test, and AI tutor.
      </PageHero>

      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {MODULES.map((m) => (
              <Link key={m.href} href={m.href} style={{ textDecoration: "none" }}>
                <article className="card" style={{ height: "100%" }}>
                  <div className="icon">{m.icon}</div>
                  <h3>{m.title}</h3>
                  <p>{m.description}</p>
                  <span style={{ color: "var(--blue)", fontWeight: 700, fontSize: ".85rem" }}>Open →</span>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
