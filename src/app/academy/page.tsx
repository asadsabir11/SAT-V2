import type { Metadata } from "next";
import { CTAButton } from "@/components/site";
import { ProgramCard } from "@/components/academy/ProgramCard";
import { LearningJourney } from "@/components/academy/LearningJourney";
import { ACADEMY_NAME, ACADEMY_TAGLINE, PROGRAMS } from "@/lib/academy/data";

export const metadata: Metadata = {
  title: "Academy",
  description: "The Digital Tutor Academy: Cambridge O Level / IGCSE and SAT preparation with live teaching, open office hours, AI-supported study, and parent reporting.",
};

export default function AcademyPage() {
  return (
    <>
      <section className="section band">
        <div className="container">
          <div className="eyebrow" style={{ color: "#5eead4" }}>The Digital Tutor Academy</div>
          <h1 className="display" style={{ color: "#fff" }}>{ACADEMY_NAME}</h1>
          <p className="lead" style={{ color: "rgba(255,255,255,.78)" }}>
            {ACADEMY_TAGLINE} Prepare for Cambridge O Level / IGCSE, the SAT, and future programs — all under one academy.
          </p>
          <div className="actions">
            <CTAButton href="/o-level" variant="accent">Explore O Levels</CTAButton>
            <CTAButton href="/" variant="ghost">Explore SAT Prep</CTAButton>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>Programs</div>
            <h2 className="title">Choose your program</h2>
            <p className="lead" style={{ margin: "0 auto" }}>
              Two major programs today, with more on the way — all built on the same model of live teaching and support between classes.
            </p>
          </div>
          <div className="grid grid-4" style={{ marginTop: 40 }}>
            {PROGRAMS.map((p) => (
              <ProgramCard key={p.key} program={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <LearningJourney />
        </div>
      </section>
    </>
  );
}
