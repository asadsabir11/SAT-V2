import type { Metadata } from "next";
import Link from "next/link";
import { CTAButton, FeatureCard } from "@/components/site";
import { SubjectCard } from "@/components/academy/SubjectCard";
import { InstructorProfile } from "@/components/academy/InstructorProfile";
import { AcademyPricingTable } from "@/components/academy/AcademyPricingTable";
import { LearningJourney, LearningModelStrip } from "@/components/academy/LearningJourney";
import {
  OFFICE_HOURS,
  TRACKS,
  getInstructor,
  getOLevelSubjects,
  getSubject,
} from "@/lib/academy/data";

export const metadata: Metadata = {
  title: "O Level",
  description: "Live Cambridge O Level & IGCSE tuition where students are never left stuck: live classes, open office hours, AI study support, past-paper practice, and parent reporting. Maths, Computer Science, English, Islamiyat, Pakistan Studies.",
};

const DIFFERENTIATORS = [
  { title: "Live expert classes", description: "Human-led teaching every week — the core of the program.", icon: "🎓" },
  { title: "Open teacher office hours", description: "Drop in between classes to get unstuck — don't wait a week.", icon: "🚪" },
  { title: "24/7 AI study support", description: "Between-class help that explains concepts and generates practice.", icon: "🤖" },
  { title: "Past-paper practice", description: "Exam-style questions and timed practice to build confidence.", icon: "📝" },
  { title: "Monthly progress reporting", description: "Parents see attendance, homework, strengths, and next steps.", icon: "📊" },
];

export default function OLevelPage() {
  const subjects = getOLevelSubjects();
  const instructor = getInstructor("ibrahim");

  return (
    <>
      <section className="section band">
        <div className="container">
          <div className="eyebrow" style={{ color: "#5eead4" }}>Cambridge O Level / IGCSE</div>
          <h1 className="display" style={{ color: "#fff", maxWidth: 780 }}>
            Cambridge O Level Tuition Where Students Are Never Left Stuck
          </h1>
          <p className="lead" style={{ color: "rgba(255,255,255,.78)" }}>
            Live online classes, open teacher office hours, AI-powered study support, past-paper practice, and regular
            progress reporting. Your teacher does not disappear when class ends.
          </p>
          <div className="actions">
            <CTAButton href="/o-level/enroll?program=o-level" variant="accent">Take a Free Diagnostic</CTAButton>
            <CTAButton href="#subjects" variant="ghost">View Subjects</CTAButton>
            <CTAButton href="#pricing" variant="ghost">Join the Founding Cohort</CTAButton>
          </div>
          <div style={{ marginTop: 40 }}>
            <LearningModelStrip />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>More than tuition</div>
            <h2 className="title">Support between classes, not just during them</h2>
            <p className="lead" style={{ margin: "0 auto" }}>
              The teacher leads. Live lessons, practice, office hours, and AI support keep students moving all week.
            </p>
          </div>
          <div className="grid grid-3" style={{ marginTop: 40 }}>
            {DIFFERENTIATORS.map((d) => (
              <FeatureCard key={d.title} index={d.icon} title={d.title}>{d.description}</FeatureCard>
            ))}
          </div>
        </div>
      </section>

      <section id="subjects" className="section soft" style={{ scrollMarginTop: 90 }}>
        <div className="container">
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>Subjects</div>
            <h2 className="title">Five subjects to start</h2>
            <p className="lead" style={{ margin: "0 auto" }}>
              Taught by the founder for the founding cohort. More subjects — Physics, Chemistry, Biology, Economics, and A Levels — are on the way.
            </p>
            <p style={{ marginTop: 10, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/o-level/lectures" style={{ color: "var(--blue)", fontWeight: 700, fontSize: ".92rem" }}>Browse all lessons →</Link>
              <Link href="/o-level/quizzes" style={{ color: "var(--blue)", fontWeight: 700, fontSize: ".92rem" }}>Browse all quizzes →</Link>
            </p>
          </div>
          <div className="grid grid-3" style={{ marginTop: 40 }}>
            {subjects.map((s) => (
              <SubjectCard key={s.slug} subject={s} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-2" style={{ alignItems: "center" }}>
          <div>
            <div className="eyebrow">{OFFICE_HOURS.headline}</div>
            <h2 className="title">Your teacher doesn&apos;t disappear when class ends</h2>
            <p className="lead">{OFFICE_HOURS.blurb}</p>
            <p style={{ marginTop: 10, color: "var(--muted)", fontSize: ".88rem" }}>{OFFICE_HOURS.staffing}</p>
          </div>
          <div className="card">
            <ul className="check-list">
              {OFFICE_HOURS.canDo.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <LearningJourney />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>Learning tracks</div>
            <h2 className="title">Study a focused combination</h2>
          </div>
          <div className="grid grid-3" style={{ marginTop: 40 }}>
            {TRACKS.filter((t) => !t.future).map((track) => (
              <article className="card" key={track.id}>
                <h3 style={{ marginTop: 0 }}>{track.name}</h3>
                <p>{track.description}</p>
                <div style={{ display: "flex", flexWrap: "wrap", marginTop: 4 }}>
                  {track.subjectSlugs.map((slug) => (
                    <span className="badge teal" key={slug}>{getSubject(slug)?.name ?? slug}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {instructor && (
        <section className="section soft">
          <div className="container">
            <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
              <div className="eyebrow" style={{ justifyContent: "center" }}>Your teacher</div>
              <h2 className="title">Taught by the founder</h2>
            </div>
            <div style={{ maxWidth: 780, margin: "40px auto 0" }}>
              <InstructorProfile instructor={instructor} />
            </div>
          </div>
        </section>
      )}

      <section id="pricing" className="section" style={{ scrollMarginTop: 90 }}>
        <div className="container">
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>Founding cohort</div>
            <h2 className="title">Lock in founder pricing</h2>
            <p className="lead" style={{ margin: "0 auto" }}>
              Join the first Digital Tutor O Level cohort for the May/June 2027 exam cycle and lock in founder pricing while continuously enrolled.
            </p>
          </div>
          <div style={{ maxWidth: 900, margin: "40px auto 0" }}>
            <AcademyPricingTable />
          </div>
        </div>
      </section>
    </>
  );
}
