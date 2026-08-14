import type { Metadata } from "next";
import Link from "next/link";
import { CTAButton, FAQAccordion } from "@/components/site";
import { OLevelEnrollmentForm } from "@/components/forms";
import { InstructorProfile } from "@/components/academy/InstructorProfile";
import { AcademyPricingTable } from "@/components/academy/AcademyPricingTable";
import { LearningJourney } from "@/components/academy/LearningJourney";
import { TrackViewContent } from "./TrackViewContent";
import { getInstructor, getCohortForSubject, getSubject } from "@/lib/academy/data";

const BASE_URL = "https://academy.thedigitaltutor.net";

export const metadata: Metadata = {
  title: "Online O Level Tuition in Pakistan | The Digital Tutor",
  description: "Join live online Cambridge O Level and IGCSE classes in English Language and Mathematics, with weekly office hours, past-paper practice and parent progress reports.",
  alternates: { canonical: `${BASE_URL}/o-level` },
  openGraph: {
    title: "O Level Founding Cohorts Now Enrolling",
    description: "Live online English and Mathematics tuition with founder-led classes, office hours and parent progress reporting.",
    url: `${BASE_URL}/o-level`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "O Level Founding Cohorts Now Enrolling",
    description: "Live online English and Mathematics tuition with founder-led classes, office hours and parent progress reporting.",
  },
};

const BENEFITS = [
  { title: "Live Founder-Led Classes", icon: "🎓", description: "Students receive live instruction, explanation and opportunities to ask questions." },
  { title: "Weekly Office Hours", icon: "🚪", description: "Students can get help between classes instead of remaining stuck until the next lesson." },
  { title: "Past-Paper and Exam Practice", icon: "📝", description: "Students work through exam-style questions, writing tasks and timed practice." },
  { title: "Between-Class Study Support", icon: "🤖", description: "Students receive structured homework, revision guidance and supervised AI-assisted explanations." },
  { title: "Parent Progress Reports", icon: "📊", description: "Parents receive visibility into attendance, homework, strengths, weaknesses and recommended next steps." },
];

const TRUST_POINTS = [
  "Live founder-led classes",
  "Open weekly office hours",
  "Monthly parent progress reports",
  "Original and properly licensed learning resources",
  "No grade guarantee",
];

const FAQ_ITEMS: [string, string][] = [
  ["Who will teach the founding cohort?", "The initial English Language and Mathematics cohorts will be taught by Ibrahim Sajid Malick, founder of The Digital Tutor."],
  ["Are the classes live or recorded?", "Classes are delivered live online."],
  ["What happens if my child misses a class?", "Our missed-class and recording policy will be published here before the founding cohort begins."],
  ["How many students will be in each class?", "The founding cohorts will be limited to a maximum of 15 students per class."],
  ["How often are classes held?", "Each subject includes a published live-class schedule and designated office hours — shared with applicants as cohorts are confirmed."],
  ["Does the program guarantee a particular grade?", "No. The program provides teaching, practice, feedback and structured preparation, but no examination grade can be guaranteed."],
  ["How will parents receive progress updates?", "Parents will receive regular reports covering attendance, homework, current strengths, areas for improvement and recommended next steps."],
  ["How do I pay?", "Payments are initially accepted through JazzCash, Easypaisa and local bank transfer. Enrollment is confirmed after payment verification."],
  ["What is the refund policy?", "Our refund and cancellation policy will be published here before we accept payment for the founding cohort."],
  ["Is The Digital Tutor affiliated with Cambridge?", "No. The Digital Tutor is an independent tuition provider and is not affiliated with or endorsed by Cambridge University Press & Assessment."],
];

function CohortCard({ subjectSlug, price }: { subjectSlug: string; price: number }) {
  const subject = getSubject(subjectSlug);
  const cohort = getCohortForSubject(subjectSlug);
  if (!subject) return null;

  const rows: [string, string][] = [
    ["Cohort start date", "To be confirmed"],
    ["Registration deadline", "To be confirmed"],
    ["Class days", "To be confirmed"],
    ["Class time (PKT)", "To be confirmed"],
    ["Session duration", "To be confirmed"],
    ["Weekly office-hour time", "To be confirmed"],
    ["Maximum students", "15"],
    ["Monthly price", `PKR ${price.toLocaleString()}`],
  ];

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column" }}>
      <div className="eyebrow">{cohort?.targetExam ?? "May/June 2027"} target</div>
      <h3 style={{ marginTop: 6 }}>O Level {subject.name}</h3>
      <div style={{ display: "grid", gap: 6, margin: "12px 0 18px" }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: ".85rem", padding: "4px 0", borderBottom: "1px solid #f0f4f8" }}>
            <span style={{ color: "var(--muted)" }}>{label}</span>
            <span style={{ fontWeight: 700, color: value === "To be confirmed" ? "#92400e" : "var(--navy)" }}>{value}</span>
          </div>
        ))}
      </div>
      <Link href={`/o-level?subject=${subject.slug}#apply`} className="btn btn-primary" style={{ marginTop: "auto" }}>
        Apply for This Cohort
      </Link>
    </div>
  );
}

export default async function OLevelPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject } = await searchParams;
  const instructor = getInstructor("ibrahim");

  return (
    <>
      <TrackViewContent />

      {/* 1 — Hero */}
      <section className="section band">
        <div className="container">
          <div className="eyebrow" style={{ color: "#5eead4" }}>Cambridge O Level / IGCSE · Live Online Tuition</div>
          <h1 className="display" style={{ color: "#fff", maxWidth: 780 }}>
            O Level Tuition Where Students Are Never Left Stuck
          </h1>
          <p className="lead" style={{ color: "rgba(255,255,255,.78)" }}>
            Live online classes, weekly office hours, past-paper practice and regular parent progress reports for
            students preparing for Cambridge O Level and IGCSE examinations.
          </p>
          <p style={{ color: "#5eead4", fontWeight: 700, fontSize: ".95rem" }}>
            Founding cohorts now enrolling for English Language and Mathematics. Limited to 15 students per class.
          </p>
          <div className="actions">
            <CTAButton href="#apply" variant="accent">Book a Free Student Assessment</CTAButton>
            <CTAButton href="#subjects" variant="ghost">View Subjects and Schedule</CTAButton>
          </div>
          <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 10 }}>
            {TRUST_POINTS.map((t) => (
              <span key={t} className="badge teal">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 2 — Subjects and schedules */}
      <section id="subjects" className="section soft" style={{ scrollMarginTop: 90 }}>
        <div className="container">
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>Founding cohorts</div>
            <h2 className="title">English Language and Mathematics</h2>
            <p className="lead" style={{ margin: "0 auto" }}>
              These two subjects are confirmed for the founding cohort. Exact class days and times will be shared
              with applicants as each cohort is finalized.
            </p>
          </div>
          <div className="grid grid-2" style={{ marginTop: 40 }}>
            <CohortCard subjectSlug="english-language" price={10000} />
            <CohortCard subjectSlug="mathematics" price={10000} />
          </div>
          <div className="card" style={{ marginTop: 24, textAlign: "center", background: "#eaf1ff", borderColor: "#c9dcfb" }}>
            <p style={{ margin: 0, fontWeight: 700, color: "var(--navy)" }}>English Language + Mathematics: PKR 18,000 per month</p>
          </div>
          <p style={{ textAlign: "center", marginTop: 24, color: "var(--muted)", fontSize: ".9rem", maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}>
            Additional cohorts in Computer Science, Islamiyat and Pakistan Studies will open based on parent demand —
            you can join the waiting list for any of these subjects on the application form below.
          </p>
        </div>
      </section>

      {/* 3 — What students receive */}
      <section className="section">
        <div className="container">
          <div className="eyebrow">What students receive</div>
          <h2 className="title">Support that doesn&apos;t stop when class ends</h2>
          <div className="grid grid-3" style={{ marginTop: 40 }}>
            {BENEFITS.map((b) => (
              <article className="card" key={b.title}>
                <div className="icon">{b.icon}</div>
                <h3>{b.title}</h3>
                <p>{b.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — How the program works */}
      <section className="section soft">
        <div className="container">
          <LearningJourney />
        </div>
      </section>

      {/* 5 — Meet Ibrahim */}
      {instructor && (
        <section className="section">
          <div className="container">
            <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
              <div className="eyebrow" style={{ justifyContent: "center" }}>Your teacher</div>
              <h2 className="title">Meet Your Founding Cohort Teacher</h2>
            </div>
            <div style={{ maxWidth: 780, margin: "40px auto 0" }}>
              <InstructorProfile instructor={instructor} />
            </div>
          </div>
        </section>
      )}

      {/* 6 — Founding-cohort pricing */}
      <section className="section soft">
        <div className="container">
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>Founding cohort</div>
            <h2 className="title">Lock in founder pricing</h2>
          </div>
          <div style={{ maxWidth: 900, margin: "40px auto 0" }}>
            <AcademyPricingTable />
          </div>
        </div>
      </section>

      {/* 7 — Parent trust and reporting */}
      <section className="section">
        <div className="container grid grid-2" style={{ alignItems: "center" }}>
          <div>
            <div className="eyebrow">Parent trust</div>
            <h2 className="title">Clear visibility, every week</h2>
            <p className="lead">
              Parents are not paying for more worksheets — they&apos;re paying for structure, accountability,
              teacher guidance, and progress visibility.
            </p>
          </div>
          <div className="card">
            <ul className="check-list">
              <li>Weekly attendance and homework summary</li>
              <li>Current strengths and areas for improvement</li>
              <li>Recommended next steps for the coming week</li>
              <li>Direct line to the teacher via WhatsApp</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 8 — FAQ */}
      <section id="faq" className="section soft" style={{ scrollMarginTop: 90 }}>
        <div className="container" style={{ maxWidth: 780 }}>
          <div className="eyebrow">Questions, answered</div>
          <h2 className="title">Frequently asked questions</h2>
          <FAQAccordion items={FAQ_ITEMS} />
        </div>
      </section>

      {/* 9 — Application form */}
      <section id="apply" className="section" style={{ scrollMarginTop: 90 }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ maxWidth: 720, margin: "0 auto 40px", textAlign: "center" }}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>Apply now</div>
            <h2 className="title">Apply for the O Level Founding Cohort</h2>
            <p className="lead" style={{ margin: "0 auto" }}>
              Tell us about your student — we&apos;ll show you payment options for the founding cohort next.
            </p>
          </div>
          <OLevelEnrollmentForm defaultSubject={subject} />
        </div>
      </section>

      {/* 10 — Payment and next steps */}
      <section className="section soft">
        <div className="container" style={{ maxWidth: 780, textAlign: "center" }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>What happens next</div>
          <h2 className="title">Payment and next steps</h2>
          <div className="grid grid-3" style={{ marginTop: 32, textAlign: "left" }}>
            <div className="card">
              <div className="icon">1</div>
              <h3>Apply</h3>
              <p>Submit the application above with your student&apos;s details and subject of interest.</p>
            </div>
            <div className="card">
              <div className="icon">2</div>
              <h3>Pay &amp; confirm</h3>
              <p>We&apos;ll show you JazzCash, Easypaisa and bank transfer options to reserve the seat.</p>
            </div>
            <div className="card">
              <div className="icon">3</div>
              <h3>Verified &amp; enrolled</h3>
              <p>Once your payment is verified, we&apos;ll confirm enrollment and the class schedule by WhatsApp and email.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
