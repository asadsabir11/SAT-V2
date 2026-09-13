import type { Metadata } from "next";
import { CTAButton, FAQAccordion, FeatureCard, PricingCard, VideoBox } from "@/components/site";
import Link from "next/link";

// Title/description are inherited from the root layout — this only pins the
// canonical, which the homepage was previously missing entirely.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

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
            <h1 className="display">SAT® Prep and Cambridge O Level — Live Teaching, Global Access</h1>
            <p className="lead">
              Weekly live classes, 24/7 AI tutoring, original practice, and parent progress reports —
              for SAT® applicants and Cambridge O Level / IGCSE students who need more than free self-study.
            </p>
            <div className="actions">
              <CTAButton href="/register">Register for SAT →</CTAButton>
              <CTAButton href="/o-level#apply" secondary>Register for O Level →</CTAButton>
              <CTAButton href="/punjab-board-9th-class#apply" secondary>Register for 9th Grade →</CTAButton>
            </div>
            <div className="trust-strip">
              <span className="trust-item">Free SAT diagnostic — included after sign-up</span>
              <span className="trust-item">Cohort seats open now</span>
              <span className="trust-item">16+ countries served</span>
              <span className="trust-item">No score guarantee</span>
            </div>
            <p style={{ marginTop: 18 }}>
              <Link href="/scholarship" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#0f4d3f", background: "#e3fbf3", border: "1.5px solid #9fe8cf", borderRadius: 999, padding: "8px 18px", fontWeight: 800, fontSize: ".88rem", textDecoration: "none" }}>
                🎓 Can&apos;t afford the fees? Apply for an Opportunity Scholarship →
              </Link>
            </p>
          </div>
          <div className="hero-panel">
            <div className="eyebrow" style={{ color: "#5eead4", marginBottom: 20 }}>The accountability layer</div>
            <div className="stat"><strong>Weekly</strong><span>Live teaching + homework rhythm</span></div>
            <div className="stat"><strong>Always on</strong><span>AI explanations and study coaching</span></div>
            <div className="stat"><strong>Parent-ready</strong><span>Clear weekly progress visibility</span></div>
            <div className="stat"><strong>Three programs</strong><span>SAT®, Cambridge O Level &amp; 9th Class</span></div>
          </div>
        </div>
      </section>

      {/* Program picker */}
      <section className="section" style={{ paddingBottom: 20 }}>
        <div className="container">
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>Choose your program</div>
            <h2 className="title">One academy, three ways to get ahead</h2>
          </div>
          <div className="grid grid-3" style={{ marginTop: 32 }}>
            <article className="card" style={{ display: "flex", flexDirection: "column" }}>
              <h3 style={{ marginTop: 0 }}>SAT® Preparation</h3>
              <p style={{ flex: 1 }}>Affordable SAT® prep for ambitious global students — weekly live classes, AI tutor, and mock tests.</p>
              <ul className="check-list" style={{ margin: "14px 0 20px" }}>
                <li>Weekly live classes</li>
                <li>24/7 AI tutor</li>
                <li>Original mock tests</li>
                <li>Parent progress reports</li>
              </ul>
              <a href="#sat-prep" className="btn btn-primary">Explore SAT Prep</a>
            </article>
            <article className="card" style={{ display: "flex", flexDirection: "column" }}>
              <h3 style={{ marginTop: 0 }}>Cambridge O Level / IGCSE</h3>
              <p style={{ flex: 1 }}>Live O Level tuition where students are never left stuck — open office hours and past-paper mastery.</p>
              <ul className="check-list" style={{ margin: "14px 0 20px" }}>
                <li>Live classes</li>
                <li>Open office hours</li>
                <li>Past-paper mastery</li>
                <li>Parent reporting</li>
              </ul>
              <Link href="/o-level" className="btn btn-primary">Explore O Level</Link>
            </article>
            <article className="card" style={{ display: "flex", flexDirection: "column" }}>
              <h3 style={{ marginTop: 0 }}>9th Class (Punjab Board)</h3>
              <p style={{ flex: 1 }}>Live online classes for Biology and Computer Science groups, following the latest Punjab Board syllabus — PKR 2,500/month for all subjects.</p>
              <ul className="check-list" style={{ margin: "14px 0 20px" }}>
                <li>Attend your first week before paying</li>
                <li>Live classes and teacher support</li>
                <li>Regular tests and progress tracking</li>
                <li>Parent progress updates</li>
              </ul>
              <Link href="/punjab-board-9th-class" className="btn btn-primary">Explore 9th Class</Link>
            </article>
          </div>
        </div>
      </section>

      {/* Amna Shamima Foundation — exclusive program banner */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap",
              padding: "34px 40px", borderRadius: 22,
              background: "linear-gradient(135deg,#4c1d95,#5b21b6 45%,#1e3a8a)",
              boxShadow: "0 16px 40px rgba(76,29,149,.35)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
              <div style={{ width: 110, height: 110, borderRadius: 18, background: "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 6px 18px rgba(0,0,0,.2)", padding: 6 }}>
                <img src="/amna-shamima-logo.png" alt="Amna Shamima Foundation" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <div>
                <div className="eyebrow" style={{ color: "#c4b5fd" }}>🤝 Partnership Program</div>
                <h3 style={{ margin: "4px 0 8px", color: "#fff", fontSize: "1.35rem", fontWeight: 900, letterSpacing: "-.02em" }}>
                  AI Course for Amna Shamima Foundation Students Only
                </h3>
                <p style={{ margin: 0, color: "rgba(255,255,255,.8)", maxWidth: 560 }}>
                  A dedicated AI training program built exclusively for Amna Shamima Foundation students.
                </p>
              </div>
            </div>
            <Link href="/amna-shamima" className="btn" style={{ flexShrink: 0, background: "#fff", color: "#4c1d95", fontWeight: 800, padding: "14px 30px", fontSize: "1rem" }}>Visit →</Link>
          </div>
        </div>
      </section>

      {/* Weekly class schedule */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: "center" }}>Live class rhythm</div>
          <h2 className="title" style={{ textAlign: "center" }}>Weekly Class Schedule</h2>
          <p className="lead" style={{ textAlign: "center", margin: "0 auto 32px", maxWidth: 640 }}>
            Every program runs on a fixed weekly rhythm — the same structure that keeps students consistent instead
            of relying on self-study alone.
          </p>
          <div className="card" style={{ padding: 0, overflow: "hidden", maxWidth: 900, margin: "0 auto" }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>5:00–6:00 PM</th>
                    <th>6:15–7:15 PM</th>
                    <th>7:30–8:30 PM</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Monday", "Grade 9 English", "O Level English", "SAT"],
                    ["Tuesday", "Grade 9 Mathematics", "O Level Mathematics", "—"],
                    ["Wednesday", "Grade 9 Computer Science", "O Level Computer Science", "—"],
                    ["Thursday", "Grade 9 English", "O Level English", "SAT"],
                    ["Friday", "Grade 9 Mathematics", "O Level Mathematics", "—"],
                    ["Saturday", "Grade 9 Computer Science", "O Level Computer Science", "—"],
                    ["Sunday", "No classes", "Recording backup/makeup", "Weekly planning"],
                  ].map(([day, slot1, slot2, slot3]) => (
                    <tr key={day}>
                      <td style={{ fontWeight: 800, color: "#071b33" }}>{day}</td>
                      <td style={{ color: slot1 === "—" || slot1 === "No classes" ? "#a0aec0" : "#344054" }}>{slot1}</td>
                      <td style={{ color: slot2 === "—" ? "#a0aec0" : "#344054" }}>{slot2}</td>
                      <td style={{ color: slot3 === "—" ? "#a0aec0" : "#344054" }}>{slot3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p style={{ textAlign: "center", color: "var(--muted)", fontSize: ".85rem", marginTop: 16 }}>
            Times shown in Pakistan Standard Time (PKT). Exact batch timing is confirmed after registration.
          </p>
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

      {/* We're hiring — careers callout */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: 40 }}>
        <div className="container">
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap",
              padding: "30px 36px", borderRadius: 20,
              background: "linear-gradient(135deg,#065f46,#0e7490 60%,#155eef)",
              boxShadow: "0 16px 40px rgba(6,95,70,.25)",
            }}
          >
            <div>
              <div className="eyebrow" style={{ color: "#5eead4" }}>👨‍🏫 We&apos;re Hiring</div>
              <h3 style={{ margin: "4px 0 8px", color: "#fff", fontSize: "1.3rem", fontWeight: 900, letterSpacing: "-.02em" }}>
                Teach With The Digital Tutor
              </h3>
              <p style={{ margin: 0, color: "rgba(255,255,255,.82)", maxWidth: 560 }}>
                We&apos;re looking for experienced teachers across SAT, Cambridge O Level, and Punjab Board 9th Class.
                Submit your resume and our team will contact you directly.
              </p>
            </div>
            <Link href="/careers" className="btn" style={{ flexShrink: 0, background: "#fff", color: "#065f46", fontWeight: 800, padding: "14px 30px", fontSize: "1rem" }}>
              Apply Now →
            </Link>
          </div>
        </div>
      </section>

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
      <section id="sat-prep" className="section" style={{ scrollMarginTop: 90 }}>
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
          <div className="eyebrow">SAT pricing</div>
          <h2 className="title">Simple SAT Prep Pricing</h2>
          <div className="grid grid-2" style={{ alignItems: "start", maxWidth: 640 }}>
            <PricingCard
              name="Free"
              price="Free"
              href="/register"
              items={["Free diagnostic test","Free study plan","Parent webinar","Community access"]}
            />
            <PricingCard
              recommended
              name="Core Plan"
              price="$19/mo · ~PKR 5,300/mo"
              href="/register?plan=Core"
              items={["Weekly live class","AI tutor access","Monthly mock test","Parent progress report","Regional support group"]}
            />
          </div>
          <div className="actions" style={{ marginTop: 28 }}>
            <Link href="/sample-report" className="btn btn-secondary">See the weekly parent report you&apos;ll receive →</Link>
          </div>
        </div>
      </section>

      {/* 7b — Opportunity Scholarship */}
      <section className="section" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div className="container">
          <div className="card" style={{ textAlign: "center", padding: "48px 32px", background: "linear-gradient(135deg,#0f2d54,#0b4a3d)", border: "none" }}>
            <div style={{ fontSize: "2.2rem", marginBottom: 10 }}>🎓</div>
            <div className="eyebrow" style={{ justifyContent: "center", color: "#5eead4" }}>The Digital Tutor Opportunity Scholarship</div>
            <h2 className="title" style={{ color: "#fff", maxWidth: 620, margin: "10px auto 12px" }}>
              Education should create opportunity — not be blocked by it.
            </h2>
            <p className="lead" style={{ margin: "0 auto 28px", maxWidth: 560, color: "rgba(255,255,255,.75)" }}>
              For every cohort, The Digital Tutor reserves places for deserving students who demonstrate financial
              need and a commitment to learning. Scholarship students get the same live classes, AI tutor, and
              parent reports as every other student — free.
            </p>
            <Link href="/scholarship" className="btn btn-primary">Apply for a Scholarship →</Link>
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

      {/* 11 — FAQ */}
      <section className="section">
        <div className="container" style={{ maxWidth: 780 }}>
          <div className="eyebrow">Questions, answered</div>
          <h2 className="title">Frequently asked questions</h2>
          <FAQAccordion items={faqs} />
        </div>
      </section>
    </>
  );
}
