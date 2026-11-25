import type { Metadata } from "next";
import { CTAButton, FAQAccordion } from "@/components/site";
import { Punjab10thRegistrationForm } from "@/components/Punjab10thRegistrationForm";
import { getSession } from "@/lib/auth";

const BASE_URL = "https://academy.thedigitaltutor.net";
const WHATSAPP_HERO_LINK = "https://wa.me/923316663291?text=Assalam-oAlaikum%2C%20mujhe%2010th%20Class%20online%20program%20ki%20details%20chahiye.";

export const metadata: Metadata = {
  title: "Punjab Board 10th Class Tuition",
  description: "Live online 10th Class tuition for Biology and Computer Science groups, preparing for Punjab Board exams. PKR 10,000 per month, all subjects included.",
  alternates: { canonical: `${BASE_URL}/punjab-board-10th-class` },
  openGraph: {
    title: "Punjab Board 10th Class Tuition",
    description: "Live online 10th Class tuition for Biology and Computer Science groups, preparing for Punjab Board exams. PKR 10,000 per month, all subjects included.",
    url: `${BASE_URL}/punjab-board-10th-class`,
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
    title: "Punjab Board 10th Class Tuition",
    description: "Live online 10th Class tuition for Biology and Computer Science groups, preparing for Punjab Board exams. PKR 10,000 per month, all subjects included.",
  },
};

const SUPPORTING_POINTS = [
  "Try the first week free of charge",
  "Teacher-led live sessions, real support",
  "Progress tracked through tests and homework",
  "Choose the Biology or Computer Science group",
];

const TRUST_POINTS = ["Every core subject covered", "Live, teacher-led classes", "Built for Punjab Board exams", "Frequent testing", "Regular parent updates", "Flat PKR 10,000/month"];

const BIOLOGY_SUBJECTS = ["English", "Urdu", "Maths", "Physics", "Chemistry", "Biology", "Islamiat", "Tarjuma-tul-Quran or Ethics, where applicable"];
const CS_SUBJECTS = ["English", "Urdu", "Maths", "Physics", "Chemistry", "Computer Science", "Islamiat", "Tarjuma-tul-Quran or Ethics, where applicable"];

const WHAT_STUDENTS_RECEIVE = [
  { icon: "🎓", title: "Live teaching", description: "Scheduled live classes where students can ask questions in real time." },
  { icon: "📚", title: "Complete syllabus coverage", description: "Every lesson is mapped to the current Punjab Board syllabus and exam requirements." },
  { icon: "📝", title: "Notes and assignments", description: "Students get organized notes, practice questions and homework every week." },
  { icon: "✅", title: "Chapter tests", description: "Regular testing catches weak spots early, before they turn into real problems." },
  { icon: "🎯", title: "Exam preparation", description: "Students build exam skills through key questions, past-paper patterns and timing practice." },
  { icon: "🎥", title: "Class recordings", description: "Recorded sessions let students revise a lesson or catch up after a missed class." },
  { icon: "🙋", title: "Teacher support", description: "Students can reach a teacher for extra help outside class hours, per the academy's support schedule." },
  { icon: "📊", title: "Parent updates", description: "Parents get regular updates on attendance, assignment completion and test results." },
];

const HOW_IT_WORKS = [
  { title: "Fill out the registration form", description: "Choose either the Biology or Computer Science group." },
  { title: "Get your class details", description: "A member of our admissions team will WhatsApp the parent directly." },
  { title: "Join the first week", description: "Sit in on real classes before any payment is due." },
  { title: "Continue at PKR 10,000 per month", description: "One flat fee for the entire 10th Class subject package — not priced per subject." },
];

const PARENT_MONITOR_POINTS = ["Attendance in every class", "Homework and assignment completion", "Scores on chapter tests", "Subjects that need extra focus", "Overall participation and consistency"];

const PRICING_INCLUDES = ["Your choice of Biology or Computer Science group", "Live classes across every included subject", "Complete notes and assignment sets", "Ongoing chapter tests", "Access to recorded sessions", "Ongoing academic support", "Regular parent progress reports"];

const FAQ_ITEMS: [string, string][] = [
  ["Does PKR 10,000 cover just one subject?", "No — this fee covers the entire 10th Class package for whichever group, Biology or Computer Science, the student selects."],
  ["Will classes be live or pre-recorded?", "Lessons are taught live, with recordings also made available for revision or missed sessions."],
  ["Can my child attend before we pay anything?", "Yes — once registered, your child can join the first week at no cost. Payment is only needed to continue after that trial week."],
  ["Which Punjab Boards does this program support?", "It's built around the shared Punjab curriculum and exam pattern, so students from Lahore, Gujranwala, Rawalpindi, Faisalabad, Multan, Sargodha, Sahiwal, Bahawalpur and D.G. Khan boards can all register."],
  ["Can I choose between Biology and Computer Science?", "Yes — parents pick the group that fits their child during registration."],
  ["Do you guarantee a certain grade or score?", "No responsible academy can promise specific marks. We provide the structured teaching, practice and support — the final result also depends on the student's attendance, effort and completed assignments."],
  ["What do we need at home to join classes?", "Just a phone, tablet or computer with a reliable internet connection, plus the usual notebooks and textbooks."],
  ["How are parents kept in the loop?", "All communication and progress updates go out through the WhatsApp number given at registration."],
];

export default async function Punjab10thClassPage() {
  const session = await getSession();
  const isSignedInAsPunjab10th = session?.role === "student" && session.program === "punjab-10th";

  return (
    <>
      {/* 1 — Hero */}
      <section className="section band">
        <div className="container">
          <div className="hero-layout">
            <div>
              <div className="eyebrow" style={{ color: "#5eead4" }}>Phase 1 — Admissions Open</div>
              <h1 className="display" style={{ color: "#fff", maxWidth: 780 }}>
                Punjab Board 10th Class — Complete Subject Package
              </h1>
              <p className="lead" style={{ color: "rgba(255,255,255,.78)" }}>
                Join live online classes for the Biology or Computer Science group, guided by experienced teachers
                through the current Punjab Board syllabus.
              </p>
              <p style={{ color: "#5eead4", fontWeight: 800, fontSize: "1.05rem" }}>
                Launch Pricing: PKR 10,000 per month covers every subject
              </p>
              <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 10 }}>
                {SUPPORTING_POINTS.map((p) => (
                  <span key={p} className="badge teal">✓ {p}</span>
                ))}
              </div>
              <div className="actions">
                {isSignedInAsPunjab10th ? (
                  <CTAButton href="/punjab-board-10th-class/portal" variant="accent">Go to My Portal</CTAButton>
                ) : (
                  <CTAButton href="#apply" variant="accent">Register for the First Week</CTAButton>
                )}
                <a href={WHATSAPP_HERO_LINK} target="_blank" rel="noreferrer" className="btn btn-ghost">WhatsApp Us</a>
              </div>
              <p style={{ marginTop: 20, color: "rgba(255,255,255,.6)", fontSize: ".85rem" }}>
                Founding cohort limited to the first 300 students.
              </p>
            </div>
            <div className="hero-panel" style={{ padding: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img
                src="/9th-class-video-call-2.png"
                alt="Punjab Board 10th Class — special launch fee"
                style={{ width: "100%", maxWidth: 520, borderRadius: 18, display: "block", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Trust strip */}
      <section className="section soft">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="title" style={{ marginBottom: 20 }}>An affordable, complete program for every 10th Class student</h2>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
            {TRUST_POINTS.map((t) => (
              <span key={t} className="badge">✓ {t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 3 — Program introduction */}
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="eyebrow">Program introduction</div>
          <h2 className="title">Focused preparation for board exam year</h2>
          <p className="lead">
            10th Class is when board preparation counts most. A recorded video isn&apos;t enough — students need a
            teacher who can explain tricky concepts, review their work and keep them on track.
          </p>
          <p style={{ color: "var(--muted)", lineHeight: 1.75 }}>
            The Digital Tutor delivers a full academy experience from home. Students join scheduled live lessons,
            ask questions in real time, submit assignments and get ready for school and board exams without
            leaving the house.
          </p>
        </div>
      </section>

      {/* 3a — Weekly schedule */}
      <section className="section">
        <div className="container" style={{ maxWidth: 780, textAlign: "center" }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Weekly timetable</div>
          <h2 className="title">Weekly Class Schedule</h2>
          <p className="lead" style={{ margin: "0 auto 24px" }}>All times are Pakistan Standard Time (PKT).</p>
          <img
            src="/punjab-schedule.png"
            alt="Punjab Board 9th and 10th Class weekly schedule, all times PKT: Monday Mathematics, Tuesday General Science, Wednesday Urdu, Thursday Test and Review, Friday English"
            style={{ width: "100%", maxWidth: 640, borderRadius: 16, display: "block", margin: "0 auto" }}
          />
        </div>
      </section>

      {/* 3b — Students learning from home */}
      <section className="section soft">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: "center" }}>See the classroom experience</div>
          <h2 className="title" style={{ textAlign: "center" }}>Guided learning, right from home</h2>
          <div className="grid grid-3" style={{ marginTop: 32 }}>
            <figure style={{ margin: 0 }}>
              <img src="/9th-class-video-call-2.png" alt="Two students in a live online class with their teacher" style={{ width: "100%", borderRadius: 16, display: "block", objectFit: "cover", maxHeight: 320 }} />
              <figcaption style={{ marginTop: 10, color: "var(--muted)", fontSize: ".85rem", textAlign: "center" }}>Taught live by real teachers — never just pre-recorded videos</figcaption>
            </figure>
            <figure style={{ margin: 0 }}>
              <img src="/9th-class-solo-study.png" alt="A student studying independently at home" style={{ width: "100%", borderRadius: 16, display: "block", objectFit: "cover", maxHeight: 320 }} />
              <figcaption style={{ marginTop: 10, color: "var(--muted)", fontSize: ".85rem", textAlign: "center" }}>Organized notes and class recordings make self-revision easy</figcaption>
            </figure>
            <figure style={{ margin: 0 }}>
              <img src="/9th-class-video-call.png" alt="Students taking notes during a live online class" style={{ width: "100%", borderRadius: 16, display: "block", objectFit: "cover", maxHeight: 320 }} />
              <figcaption style={{ marginTop: 10, color: "var(--muted)", fontSize: ".85rem", textAlign: "center" }}>Students stay focused and take notes in every live session</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* 4 — Subject groups */}
      <section className="section soft" id="subjects">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: "center" }}>Subject groups</div>
          <h2 className="title" style={{ textAlign: "center" }}>Pick your 10th Class group</h2>
          <div className="grid grid-2" style={{ marginTop: 32, maxWidth: 820, marginLeft: "auto", marginRight: "auto" }}>
            <article className="card">
              <h3 style={{ marginTop: 0 }}>Biology Group</h3>
              <ul className="check-list">
                {BIOLOGY_SUBJECTS.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </article>
            <article className="card">
              <h3 style={{ marginTop: 0 }}>Computer Science Group</h3>
              <ul className="check-list">
                {CS_SUBJECTS.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </article>
          </div>
          <p style={{ marginTop: 20, textAlign: "center", color: "var(--muted)", fontSize: ".85rem" }}>
            Note: Subject allocation will follow whichever Punjab Board scheme currently applies to the
            student&apos;s academic session.
          </p>
        </div>
      </section>

      {/* 5 — What students receive */}
      <section className="section">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: "center" }}>What students receive</div>
          <h2 className="title" style={{ textAlign: "center" }}>More than a recorded video course</h2>
          <div className="grid grid-3" style={{ marginTop: 32 }}>
            {WHAT_STUDENTS_RECEIVE.map((f) => (
              <article className="card" key={f.title}>
                <div className="icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6 — How the program works */}
      <section className="section soft">
        <div className="container" style={{ maxWidth: 780 }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>How the program works</div>
          <h2 className="title" style={{ textAlign: "center" }}>A straightforward path to steady progress</h2>
          <div style={{ display: "grid", gap: 20, marginTop: 32 }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div className="icon" style={{ flexShrink: 0 }}>{i + 1}</div>
                <div>
                  <h3 style={{ margin: "0 0 4px" }}>{step.title}</h3>
                  <p style={{ margin: 0 }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 — Parent-focused section */}
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="eyebrow">For parents</div>
          <h2 className="title">See real progress, not just a report card at the end</h2>
          <p className="lead">
            No parent should find out their child is falling behind only when the final result arrives.
          </p>
          <p style={{ color: "var(--muted)", marginBottom: 16 }}>Here&apos;s what our system keeps parents informed about:</p>
          <ul className="check-list">
            {PARENT_MONITOR_POINTS.map((p) => <li key={p}>{p}</li>)}
          </ul>
          <div className="card" style={{ marginTop: 28, background: "#eaf1ff", borderColor: "#c9dcfb", textAlign: "center" }}>
            <p style={{ margin: 0, fontWeight: 800, color: "var(--navy)" }}>
              Real teaching for the student. Real visibility for the parent.
            </p>
          </div>
        </div>
      </section>

      {/* 8 — Pricing */}
      <section className="section soft">
        <div className="container" style={{ maxWidth: 560 }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Early Enrollment Offer</div>
          <h2 className="title" style={{ textAlign: "center" }}>Punjab Board 10th Class — Full Package</h2>
          <article className="card" style={{ marginTop: 24, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", border: "2px solid var(--blue)" }}>
            <div className="price">PKR 10,000<span style={{ fontSize: "1rem", fontWeight: 700 }}>/mo</span></div>
            <ul style={{ textAlign: "left", margin: "18px 0 24px", display: "grid", gap: 8 }}>
              {PRICING_INCLUDES.map((i) => (
                <li key={i} style={{ color: "#4a6070", fontSize: ".92rem" }}>✓ {i}</li>
              ))}
            </ul>
            <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 20 }}>
              This introductory price is reserved for the first 300 students who enroll.
            </p>
            <CTAButton href="#apply" variant="primary">Claim This Pricing</CTAButton>
          </article>
          <p style={{ marginTop: 20, textAlign: "center", color: "var(--muted)", fontSize: ".8rem", lineHeight: 1.6 }}>
            There&apos;s no cost to register. New students get seven calendar days with their assigned batch before
            the first payment is due, and access continues once that payment is made from day eight onward. If
            pricing changes later, any month you&apos;ve already paid for stays unaffected.
          </p>
        </div>
      </section>

      {/* 9 — Closing CTA */}
      <section className="section band">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="title" style={{ color: "#fff" }}>Help your child start 10th Class on solid footing</h2>
          <p className="lead" style={{ color: "rgba(255,255,255,.78)", margin: "0 auto 8px" }}>
            Get structured teaching, consistent practice and real accountability — all through live Punjab Board
            classes from home.
          </p>
          <p style={{ color: "#5eead4", fontWeight: 800, marginBottom: 20 }}>One flat fee of PKR 10,000/month for every subject</p>
          <div className="actions" style={{ justifyContent: "center" }}>
            {isSignedInAsPunjab10th ? (
              <CTAButton href="/punjab-board-10th-class/portal" variant="accent">Go to My Portal</CTAButton>
            ) : (
              <CTAButton href="#apply" variant="accent">Register Now</CTAButton>
            )}
            <a href={WHATSAPP_HERO_LINK} target="_blank" rel="noreferrer" className="btn btn-ghost">Ask a Question on WhatsApp</a>
          </div>
          <p style={{ marginTop: 16, color: "rgba(255,255,255,.6)", fontSize: ".85rem" }}>WhatsApp: +92 331 666 3291</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>FAQs</div>
          <h2 className="title" style={{ textAlign: "center", marginBottom: 24 }}>Frequently asked questions</h2>
          <FAQAccordion items={FAQ_ITEMS} />
        </div>
      </section>

      {/* Registration form */}
      <section className="section soft" id="apply" style={{ scrollMarginTop: 90 }}>
        <div className="container" style={{ maxWidth: 720 }}>
          {isSignedInAsPunjab10th ? (
            <div className="card" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", padding: 40, background: "linear-gradient(135deg,#fff7ed,#eaf4ff)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
              <p style={{ fontWeight: 800, color: "#9a3412", marginBottom: 8, fontSize: "1.05rem" }}>You&apos;re already registered</p>
              <p style={{ color: "#7c4a1e", lineHeight: 1.65, margin: "0 auto 20px" }}>
                Visit your portal for your class schedule and join links.
              </p>
              <CTAButton href="/punjab-board-10th-class/portal" variant="primary">Go to my portal →</CTAButton>
            </div>
          ) : (
            <>
              <div className="eyebrow" style={{ justifyContent: "center" }}>Register</div>
              <h2 className="title" style={{ textAlign: "center" }}>Sign Up for the 10th Class Trial Week</h2>
              <p className="lead" style={{ textAlign: "center", margin: "0 auto 28px" }}>
                Fill in the form below, and our admissions team will reach out to the parent on WhatsApp with
                timings and joining details.
              </p>
              <Punjab10thRegistrationForm />
              <p style={{ marginTop: 24, textAlign: "center", color: "var(--muted)", fontSize: ".85rem" }}>
                Prefer WhatsApp? <a href={WHATSAPP_HERO_LINK} target="_blank" rel="noreferrer" style={{ color: "var(--blue)", fontWeight: 700 }}>Message us directly →</a>
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
