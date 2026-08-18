import type { Metadata } from "next";
import { CTAButton, FeatureCard, PageHero } from "@/components/site";
import { getSession } from "@/lib/auth";
import { getUserProgram } from "@/lib/users";

const BASE_URL = "https://academy.thedigitaltutor.net";

export const metadata: Metadata = {
  title: "SAT Prep Founding Cohort | The Digital Tutor",
  description: "Live online SAT prep with weekly classes, a 24/7 AI tutor, original mock tests, and weekly parent progress reports — founder pricing for the founding cohort.",
  alternates: { canonical: `${BASE_URL}/founder-cohort` },
  openGraph: {
    title: "SAT Prep Founding Cohort — Now Enrolling",
    description: "Live weekly SAT classes, AI tutor access, original mocks, and parent progress reporting at founder pricing.",
    url: `${BASE_URL}/founder-cohort`,
    type: "website",
  },
};

const WEEKS = [
  "Diagnostic test and Digital SAT overview",
  "Reading and Writing foundations",
  "Grammar, transitions, and rhetorical synthesis",
  "Algebra and linear equations",
  "Advanced math, functions, and problem solving",
  "Data analysis, geometry, and calculator strategy",
  "Timed module practice and test-day strategy",
  "Full mock test and final score improvement plan",
];

export default async function SatFoundingCohort() {
  const session = await getSession();
  // session.program is only reliable on tokens issued since it was added —
  // older sessions (up to 7 days) don't have it, so fall back to a real DB
  // lookup instead of assuming SAT, which would wrongly show O-Level-only
  // students a "View Material" link into a program they never registered for.
  const isSignedInSatStudent = session?.role === "student"
    && (session.program ?? await getUserProgram(session.email)) === "sat";

  return (
    <>
      <PageHero
        eyebrow="SAT Prep · The first 8 weeks"
        title="An SAT Prep Cohort for Students Who Need a Plan — and People Who Notice When They Drift."
        actions={
          isSignedInSatStudent ? (
            <CTAButton href="/sat">View Material →</CTAButton>
          ) : (
            <CTAButton href="/register?plan=Core">Reserve Your SAT Founding Cohort Seat</CTAButton>
          )
        }
      >
        Live SAT instruction, AI tutor support, disciplined practice, a regional study group, and clear parent
        reporting — at founder pricing.
      </PageHero>

      <section className="section">
        <div className="container grid grid-3">
          <FeatureCard index="01" title="Who should join">
            Students preparing for the SAT and global university applications who want more accountability than
            self-study alone.
          </FeatureCard>
          <FeatureCard index="02" title="What students get">
            Weekly live SAT classes, original homework and mock tests, 24/7 AI tutor guidance, a regional study
            group, and a personal next action every week.
          </FeatureCard>
          <FeatureCard index="03" title="What parents get">
            Weekly attendance, homework completion, score progress, weak-area breakdowns, and next-step visibility —
            without micromanaging every worksheet.
          </FeatureCard>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <div className="eyebrow">SAT curriculum</div>
          <h2 className="title">Eight Weeks. One Clear SAT Prep Arc.</h2>
          <div className="grid grid-2">
            {WEEKS.map((w, i) => (
              <div className="card" key={w}>
                <div className="eyebrow">Week {i + 1}</div>
                <h3>{w}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section band">
        <div className="container grid grid-2" style={{ alignItems: "center" }}>
          <div>
            <div className="eyebrow" style={{ color: "#5eead4" }}>SAT founding-cohort pricing</div>
            <h2 className="title">$19/mo · ~PKR 5,300/mo</h2>
            <p className="lead">
              Early SAT cohort members help shape class times, reporting, community support, and what we build next.
            </p>
          </div>
          <div className="card">
            {isSignedInSatStudent ? (
              <>
                <h3>Ready to keep going?</h3>
                <p>
                  Jump back into your Q&amp;A board, live sessions, lectures, diagnostic, and AI tutor.
                </p>
                <CTAButton href="/sat">View Material →</CTAButton>
              </>
            ) : (
              <>
                <h3>Ready to build SAT momentum?</h3>
                <p>
                  Register now. We&apos;ll use your country, target SAT date, and preferred time to place you in the
                  right regional group.
                </p>
                <CTAButton href="/register?plan=Core">Reserve Your SAT Founding Cohort Seat</CTAButton>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
