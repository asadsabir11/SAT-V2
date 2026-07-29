import { CTAButton, FAQAccordion, FeatureCard, PricingCard, VideoBox } from "@/components/site";
import Link from "next/link";

// ─── To add Ibrahim's welcome video ───────────────────────────────────────────
// 1. Upload the video to YouTube
// 2. Copy the video ID from the URL  e.g. youtube.com/watch?v=ABC123  →  "ABC123"
// 3. Replace undefined below with that ID:  youtubeId="ABC123"
// ─────────────────────────────────────────────────────────────────────────────
const WELCOME_VIDEO_ID = undefined;  // YouTube ID (optional)
const WELCOME_VIDEO_SRC = "/welcome.mp4"; // local file in /public

const features: [string, string][] = [
  ["Weekly Live Classes", "A reliable rhythm, clear instruction, and real-time Q&A every week."],
  ["24/7 AI Tutor", "Step-by-step explanations between classes using original practice examples."],
  ["Original Mock Tests", "Timed full-length practice and score reflection — no copied content."],
  ["Parent Progress Reports", "Simple weekly visibility into attendance, effort, strengths, and next steps."],
  ["Regional Study Groups", "Time-zone-friendly peer accountability via WhatsApp and Telegram."],
  ["Affordable Global Pricing", "Country-aware founder pricing designed around access, not profit."],
];

const ngoPartnerTypes = [
  ["Schools", "Cohort pricing for classrooms and extracurricular SAT clubs."],
  ["NGOs & Scholarship Programs", "Sponsored seats for underserved students at no cost to families."],
  ["Diaspora Organizations", "Support students in your home country from abroad."],
  ["Corporate CSR Programs", "Fund cohorts as part of education or workforce-readiness initiatives."],
  ["Refugee-Support Programs", "Pathway preparation for displaced students pursuing university."],
  ["Community Organizations", "Group cohorts with shared accountability and regional reporting."],
];

const faqs: [string, string][] = [
  ["Is this official SAT prep?", "No. SAT® is a College Board trademark. The Digital Tutor is independent and not endorsed by College Board."],
  ["Should students still use Khan Academy?", "Yes. We encourage students to use free resources. Our program adds structure, live teaching, AI support, mock-test discipline, and parent reporting."],
  ["Do you guarantee score improvement?", "No. We provide structured preparation, practice, feedback, and support, but do not guarantee scores."],
  ["Which countries do you serve?", "Our initial focus is Pakistan, Bangladesh, Nigeria, Indonesia, Malaysia, South Korea, and Haiti, with broader global access."],
  ["Does the AI tutor replace a teacher?", "No. The AI tutor supports practice and explanation. Human instructors guide the program."],
  ["How does early-access pricing work?", "Early cohort students get the lowest price we will ever offer — in exchange for early feedback and patience as we improve."],
];

export default function Home() {
  return (
    <>
      {/* 1 — Hero */}
      <section className="hero">
        <div className="container hero-layout">
          <div>
            <div className="eyebrow">Global access · Serious accountability</div>
            <h1 className="display">Affordable SAT® Prep for Global Students</h1>
            <p className="lead">
              Weekly live classes, 24/7 AI tutoring, original mock tests, regional study groups,
              and parent progress reports — designed for families who need more than free self-study.
            </p>
            <div className="actions">
              <CTAButton href="/register">Get started free</CTAButton>
              <CTAButton href="/register?plan=Core" secondary>Join the cohort →</CTAButton>
            </div>
            <div className="trust-strip">
              <span className="trust-item">Free diagnostic — included after sign-up</span>
              <span className="trust-item">Cohort seats open now</span>
              <span className="trust-item">16+ countries served</span>
              <span className="trust-item">No score guarantee</span>
            </div>
          </div>
          <div className="hero-panel">
            <div className="eyebrow" style={{ color: "#5eead4", marginBottom: 20 }}>The accountability layer</div>
            <div className="stat"><strong>8 weeks</strong><span>Focused SAT prep cohort</span></div>
            <div className="stat"><strong>Weekly</strong><span>Live teaching + homework rhythm</span></div>
            <div className="stat"><strong>Always on</strong><span>AI explanations and study coaching</span></div>
            <div className="stat"><strong>Parent-ready</strong><span>Clear weekly progress visibility</span></div>
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--line)", padding: "0" }}>
        <div className="container">
          <div className="stat-row">
            <div className="stat-cell"><strong>16+</strong><span>Countries in scope</span></div>
            <div className="stat-cell"><strong>8-week</strong><span>Structured cohort</span></div>
            <div className="stat-cell"><strong>200–800</strong><span>Per section, scored diagnostic</span></div>
            <div className="stat-cell"><strong>Free</strong><span>Diagnostic included with sign-up</span></div>
          </div>
        </div>
      </div>

      {/* 2 — Welcome video */}
      <section className="section" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>Meet the founder</div>
            <h2 className="title" style={{ margin: "8px auto 0", maxWidth: 560 }}>
              Hear directly from Ibrahim Malick
            </h2>
          </div>
          <VideoBox youtubeId={WELCOME_VIDEO_ID} videoSrc={WELCOME_VIDEO_SRC} />
        </div>
      </section>

      {/* Founder story */}
      <section className="section">
        <div className="container">
          <div className="eyebrow">About the founder</div>
          <div className="grid grid-2" style={{ alignItems: "center", gap: 48 }}>
            <div>
              <h2 className="title">More than SAT prep. A broader mission.</h2>
              <p className="lead" style={{ marginBottom: 20 }}>
                Founded by <strong>Ibrahim Malick</strong>, a retired technology executive,
                educator, AI specialist, mentor, and lifelong learning advocate, The Digital Tutor
                helps students prepare not only for exams, but for university, AI literacy, and future careers.
              </p>
              <p style={{ color: "var(--muted)", lineHeight: 1.75 }}>
                Ibrahim built this program after recognizing that students across Pakistan,
                Nigeria, Bangladesh, and dozens of other countries have access to the same free
                resources as anyone else — yet still struggle. The gap is not content. It is
                structure, accountability, and a teacher who actually shows up every week.
              </p>
            </div>
            <div className="card" style={{ background: "linear-gradient(145deg,#f4f8ff,#edfdf9)" }}>
              <div className="eyebrow">The larger vision</div>
              <h3 style={{ marginTop: 10 }}>SAT® prep is the starting point</h3>
              <ul style={{ paddingLeft: 20, lineHeight: 2.3, marginTop: 12, color: "var(--muted)" }}>
                <li>University readiness and academic discipline</li>
                <li>AI-enhanced learning and AI literacy</li>
                <li>Mentorship from experienced educators</li>
                <li>Parent accountability and progress visibility</li>
                <li>Future-of-work awareness and career confidence</li>
                <li>Affordable access for underserved learners</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3 — Market problem */}
      <section className="section soft">
        <div className="container">
          <div className="eyebrow">The real problem</div>
          <p className="quote">
            “Students do not fail because free resources do not exist. They struggle because they
            need structure, support, and accountability.”
          </p>
          <div className="grid grid-3" style={{ marginTop: 40 }}>
            {([
              ["Weekly structure", "A consistent weekly class schedule builds the learning habits that self-study alone rarely sustains."],
              ["Human explanation", "A real teacher explains concepts, answers questions live, and adapts to where students are actually struggling."],
              ["Parent visibility", "Parents receive clear weekly updates on attendance, homework completion, and current score trajectory."],
              ["Time-zone support", "Sessions are scheduled around students' local time zones so learners in every region are never left behind."],
              ["Affordable pricing", "Country-aware founder pricing designed around access, not profit — starting under $20 per month."],
              ["Practice discipline", "Regular timed mock tests and weekly homework cycles build the exam stamina that reliably improves scores."],
            ] as [string, string][]).map(([title, desc], i) => (
              <FeatureCard key={title} index={`0${i + 1}`} title={title}>
                {desc}
              </FeatureCard>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — Solution */}
      <section className="section">
        <div className="container">
          <div className="eyebrow">Our solution</div>
          <h2 className="title">Everything needed to keep moving</h2>
          <div className="grid grid-3">
            {features.map(([t, d], i) => (
              <FeatureCard key={t} index={`0${i + 1}`} title={t}>{d}</FeatureCard>
            ))}
          </div>
        </div>
      </section>

      {/* 5 — Founder cohort */}
      <section className="section band">
        <div className="container grid grid-2" style={{ alignItems: "center", gap: 56 }}>
          <div>
            <div className="eyebrow" style={{ color: "#5eead4" }}>8-Week Cohort</div>
            <h2 className="title">8-Week Global SAT® Prep — Core Cohort</h2>
            <p className="lead">
              A small first cohort built around weekly class, AI tutor support, homework, a monthly
              mock, parent reporting, and a regional WhatsApp or Telegram group.
            </p>
            <div className="actions">
              <CTAButton href="/founder-cohort">See the curriculum</CTAButton>
              <CTAButton href="/register?plan=Core" secondary>Reserve your seat</CTAButton>
            </div>
          </div>
          <div className="card" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#fff" }}>
            <h3 style={{ color: "#5eead4", marginTop: 0 }}>Built for visible momentum</h3>
            <ul style={{ paddingLeft: 20, display: "grid", gap: 10, margin: "14px 0 0", color: "rgba(255,255,255,.8)" }}>
              {["Weekly live SAT class","AI tutor support between classes","Weekly homework and review","Monthly full mock test","Parent progress report","Regional accountability group"].map(x=><li key={x}>{x}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* 6 — Target countries */}
      <section className="section">
        <div className="container">
          <div className="eyebrow">Global by design</div>
          <h2 className="title">Start focused. Learn quickly. Expand thoughtfully.</h2>
          <div className="grid grid-3">
            <div className="card">
              <h3>Launch markets</h3>
              <div style={{ marginTop: 10 }}>
                {["Pakistan", "Bangladesh", "Nigeria"].map(x => <span className="badge" key={x}>{x}</span>)}
              </div>
            </div>
            <div className="card">
              <h3>Secondary markets</h3>
              <div style={{ marginTop: 10 }}>
                {["Indonesia", "Malaysia", "South Korea"].map(x => <span className="badge teal" key={x}>{x}</span>)}
              </div>
            </div>
            <div className="card">
              <h3>Sponsored access</h3>
              <span className="badge gold">Haiti</span>
              <h3 style={{ marginTop: 18 }}>Expansion pipeline</h3>
              <div style={{ marginTop: 6 }}>
                {["Vietnam","Nepal","Ghana","Kenya","Philippines","Egypt","Sri Lanka","India","Morocco"].map(x => <span className="badge" key={x}>{x}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7 — Pricing */}
      <section className="section soft">
        <div className="container">
          <div className="eyebrow">Simple founder pricing</div>
          <h2 className="title">Choose the support level you need</h2>
          <div className="grid grid-4" style={{ alignItems: "start" }}>
            <PricingCard
              name="Free"
              price="Free"
              href="/register"
              items={["Free diagnostic test","Free study plan","Parent webinar","Community access"]}
            />
            <PricingCard
              recommended
              name="Core Plan"
              price="$19–$49/mo"
              href={process.env.NEXT_PUBLIC_STRIPE_FOUNDER_COHORT_PAYMENT_LINK ?? "/register?plan=Founder"}
              items={["Weekly live class","AI tutor access","Monthly mock test","Parent progress report","Regional support group"]}
            />
            <PricingCard
              name="Premium"
              price="$99–$199/mo"
              href={process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PAYMENT_LINK ?? "/register?plan=Premium"}
              items={["Small group coaching","Monthly 1:1 review","Score improvement plan","College planning session"]}
            />
            <PricingCard
              name="Sponsored / NGO"
              price="Custom"
              href={process.env.NEXT_PUBLIC_SPONSORED_STUDENT_DONATION_LINK ?? "/partners"}
              items={["Sponsored seats","School or NGO cohort","Group reporting","Partnership support"]}
            />
          </div>
          <div className="actions" style={{ marginTop: 28 }}>
            <Link href="/sample-report" className="btn btn-secondary">See the weekly parent report you&apos;ll receive →</Link>
          </div>
        </div>
      </section>

      {/* 8 — Parent trust */}
      <section className="section">
        <div className="container">
          <div className="eyebrow">Parent trust</div>
          <p className="quote">
            Parents are not paying for more worksheets. They are paying for structure,
            accountability, teacher guidance, and progress visibility.
          </p>
          <div className="grid grid-3" style={{ marginTop: 40 }}>
            {[
              ["Weekly reports", "Parents receive a simple summary each week: attendance, homework, current score, and next priority."],
              ["Live class rhythm", "A scheduled weekly class creates the habit loop that self-study rarely sustains on its own."],
              ["Visible progress", "Diagnostic baseline, monthly mock results, weak areas, and next recommended action — parents see what is happening over time."],
            ].map(([t, d]) => (
              <FeatureCard key={t} index="" title={t}>{d}</FeatureCard>
            ))}
          </div>
          <div className="actions" style={{ marginTop: 28 }}>
            <CTAButton href="/parent-webinar">Register for free parent webinar</CTAButton>
            <Link href="/sample-report" className="btn btn-secondary">See a sample parent report →</Link>
          </div>
        </div>
      </section>

      {/* 9 — Future readiness */}
      <section className="section band">
        <div className="container">
          <div className="eyebrow" style={{ color: "#5eead4" }}>Beyond the SAT®</div>
          <h2 className="title">Preparing students for a changing world</h2>
          <p className="lead" style={{ maxWidth: 680, marginBottom: 36 }}>
            SAT® prep is the starting point. The larger goal is to help students build confidence,
            learning skills, AI awareness, and career readiness for a world that is rapidly evolving.
          </p>
          <div className="grid grid-3">
            {[
              ["University readiness", "Academic discipline, structured deadlines, and study habits that transfer to university and beyond."],
              ["AI literacy", "Students who learn alongside AI tools understand how to use them responsibly — a skill that matters in every future career."],
              ["Career confidence", "Preparation is not just about scores. It is about building the self-belief that a student belongs at the next level."],
            ].map(([t, d]) => (
              <div className="card" key={t} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)" }}>
                <h3 style={{ color: "#5eead4" }}>{t}</h3>
                <p style={{ color: "rgba(255,255,255,.7)" }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10 — School/NGO partnerships */}
      <section className="section soft">
        <div className="container">
          <div className="eyebrow">School and NGO partnerships</div>
          <h2 className="title">Bring affordable SAT® prep to your students</h2>
          <p className="lead" style={{ maxWidth: 640, marginBottom: 36 }}>
            We work with schools, NGOs, scholarship programs, diaspora organizations, and
            corporate CSR programs to sponsor access for students who cannot afford individual pricing.
          </p>
          <div className="grid grid-3">
            {ngoPartnerTypes.map(([t, d]) => (
              <div className="card" key={t}>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
          <div className="actions" style={{ marginTop: 28 }}>
            <CTAButton href="/partners">Start a partnership conversation</CTAButton>
          </div>
        </div>
      </section>

      {/* 11 — FAQ */}
      <section className="section">
        <div className="container" style={{ maxWidth: 780 }}>
          <div className="eyebrow">Questions, answered</div>
          <h2 className="title">Frequently asked questions</h2>
          <FAQAccordion items={faqs} />
        </div>
      </section>

      {/* 12 — Final CTA */}
      <section style={{ padding: "100px 0", background: "linear-gradient(160deg,#061729 0%,#071b33 45%,#0b2440 100%)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div className="eyebrow" style={{ color: "#5eead4", justifyContent: "center" }}>Ready to start?</div>
          <h2 className="title" style={{ color: "#fff", maxWidth: 680, margin: "12px auto 16px" }}>
            Take the free diagnostic. Join the cohort. Change the trajectory.
          </h2>
          <p style={{ color: "rgba(255,255,255,.6)", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.75, fontSize: "1.05rem" }}>
            The cohort is intentionally small. Seats are limited. If this is the right
            moment, register now — the diagnostic takes 10 minutes.
          </p>
          <div className="actions" style={{ justifyContent: "center", gap: 14 }}>
            <CTAButton href="/register">Create free account →</CTAButton>
            <Link href="/register?plan=Core" className="btn btn-ghost">Reserve your cohort seat</Link>
          </div>
          <p style={{ color: "rgba(255,255,255,.3)", fontSize: ".8rem", marginTop: 28, lineHeight: 1.6 }}>
            SAT® is a trademark registered by the College Board · Not affiliated with or endorsed by College Board
          </p>
        </div>
      </section>
    </>
  );
}
