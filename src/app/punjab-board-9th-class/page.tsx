import type { Metadata } from "next";
import { CTAButton, FAQAccordion } from "@/components/site";
import { Punjab9thRegistrationForm } from "@/components/Punjab9thRegistrationForm";
import { getSession } from "@/lib/auth";

const BASE_URL = "https://academy.thedigitaltutor.net";
const WHATSAPP_HERO_LINK = "https://wa.me/923316663291?text=Assalam-oAlaikum%2C%20mujhe%209th%20Class%20online%20program%20ki%20details%20chahiye.";

export const metadata: Metadata = {
  title: "Punjab Board 9th Class — All Subjects Online",
  description: "Live online classes for Biology and Computer Science groups, taught by experienced teachers following the latest Punjab Board syllabus. Special launch fee: PKR 2,500/month for all subjects.",
  alternates: { canonical: `${BASE_URL}/punjab-board-9th-class` },
  openGraph: {
    title: "Punjab Board 9th Class — All Subjects Online",
    description: "Live online classes for Biology and Computer Science groups, following the latest Punjab Board syllabus. Special launch fee: PKR 2,500/month for all subjects.",
    url: `${BASE_URL}/punjab-board-9th-class`,
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
    title: "Punjab Board 9th Class — All Subjects Online",
    description: "Live online classes for Biology and Computer Science groups, following the latest Punjab Board syllabus. Special launch fee: PKR 2,500/month for all subjects.",
  },
};

const SUPPORTING_POINTS = [
  "Attend your first week before paying",
  "Live classes and teacher support",
  "Tests, assignments and progress tracking",
  "Biology and Computer Science groups available",
];

const TRUST_POINTS = ["All major subjects", "Live online teaching", "Punjab Board preparation", "Regular tests", "Parent progress updates", "PKR 2,500/month"];

const BIOLOGY_SUBJECTS = ["English", "Urdu", "Maths", "Physics", "Chemistry", "Biology", "Islamiat", "Tarjuma-tul-Quran or Ethics, where applicable"];
const CS_SUBJECTS = ["English", "Urdu", "Maths", "Physics", "Chemistry", "Computer Science", "Islamiat", "Tarjuma-tul-Quran or Ethics, where applicable"];

const WHAT_STUDENTS_RECEIVE = [
  { icon: "🎓", title: "Live teaching", description: "Students attend scheduled classes with teachers and can ask questions during the lesson." },
  { icon: "📚", title: "Complete syllabus coverage", description: "Lessons are planned around the latest Punjab Board syllabus and examination requirements." },
  { icon: "📝", title: "Notes and assignments", description: "Students receive structured notes, practice questions and regular homework." },
  { icon: "✅", title: "Chapter tests", description: "Frequent tests help identify weak areas before they become serious problems." },
  { icon: "🎯", title: "Exam preparation", description: "Students practise important questions, past-paper patterns and time management." },
  { icon: "🎥", title: "Class recordings", description: "Recordings help students revise lessons or catch up when they miss a class." },
  { icon: "🙋", title: "Teacher support", description: "Students can get help with questions and difficult concepts outside the live lesson according to the academy's support schedule." },
  { icon: "📊", title: "Parent updates", description: "Parents receive progress information covering attendance, assignments and test performance." },
];

const HOW_IT_WORKS = [
  { title: "Complete the registration form", description: "Select the Biology or Computer Science group." },
  { title: "Receive your class details", description: "Our admissions team will contact the parent on WhatsApp." },
  { title: "Attend the first week", description: "Experience the classes before paying the monthly fee." },
  { title: "Continue for PKR 2,500 per month", description: "The fee covers the complete 9th Class subject package — not one individual subject." },
];

const PARENT_MONITOR_POINTS = ["Class attendance", "Assignment completion", "Chapter-test performance", "Subjects requiring additional attention", "Overall consistency and participation"];

const PRICING_INCLUDES = ["Biology or Computer Science group", "Live classes for all included subjects", "Notes and assignments", "Regular tests", "Class recordings", "Academic support", "Parent progress updates"];

const FAQ_ITEMS: [string, string][] = [
  ["Is PKR 2,500 the fee for one subject?", "No. The launch fee covers the complete 9th Class package for the selected Biology or Computer Science group."],
  ["Are these live or recorded classes?", "The main lessons are taught live. Recordings are also provided for revision and missed lessons."],
  ["Can my child try the classes before paying?", "Yes. Registered students may attend their first week before paying. Payment is required to continue after the trial period."],
  ["Which Punjab Boards do you cover?", "The program follows the common Punjab curriculum and examination requirements. Students can register from Lahore, Gujranwala, Rawalpindi, Faisalabad, Multan, Sargodha, Sahiwal, Bahawalpur and D.G. Khan boards."],
  ["Are both Biology and Computer Science available?", "Yes. Parents select the required group during registration."],
  ["Does the academy guarantee particular marks?", "No academy can responsibly guarantee marks. We provide structured teaching, practice, testing and support, but results also depend on attendance, effort and assignment completion."],
  ["What does a student need to attend?", "A phone, tablet or computer with a stable internet connection, along with notebooks and the prescribed textbooks."],
  ["How will parents receive updates?", "Parent communication and important progress updates will be sent through the registered WhatsApp number."],
];

export default async function Punjab9thClassPage() {
  const session = await getSession();
  const isSignedInAsPunjab9th = session?.role === "student" && session.program === "punjab-9th";

  return (
    <>
      {/* 1 — Hero */}
      <section className="section band">
        <div className="container">
          <div className="eyebrow" style={{ color: "#5eead4" }}>Phase 1 — Admissions Open</div>
          <h1 className="display" style={{ color: "#fff", maxWidth: 780 }}>
            Punjab Board 9th Class — All Subjects Online
          </h1>
          <p className="lead" style={{ color: "rgba(255,255,255,.78)" }}>
            Live online classes for Biology and Computer Science groups, taught by experienced teachers following
            the latest Punjab Board syllabus.
          </p>
          <p style={{ color: "#5eead4", fontWeight: 800, fontSize: "1.05rem" }}>
            Special Launch Fee: PKR 2,500 per month for all subjects
          </p>
          <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 10 }}>
            {SUPPORTING_POINTS.map((p) => (
              <span key={p} className="badge teal">✓ {p}</span>
            ))}
          </div>
          <div className="actions">
            {isSignedInAsPunjab9th ? (
              <CTAButton href="/punjab-board-9th-class/portal" variant="accent">Go to My Portal</CTAButton>
            ) : (
              <CTAButton href="#apply" variant="accent">Register for the First Week</CTAButton>
            )}
            <a href={WHATSAPP_HERO_LINK} target="_blank" rel="noreferrer" className="btn btn-ghost">WhatsApp Us</a>
          </div>
          <p style={{ marginTop: 20, color: "rgba(255,255,255,.6)", fontSize: ".85rem" }}>
            Founding cohort limited to the first 300 students.
          </p>
        </div>
      </section>

      {/* 2 — Trust strip */}
      <section className="section soft">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="title" style={{ marginBottom: 20 }}>Everything a 9th Class student needs—in one affordable program</h2>
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
          <h2 className="title">Strong preparation for an important academic year</h2>
          <p className="lead">
            9th Class is where board preparation begins. Students need more than recorded videos—they need
            teachers who explain difficult concepts, check their work and keep them consistent.
          </p>
          <p style={{ color: "var(--muted)", lineHeight: 1.75 }}>
            The Digital Tutor brings the complete academy experience online. Students attend scheduled live
            classes, ask questions, complete assignments and prepare for school and board examinations from home.
          </p>
        </div>
      </section>

      {/* 4 — Subject groups */}
      <section className="section soft" id="subjects">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: "center" }}>Subject groups</div>
          <h2 className="title" style={{ textAlign: "center" }}>Choose your 9th Class group</h2>
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
            Note: Final subject allocation will follow the latest applicable Punjab Board scheme for the student&apos;s
            academic session.
          </p>
        </div>
      </section>

      {/* 5 — What students receive */}
      <section className="section">
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

      {/* 6 — How the program works */}
      <section className="section soft">
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

      {/* 7 — Parent-focused section */}
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="eyebrow">For parents</div>
          <h2 className="title">Know whether your child is actually progressing</h2>
          <p className="lead">
            Parents should not have to wait until the final result to discover that their child is struggling.
          </p>
          <p style={{ color: "var(--muted)", marginBottom: 16 }}>Our academic system helps parents monitor:</p>
          <ul className="check-list">
            {PARENT_MONITOR_POINTS.map((p) => <li key={p}>{p}</li>)}
          </ul>
          <div className="card" style={{ marginTop: 28, background: "#eaf1ff", borderColor: "#c9dcfb", textAlign: "center" }}>
            <p style={{ margin: 0, fontWeight: 800, color: "var(--navy)" }}>
              Live teaching for students. Clear progress visibility for parents.
            </p>
          </div>
        </div>
      </section>

      {/* 8 — Pricing */}
      <section className="section soft">
        <div className="container" style={{ maxWidth: 560 }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Founding Student Launch Offer</div>
          <h2 className="title" style={{ textAlign: "center" }}>Punjab Board 9th Class — All Subjects</h2>
          <article className="card" style={{ marginTop: 24, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", border: "2px solid var(--blue)" }}>
            <div className="price">PKR 2,500<span style={{ fontSize: "1rem", fontWeight: 700 }}>/mo</span></div>
            <ul style={{ textAlign: "left", margin: "18px 0 24px", display: "grid", gap: 8 }}>
              {PRICING_INCLUDES.map((i) => (
                <li key={i} style={{ color: "#4a6070", fontSize: ".92rem" }}>✓ {i}</li>
              ))}
            </ul>
            <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 20 }}>
              Launch price available to the first 300 enrolled students.
            </p>
            <CTAButton href="#apply" variant="primary">Claim the Launch Fee</CTAButton>
          </article>
          <p style={{ marginTop: 20, textAlign: "center", color: "var(--muted)", fontSize: ".8rem", lineHeight: 1.6 }}>
            Registration is free. Students may attend the first seven calendar days of their assigned batch before
            the first monthly payment becomes due. Continued access requires payment from day eight. Any future
            fee revision should not affect an already-paid month.
          </p>
        </div>
      </section>

      {/* 9 — Closing CTA */}
      <section className="section band">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="title" style={{ color: "#fff" }}>Give your child a stronger start to 9th Class</h2>
          <p className="lead" style={{ color: "rgba(255,255,255,.78)", margin: "0 auto 8px" }}>
            Join live Punjab Board classes from home with structured teaching, regular practice and academic
            accountability.
          </p>
          <p style={{ color: "#5eead4", fontWeight: 800, marginBottom: 20 }}>PKR 2,500 per month for all subjects</p>
          <div className="actions" style={{ justifyContent: "center" }}>
            {isSignedInAsPunjab9th ? (
              <CTAButton href="/punjab-board-9th-class/portal" variant="accent">Go to My Portal</CTAButton>
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
          {isSignedInAsPunjab9th ? (
            <div className="card" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", padding: 40, background: "linear-gradient(135deg,#fff7ed,#eaf4ff)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
              <p style={{ fontWeight: 800, color: "#9a3412", marginBottom: 8, fontSize: "1.05rem" }}>You&apos;re already registered</p>
              <p style={{ color: "#7c4a1e", lineHeight: 1.65, margin: "0 auto 20px" }}>
                Head to your portal to see your class schedule and join links.
              </p>
              <CTAButton href="/punjab-board-9th-class/portal" variant="primary">Go to my portal →</CTAButton>
            </div>
          ) : (
            <>
              <div className="eyebrow" style={{ justifyContent: "center" }}>Register</div>
              <h2 className="title" style={{ textAlign: "center" }}>Register for the 9th Class First Week</h2>
              <p className="lead" style={{ textAlign: "center", margin: "0 auto 28px" }}>
                Complete the form below. Our admissions team will contact the parent on WhatsApp with class timings
                and joining instructions.
              </p>
              <Punjab9thRegistrationForm />
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
