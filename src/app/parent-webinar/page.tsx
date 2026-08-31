import type { Metadata } from "next";
import Link from "next/link";
import { CTAButton, PageHero } from "@/components/site";

const BASE_URL = "https://academy.thedigitaltutor.net";

export const metadata: Metadata = {
  title: "For Parents",
  description: "How The Digital Tutor keeps parents in the loop — weekly progress reports, attendance, and how your parent account gets set up.",
  alternates: { canonical: `${BASE_URL}/parent-webinar` },
  openGraph: {
    title: "For Parents — The Digital Tutor",
    description: "Weekly progress reports and clear visibility into your child's SAT or O Level prep, without micromanaging every worksheet.",
    url: `${BASE_URL}/parent-webinar`,
    type: "website",
    images: ["/opengraph-image"],
  },
};

export default function ParentGuidance() {
  return (
    <>
      <PageHero eyebrow="For parents" title="Support the System, Not Every Worksheet.">
        Ambitious students need accountability, not another person checking their homework line by line. Here&apos;s
        how we keep you informed — and how your parent account works.
      </PageHero>

      <section className="section">
        <div className="container">
          <div className="eyebrow">What you get as a parent</div>
          <h2 className="title">Visibility, without the micromanaging.</h2>
          <div className="grid grid-3" style={{ marginTop: 32 }}>
            <div className="card">
              <h3>Weekly progress reports</h3>
              <p>Attendance, homework completion, quiz performance, and a plain-language note from the coach — every week.</p>
            </div>
            <div className="card">
              <h3>Strengths and focus areas</h3>
              <p>See exactly what your child is doing well and what needs more attention, instead of guessing from a raw score.</p>
            </div>
            <div className="card">
              <h3>One clear next action</h3>
              <p>Each report includes a single, specific thing you can do that week — not a long list to manage yourself.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <div className="eyebrow">How it works</div>
          <h2 className="title">How Your Parent Account Is Set Up</h2>
          <div className="grid grid-2" style={{ marginTop: 32, textAlign: "left" }}>
            <div className="card">
              <div className="icon">1</div>
              <h3>Your child registers</h3>
              <p>They sign up for SAT Prep or O Level and include your email as their parent contact.</p>
            </div>
            <div className="card">
              <div className="icon">2</div>
              <h3>We set up your account</h3>
              <p>Our team creates your parent account and links it to your child&apos;s profile — nothing for you to do yet.</p>
            </div>
            <div className="card">
              <div className="icon">3</div>
              <h3>You get a set-password email</h3>
              <p>A secure link arrives at your email so you can choose your own password. Nobody sends you a password to share.</p>
            </div>
            <div className="card">
              <div className="icon">4</div>
              <h3>Sign in as Parent</h3>
              <p>From then on, sign in anytime to see attendance, homework, and weekly reports for your child.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>See it for yourself</div>
          <h2 className="title">Curious what a report actually looks like?</h2>
          <div className="actions" style={{ justifyContent: "center" }}>
            <Link href="/sample-report" className="btn btn-secondary">See a sample report →</Link>
            <CTAButton href="/founder-cohort">Explore SAT Prep</CTAButton>
            <CTAButton href="/o-level" variant="secondary">Explore O Level</CTAButton>
          </div>
        </div>
      </section>
    </>
  );
}
