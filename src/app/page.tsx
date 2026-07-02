import { CTAButton, FAQAccordion, FeatureCard, PricingCard } from "@/components/site";

const features: [string, string][] = [
  ["Weekly Live Classes", "A reliable rhythm, clear instruction, and real-time questions."],
  ["24/7 AI Tutor", "Step-by-step support between classes using original practice examples."],
  ["Original Mock Tests", "Timed practice and score reflection without copied test material."],
  ["Parent Progress Reports", "Simple visibility into attendance, effort, strengths, and next steps."],
  ["Regional Study Groups", "Time-zone friendly peer accountability through regional communities."],
  ["Affordable Global Pricing", "Country-aware founder pricing designed around access."],
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
  ["How does founder pricing work?", "Founder cohort students get the lowest price we will ever offer — in exchange for early feedback and patience as we improve."],
];

export default function Home() {
  return (
    <>
      {/* 1 — Hero */}
      <section className="hero">
        <div className="container hero-layout">
          <div>
            <div className="eyebrow">Global access. Serious accountability.</div>
            <h1 className="display">Affordable SAT® Prep for Global Students</h1>
            <p className="lead">
              Weekly live classes, 24/7 AI tutoring, original mock tests, regional study groups,
              and parent progress reports for students preparing for global university opportunities.
            </p>
            <div className="actions">
              <CTAButton href="/diagnostic">Take free diagnostic</CTAButton>
              <CTAButton href="/register?plan=Founder" secondary>Join founder cohort</CTAButton>
              <CTAButton href="/parent-webinar" secondary>Parent webinar</CTAButton>
              <CTAButton href="/partners" secondary>Partner with us</CTAButton>
            </div>
            <p style={{ marginTop: 28, color: "#5d6d82" }}>
              Designed for families who need more structure than free self-study but cannot afford
              expensive private tutoring.
            </p>
          </div>
          <div className="hero-panel">
            <div className="eyebrow" style={{ color: "#5eead4" }}>The accountability layer</div>
            <div className="stat"><strong>8 weeks</strong><span>Focused founder cohort</span></div>
            <div className="stat"><strong>Weekly</strong><span>Live teaching + homework rhythm</span></div>
            <div className="stat"><strong>Always on</strong><span>AI explanations and study coaching</span></div>
            <div className="stat"><strong>Parent-ready</strong><span>Clear progress visibility</span></div>
          </div>
        </div>
      </section>

      {/* 2 — Founder story */}
      <section className="section">
        <div className="container">
          <div className="eyebrow">About the founder</div>
          <div className="grid grid-2" style={{ alignItems: "center", gap: 40 }}>
            <div>
              <h2 className="title">More than SAT prep. A broader mission.</h2>
              <p className="lead" style={{ marginBottom: 20 }}>
                Founded by <strong>Ibrahim Malick</strong>, a retired technology executive,
                educator, AI specialist, mentor, and lifelong learning advocate, The Digital Tutor
                helps students prepare not only for exams, but for university, AI literacy, and
                future careers.
              </p>
              <p>
                Ibrahim built this program after recognizing that students across Pakistan,
                Nigeria, Bangladesh, and dozens of other countries have access to the same free
                resources as anyone else — yet still struggle. The gap is not content. It is
                structure, accountability, and a teacher who actually shows up every week.
              </p>
            </div>
            <div className="card">
              <div className="eyebrow">The larger vision</div>
              <h3>SAT® prep is the starting point</h3>
              <ul style={{ paddingLeft: 20, lineHeight: 2.2, marginTop: 12 }}>
                <li>University readiness</li>
                <li>AI-enhanced learning</li>
                <li>Mentorship from experienced educators</li>
                <li>Parent accountability and progress visibility</li>
                <li>Future-of-work awareness</li>
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
            "Students do not fail because free resources do not exist. They struggle because they
            need structure, support, and accountability."
          </p>
          <div className="grid grid-3" style={{ marginTop: 32 }}>
            {["Weekly structure", "Human explanation", "Parent visibility", "Regional time-zone support", "Affordable pricing", "Practice discipline"].map((x, i) => (
              <FeatureCard key={x} index={`0${i + 1}`} title={x}>
                A practical layer that turns good intentions and free resources into consistent action.
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
        <div className="container grid grid-2" style={{ alignItems: "center" }}>
          <div>
            <div className="eyebrow" style={{ color: "#5eead4" }}>Founder cohort</div>
            <h2 className="title">8-Week Global SAT® Prep Founder Cohort</h2>
            <p className="lead">
              A small first cohort built around weekly class, AI tutor support, homework, a monthly
              mock, parent reporting, and a regional WhatsApp or Telegram group.
            </p>
            <div className="actions">
              <CTAButton href="/founder-cohort">See the curriculum</CTAButton>
            </div>
          </div>
          <div className="card">
            <h3>Built for visible momentum</h3>
            <ul>
              <li>Weekly live SAT class</li>
              <li>AI tutor support</li>
              <li>Weekly homework</li>
              <li>Monthly mock test</li>
              <li>Parent progress report</li>
              <li>Regional accountability group</li>
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
              {["Pakistan", "Bangladesh", "Nigeria"].map((x) => (
                <span className="badge" key={x}>{x}</span>
              ))}
            </div>
            <div className="card">
              <h3>Secondary markets</h3>
              {["Indonesia", "Malaysia", "South Korea"].map((x) => (
                <span className="badge teal" key={x}>{x}</span>
              ))}
            </div>
            <div className="card">
              <h3>Sponsored access</h3>
              <span className="badge gold">Haiti</span>
              <h3 style={{ marginTop: 16 }}>Expansion</h3>
              {["Vietnam", "Nepal", "Ghana", "Kenya", "Philippines", "Egypt", "Sri Lanka", "India", "Morocco"].map((x) => (
                <span className="badge" key={x}>{x}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7 — Pricing */}
      <section className="section soft">
        <div className="container">
          <div className="eyebrow">Simple founder pricing</div>
          <h2 className="title">Choose the support level you need</h2>
          <div className="grid grid-4">
            <PricingCard
              name="Free"
              price="Free"
              href="/diagnostic"
              items={["Free diagnostic test", "Free study plan", "Parent webinar", "Community access"]}
            />
            <PricingCard
              recommended
              name="Founder Core"
              price="$19–$49/mo"
              href="/register?plan=Founder"
              items={["Weekly live class", "AI tutor access", "Monthly mock test", "Parent progress report", "Regional support group"]}
            />
            <PricingCard
              name="Premium"
              price="$99–$199/mo"
              href="/register?plan=Premium"
              items={["Small group coaching", "Monthly 1:1 review", "Score improvement plan", "College planning session"]}
            />
            <PricingCard
              name="Sponsored / NGO"
              price="Custom"
              href="/partners"
              items={["Sponsored seats", "School or NGO cohort", "Group reporting", "Partnership support"]}
            />
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
          <div className="grid grid-3" style={{ marginTop: 32 }}>
            {[
              ["Weekly reports", "Parents receive a simple summary: attendance, homework, current score, and next priority."],
              ["Live class rhythm", "A scheduled weekly class creates the habit loop that self-study rarely sustains."],
              ["Visible progress", "Diagnostic baseline → monthly mock → target score. Parents see the gap close."],
            ].map(([t, d]) => (
              <FeatureCard key={t} index="" title={t}>{d}</FeatureCard>
            ))}
          </div>
          <div className="actions" style={{ marginTop: 24 }}>
            <CTAButton href="/parent-webinar">Register for parent webinar</CTAButton>
          </div>
        </div>
      </section>

      {/* 9 — Future readiness */}
      <section className="section band">
        <div className="container">
          <div className="eyebrow" style={{ color: "#5eead4" }}>Beyond the SAT®</div>
          <h2 className="title">Preparing students for a changing world</h2>
          <p className="lead" style={{ maxWidth: 680 }}>
            SAT® prep is the starting point. The larger goal is to help students build confidence,
            learning skills, AI awareness, and career readiness for a changing world.
          </p>
          <div className="grid grid-3" style={{ marginTop: 32 }}>
            {[
              ["University readiness", "Academic discipline, structured deadlines, and study habits that transfer to university and beyond."],
              ["AI literacy", "Students who learn alongside AI tools understand how to use them responsibly — a skill that matters in every future career."],
              ["Career confidence", "Preparation is not just about scores. It is about building the self-belief that a student belongs at the next level."],
            ].map(([t, d]) => (
              <div className="card" key={t}>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10 — School/NGO partnerships */}
      <section className="section soft">
        <div className="container">
          <div className="eyebrow">School and NGO partnerships</div>
          <h2 className="title">Bring low-cost SAT® prep to your students</h2>
          <p className="lead" style={{ maxWidth: 640, marginBottom: 32 }}>
            We work with schools, NGOs, scholarship programs, diaspora organizations, and
            corporate CSR programs to sponsor access for students who cannot afford individual
            pricing.
          </p>
          <div className="grid grid-3">
            {ngoPartnerTypes.map(([t, d]) => (
              <div className="card" key={t}>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
          <div className="actions" style={{ marginTop: 24 }}>
            <CTAButton href="/partners">Start a partnership conversation</CTAButton>
          </div>
        </div>
      </section>

      {/* 11 — FAQ */}
      <section className="section">
        <div className="container">
          <div className="eyebrow">Questions, answered</div>
          <h2 className="title">Frequently asked questions</h2>
          <FAQAccordion items={faqs} />
        </div>
      </section>

      {/* 12 — CTA footer */}
      <section className="section band">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="eyebrow" style={{ color: "#5eead4" }}>Ready to start?</div>
          <h2 className="title" style={{ maxWidth: 700, margin: "0 auto 16px" }}>
            Take the free diagnostic. Join the founder cohort. Change the trajectory.
          </h2>
          <p className="lead" style={{ maxWidth: 560, margin: "0 auto 32px" }}>
            The founder cohort is intentionally small. Seats are limited. If this is the right
            moment, register now.
          </p>
          <div className="actions" style={{ justifyContent: "center" }}>
            <CTAButton href="/diagnostic">Take free diagnostic</CTAButton>
            <CTAButton href="/register?plan=Founder" secondary>Reserve founder cohort seat</CTAButton>
          </div>
        </div>
      </section>
    </>
  );
}
