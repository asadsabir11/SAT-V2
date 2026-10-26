import type { Metadata } from "next";
import { CTAButton, FAQAccordion } from "@/components/site";
import { ALevelRegistrationForm } from "@/components/ALevelRegistrationForm";
import { getSession } from "@/lib/auth";

const BASE_URL = "https://academy.thedigitaltutor.net";
const WHATSAPP_HERO_LINK = "https://wa.me/923316663291?text=Assalam-oAlaikum%2C%20mujhe%20A%20Level%20Computer%20Science%20program%20ki%20details%20chahiye.";

export const metadata: Metadata = {
  title: "A Level Computer Science — Live Online Classes",
  description: "Live online A Level Computer Science classes taught by experienced teachers, following the latest Cambridge/Edexcel syllabus. Special launch fee available.",
  alternates: { canonical: `${BASE_URL}/a-level` },
  openGraph: {
    title: "A Level Computer Science — Live Online Classes",
    description: "Live online A Level Computer Science classes following the latest Cambridge/Edexcel syllabus.",
    url: `${BASE_URL}/a-level`,
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
    title: "A Level Computer Science — Live Online Classes",
    description: "Live online A Level Computer Science classes following the latest Cambridge/Edexcel syllabus.",
  },
};

const SUPPORTING_POINTS = ["Attend your first week before paying", "Live classes and teacher support", "Quizzes, assignments and past papers", "Focused entirely on Computer Science"];

const TRUST_POINTS = ["A Level Computer Science", "Live online teaching", "Cambridge/Edexcel-aligned", "Regular tests", "Parent progress updates"];

const WHAT_STUDENTS_RECEIVE = [
  { icon: "🎓", title: "Live teaching", description: "Students attend scheduled classes with teachers and can ask questions during the lesson." },
  { icon: "💻", title: "Full syllabus coverage", description: "Theory and practical programming topics planned around the latest A Level Computer Science syllabus." },
  { icon: "📝", title: "Notes and assignments", description: "Students receive structured notes, practice questions and regular homework." },
  { icon: "✅", title: "Topic quizzes", description: "Frequent quizzes help identify weak areas before they become serious problems." },
  { icon: "📄", title: "Past papers", description: "Practice with real past-paper style questions and mark schemes." },
  { icon: "🎥", title: "Class recordings", description: "Recordings help students revise lessons or catch up when they miss a class." },
];

const HOW_IT_WORKS = [
  { title: "Complete the registration form", description: "Tell us about your student and preferred class time." },
  { title: "Receive your class details", description: "Our admissions team will contact the parent on WhatsApp." },
  { title: "Attend the first week", description: "Experience the classes before paying the monthly fee." },
  { title: "Continue with full access", description: "Unlock lessons, quizzes, past papers and assignments from your portal." },
];

const FAQ_ITEMS: [string, string][] = [
  ["Does this cover only Computer Science?", "Yes. This program is focused entirely on A Level Computer Science — we don't currently offer other A Level subjects."],
  ["Are these live or recorded classes?", "The main lessons are taught live. Recordings are also provided for revision and missed lessons."],
  ["Can my child try the classes before paying?", "Yes. Registered students may attend their first week before paying. Payment is required to continue after the trial period."],
  ["Which exam board do you follow?", "Lessons are planned around the common Cambridge/Edexcel A Level Computer Science syllabus and examination requirements."],
  ["Does the academy guarantee particular grades?", "No academy can responsibly guarantee grades. We provide structured teaching, practice, testing and support, but results also depend on attendance, effort and assignment completion."],
  ["How will parents receive updates?", "Parent communication and important progress updates will be sent through the registered WhatsApp number."],
];

export default async function ALevelPage() {
  const session = await getSession();
  const isSignedInAsALevel = session?.role === "student" && session.program === "a-level";

  return (
    <>
      {/* 1 — Hero */}
      <section className="section band">
        <div className="container">
          <div className="hero-layout">
            <div>
              <div className="eyebrow" style={{ color: "#fda4af" }}>Admissions Open</div>
              <h1 className="display" style={{ color: "#fff", maxWidth: 780 }}>
                A Level Computer Science — Live Online Classes
              </h1>
              <p className="lead" style={{ color: "rgba(255,255,255,.78)" }}>
                Live online A Level Computer Science classes, taught by experienced teachers following the latest
                exam-board syllabus.
              </p>
              <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 10 }}>
                {SUPPORTING_POINTS.map((p) => (
                  <span key={p} style={{ padding: "6px 14px", borderRadius: 999, background: "rgba(255,255,255,.1)", color: "#fff", fontSize: ".82rem", fontWeight: 700 }}>✓ {p}</span>
                ))}
              </div>
              <div className="actions">
                {isSignedInAsALevel ? (
                  <CTAButton href="/a-level/portal" variant="accent">Go to My Portal</CTAButton>
                ) : (
                  <a href="#apply" className="btn" style={{ background: "#be123c", color: "#fff", borderColor: "#be123c" }}>Register for the First Week</a>
                )}
                <a href={WHATSAPP_HERO_LINK} target="_blank" rel="noreferrer" className="btn btn-ghost">WhatsApp Us</a>
              </div>
              <p style={{ marginTop: 20, color: "rgba(255,255,255,.6)", fontSize: ".85rem" }}>
                Founding cohort — limited seats.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Trust strip */}
      <section className="section soft">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="title" style={{ marginBottom: 20 }}>Focused, affordable A Level Computer Science prep</h2>
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
          <h2 className="title">Strong preparation for a demanding subject</h2>
          <p className="lead">
            A Level Computer Science combines theory with real programming practice. Students need teachers who can
            explain difficult concepts, review their code and keep them consistent — not just recorded videos.
          </p>
          <p style={{ color: "var(--muted)", lineHeight: 1.75 }}>
            The Digital Tutor brings the complete academy experience online. Students attend scheduled live classes,
            ask questions, complete assignments and prepare for exams from home.
          </p>
        </div>
      </section>

      {/* 4 — What students receive */}
      <section className="section soft">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: "center" }}>What students receive</div>
          <h2 className="title" style={{ textAlign: "center" }}>More than just online lectures</h2>
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

      {/* 5 — How the program works */}
      <section className="section">
        <div className="container" style={{ maxWidth: 780 }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>How the program works</div>
          <h2 className="title" style={{ textAlign: "center" }}>A simple system for consistent progress</h2>
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

      {/* 6 — Closing CTA */}
      <section className="section band">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="title" style={{ color: "#fff" }}>Give your child a stronger start to A Level Computer Science</h2>
          <p className="lead" style={{ color: "rgba(255,255,255,.78)", margin: "0 auto 8px" }}>
            Join live classes from home with structured teaching, regular practice and academic accountability.
          </p>
          <div className="actions" style={{ justifyContent: "center" }}>
            {isSignedInAsALevel ? (
              <CTAButton href="/a-level/portal" variant="accent">Go to My Portal</CTAButton>
            ) : (
              <a href="#apply" className="btn" style={{ background: "#be123c", color: "#fff", borderColor: "#be123c" }}>Register Now</a>
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
          {isSignedInAsALevel ? (
            <div className="card" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", padding: 40, background: "linear-gradient(135deg,#fff1f2,#eaf4ff)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
              <p style={{ fontWeight: 800, color: "#9f1239", marginBottom: 8, fontSize: "1.05rem" }}>You&apos;re already registered</p>
              <p style={{ color: "#7c4a1e", lineHeight: 1.65, margin: "0 auto 20px" }}>
                Head to your portal to see your class schedule and join links.
              </p>
              <CTAButton href="/a-level/portal" variant="primary">Go to my portal →</CTAButton>
            </div>
          ) : (
            <>
              <div className="eyebrow" style={{ justifyContent: "center" }}>Register</div>
              <h2 className="title" style={{ textAlign: "center" }}>Register for the A Level First Week</h2>
              <p className="lead" style={{ textAlign: "center", margin: "0 auto 28px" }}>
                Complete the form below. Our admissions team will contact the parent on WhatsApp with class timings
                and joining instructions.
              </p>
              <ALevelRegistrationForm />
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
