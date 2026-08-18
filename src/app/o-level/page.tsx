import type { Metadata } from "next";
import Link from "next/link";
import { CTAButton, FAQAccordion } from "@/components/site";
import { OLevelRegistrationForm } from "@/components/forms";
import { InstructorProfile } from "@/components/academy/InstructorProfile";
import { AcademyPricingTable } from "@/components/academy/AcademyPricingTable";
import { LearningJourney } from "@/components/academy/LearningJourney";
import { TrackViewContent } from "./TrackViewContent";
import { getInstructor, getCohortForSubject, getSubject, marginalPriceForNextSubject } from "@/lib/academy/data";
import { getIntroLecture } from "@/lib/lectures";
import { getSession } from "@/lib/auth";
import { getOLevelAccessMap } from "@/lib/olevelAccess";

const BASE_URL = "https://academy.thedigitaltutor.net";

// Fetches intro-lecture data from the DB per request — previously implicit
// via the searchParams prop, which forced this dynamically without it.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Online O Level Tuition in Pakistan | The Digital Tutor",
  description: "Join live online Cambridge O Level and IGCSE classes in English Language and Mathematics, with weekly office hours, past-paper practice and parent progress reports. Computer Science, Islamiyat and Pakistan Studies coming soon.",
  alternates: { canonical: `${BASE_URL}/o-level` },
  openGraph: {
    title: "O Level Founding Cohorts Now Enrolling",
    description: "Live online English and Mathematics tuition with founder-led classes, office hours and parent progress reporting. More subjects coming soon.",
    url: `${BASE_URL}/o-level`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "O Level Founding Cohorts Now Enrolling",
    description: "Live online English and Mathematics tuition with founder-led classes, office hours and parent progress reporting. More subjects coming soon.",
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
  ["How often are classes held?", "Mathematics meets weekly on Saturdays (6:00–7:00 PM PKT) and English Language meets weekly on Fridays (6:00–7:00 PM PKT), each 1 hour long, plus office hours Monday–Friday from 7:30–8:15 PM PKT."],
  ["Does the program guarantee a particular grade?", "No. The program provides teaching, practice, feedback and structured preparation, but no examination grade can be guaranteed."],
  ["How will parents receive progress updates?", "Parents will receive regular reports covering attendance, homework, current strengths, areas for improvement and recommended next steps."],
  ["How do I pay?", "Registration is free. When you're ready to unlock a subject, pay via JazzCash, Easypaisa or local bank transfer from your dashboard — that subject unlocks once we verify your payment."],
  ["What is the refund policy?", "If you cancel within 7 days of your first payment, you'll receive a 100% refund. See our full Refund & Cancellation Policy for details."],
  ["Is The Digital Tutor affiliated with Cambridge?", "No. The Digital Tutor is an independent tuition provider and is not affiliated with or endorsed by Cambridge University Press & Assessment."],
];

const COHORT_SCHEDULE = {
  startDate: "September 12, 2026",
  registrationDeadline: "September 10, 2026",
  officeHours: "7:30 PM – 8:15 PM, Monday–Friday (PKT)",
  sessionDuration: "1 hour",
} as const;

const SUBJECT_CLASS_TIME: Record<string, string> = {
  "english-language": "Friday, 6:00 PM – 7:00 PM (PKT)",
  "mathematics": "Saturday, 6:00 PM – 7:00 PM (PKT)",
  "computer-science": "Thursday, 6:00 PM – 7:00 PM (PKT)",
  "islamiyat": "Wednesday, 6:00 PM – 7:00 PM (PKT)",
  "pakistan-studies": "Tuesday, 6:00 PM – 7:00 PM (PKT)",
};

function CohortCard({ subjectSlug, basePrice, isSignedInStudent, unlockedSubjects, fullyBooked }: { subjectSlug: string; basePrice: number; isSignedInStudent: boolean; unlockedSubjects: string[]; fullyBooked?: boolean }) {
  const subject = getSubject(subjectSlug);
  const cohort = getCohortForSubject(subjectSlug);
  if (!subject) return null;

  const isUnlocked = !fullyBooked && unlockedSubjects.includes(subjectSlug);
  const marginalPrice = isSignedInStudent && !isUnlocked && !fullyBooked ? marginalPriceForNextSubject(unlockedSubjects.length) : basePrice;
  const isDiscounted = isSignedInStudent && !fullyBooked && marginalPrice < basePrice;

  const classTime = SUBJECT_CLASS_TIME[subjectSlug];
  const priceValue = fullyBooked ? "Fully booked" : isUnlocked ? "Unlocked ✓" : `PKR ${marginalPrice.toLocaleString()}${isDiscounted ? " (bundle price)" : ""}`;
  const rows: [string, string][] = [
    ["Cohort start date", COHORT_SCHEDULE.startDate],
    ["Registration deadline", COHORT_SCHEDULE.registrationDeadline],
    ["Class day & time (PKT)", classTime ?? "To be confirmed"],
    ["Session duration", COHORT_SCHEDULE.sessionDuration],
    ["Weekly office hours", COHORT_SCHEDULE.officeHours],
    ["Maximum students", "15"],
    ["Monthly price", priceValue],
  ];

  const body = (
    <>
      <div className="eyebrow" style={fullyBooked ? { color: "#b91c1c" } : undefined}>
        {fullyBooked ? "Fully booked" : `${cohort?.targetExam ?? "May/June 2027"} target`}
      </div>
      <h3 style={{ marginTop: 6 }}>O Level {subject.name}</h3>
      <div style={{ display: "grid", gap: 6, margin: "12px 0 18px" }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "2px 12px", fontSize: ".85rem", padding: "4px 0", borderBottom: "1px solid #f0f4f8" }}>
            <span style={{ color: "var(--muted)" }}>{label}</span>
            <span style={{ fontWeight: 700, textAlign: "right", color: value === "To be confirmed" ? "#92400e" : value === "Fully booked" ? "#b91c1c" : isUnlocked ? "#15803d" : "var(--navy)" }}>{value}</span>
          </div>
        ))}
      </div>
      {fullyBooked ? (
        <span style={{ marginTop: "auto", color: "#b91c1c", fontWeight: 700, fontSize: ".9rem" }}>
          Fully booked for this cohort
          <span style={{ display: "block", fontWeight: 600, fontSize: ".78rem", color: "var(--muted)" }}>Join the waiting list below</span>
        </span>
      ) : !isSignedInStudent ? (
        <Link href="/o-level#apply" className="btn btn-primary" style={{ marginTop: "auto" }}>
          Register Free to Get Started
        </Link>
      ) : isUnlocked ? (
        <span style={{ marginTop: "auto", color: "#15803d", fontWeight: 700, fontSize: ".9rem" }}>View lessons →</span>
      ) : (
        <span style={{ marginTop: "auto", color: "var(--blue)", fontWeight: 700, fontSize: ".9rem" }}>
          Unlock this subject →{isDiscounted && <span style={{ display: "block", fontWeight: 600, fontSize: ".78rem", color: "#15803d" }}>Bundle price — you already have {unlockedSubjects.length} subject{unlockedSubjects.length > 1 ? "s" : ""} unlocked</span>}
        </span>
      )}
    </>
  );

  if (isSignedInStudent && !fullyBooked) {
    return (
      <Link href={isUnlocked ? `/o-level/lectures?subject=${subjectSlug}` : `/o-level/unlock?subject=${subjectSlug}`} className="card" style={{ display: "flex", flexDirection: "column", textDecoration: "none" }}>
        {body}
      </Link>
    );
  }
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column" }}>
      {body}
    </div>
  );
}

function IntroVideoCard({ label, title, videoUrl, thumbnailUrl }: { label: string; title: string; videoUrl: string; thumbnailUrl: string }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <video
        controls
        preload="metadata"
        poster={thumbnailUrl || undefined}
        src={videoUrl}
        style={{ width: "100%", aspectRatio: "16/9", display: "block", background: "#0c1629" }}
      />
      <div style={{ padding: "16px 20px" }}>
        <div className="eyebrow" style={{ marginBottom: 4 }}>{label}</div>
        <p style={{ margin: 0, fontWeight: 700, color: "var(--navy)" }}>{title}</p>
      </div>
    </div>
  );
}

export default async function OLevelPage() {
  const instructor = getInstructor("ibrahim");
  const [mathIntro, englishIntro, session] = await Promise.all([
    getIntroLecture("o-level", "mathematics"),
    getIntroLecture("o-level", "english-language"),
    getSession(),
  ]);
  const isSignedInStudent = session?.role === "student";
  const accessMap = isSignedInStudent ? await getOLevelAccessMap(session!.email) : {};
  const unlockedSubjects = Object.entries(accessMap).filter(([, status]) => status === "unlocked").map(([subject]) => subject);

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
            {isSignedInStudent ? (
              <CTAButton href="/dashboard" variant="accent">Go to My Dashboard</CTAButton>
            ) : (
              <CTAButton href="#apply" variant="accent">Create Your Free Account</CTAButton>
            )}
            <CTAButton href="#subjects" variant="ghost">View Subjects and Schedule</CTAButton>
          </div>
          <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 10 }}>
            {TRUST_POINTS.map((t) => (
              <span key={t} className="badge teal">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Introduction videos — only renders once the founder has set at least one */}
      {(mathIntro || englishIntro) && (
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="container">
            <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
              <div className="eyebrow" style={{ justifyContent: "center" }}>See it for yourself</div>
              <h2 className="title">Meet Your Subjects</h2>
            </div>
            <div className={mathIntro && englishIntro ? "grid grid-2" : undefined} style={{ marginTop: 40, ...(!(mathIntro && englishIntro) ? { maxWidth: 640, marginLeft: "auto", marginRight: "auto" } : {}) }}>
              {englishIntro && (
                <IntroVideoCard label="English Language" title={englishIntro.title} videoUrl={englishIntro.video_url} thumbnailUrl={englishIntro.thumbnail_url} />
              )}
              {mathIntro && (
                <IntroVideoCard label="Mathematics" title={mathIntro.title} videoUrl={mathIntro.video_url} thumbnailUrl={mathIntro.thumbnail_url} />
              )}
            </div>
          </div>
        </section>
      )}

      {/* 2 — Subjects and schedules */}
      <section id="subjects" className="section soft" style={{ scrollMarginTop: 90 }}>
        <div className="container">
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>Founding cohorts</div>
            <h2 className="title">English Language and Mathematics</h2>
            <p className="lead" style={{ margin: "0 auto" }}>
              These two subjects are confirmed for the founding cohort, starting September 12, 2026.
            </p>
          </div>
          <div className="grid grid-2" style={{ marginTop: 40 }}>
            <CohortCard subjectSlug="english-language" basePrice={10000} isSignedInStudent={isSignedInStudent} unlockedSubjects={unlockedSubjects} />
            <CohortCard subjectSlug="mathematics" basePrice={10000} isSignedInStudent={isSignedInStudent} unlockedSubjects={unlockedSubjects} />
          </div>
          <div className="card" style={{ marginTop: 24, textAlign: "center", background: "#eaf1ff", borderColor: "#c9dcfb" }}>
            <p style={{ margin: 0, fontWeight: 700, color: "var(--navy)" }}>English Language + Mathematics: PKR 18,000 per month</p>
          </div>

          <div style={{ maxWidth: 720, margin: "56px auto 0", textAlign: "center" }}>
            <h2 className="title">Computer Science, Islamiyat and Pakistan Studies</h2>
            <p className="lead" style={{ margin: "0 auto" }}>
              These founding cohorts are fully booked. Join the waiting list below and we&apos;ll notify you as soon
              as the next cohort opens.
            </p>
          </div>
          <div className="grid grid-3" style={{ marginTop: 40 }}>
            <CohortCard subjectSlug="computer-science" basePrice={10000} isSignedInStudent={isSignedInStudent} unlockedSubjects={unlockedSubjects} fullyBooked />
            <CohortCard subjectSlug="islamiyat" basePrice={10000} isSignedInStudent={isSignedInStudent} unlockedSubjects={unlockedSubjects} fullyBooked />
            <CohortCard subjectSlug="pakistan-studies" basePrice={10000} isSignedInStudent={isSignedInStudent} unlockedSubjects={unlockedSubjects} fullyBooked />
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

      {/* 9 — Registration form */}
      <section id="apply" className="section" style={{ scrollMarginTop: 90 }}>
        <div className="container" style={{ maxWidth: 900 }}>
          {isSignedInStudent ? (
            <div className="card" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", padding: 40, background: "linear-gradient(135deg,#d4faf5,#eaf4ff)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
              <p style={{ fontWeight: 800, color: "#075a50", marginBottom: 8, fontSize: "1.05rem" }}>You&apos;re signed in</p>
              <p style={{ color: "#2d6b60", lineHeight: 1.65, margin: "0 auto 20px" }}>
                Head to your dashboard to browse lectures, quizzes and past papers, or unlock a subject.
              </p>
              <Link href="/dashboard" className="btn btn-primary">Go to my dashboard →</Link>
            </div>
          ) : (
            <>
              <div style={{ maxWidth: 720, margin: "0 auto 40px", textAlign: "center" }}>
                <div className="eyebrow" style={{ justifyContent: "center" }}>Register free</div>
                <h2 className="title">Create Your Free O Level Account</h2>
                <p className="lead" style={{ margin: "0 auto" }}>
                  Registration is free. Browse lectures, quizzes and past papers right away — pay only when you&apos;re
                  ready to unlock a subject.
                </p>
              </div>
              <OLevelRegistrationForm />
            </>
          )}
        </div>
      </section>

      {/* 10 — How unlocking works */}
      <section className="section soft">
        <div className="container" style={{ maxWidth: 780, textAlign: "center" }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>What happens next</div>
          <h2 className="title">Register free, unlock when you&apos;re ready</h2>
          <div className="grid grid-3" style={{ marginTop: 32, textAlign: "left" }}>
            <div className="card">
              <div className="icon">1</div>
              <h3>Register free</h3>
              <p>Create your account above — no payment required. You can sign in and look around right away.</p>
            </div>
            <div className="card">
              <div className="icon">2</div>
              <h3>Pick a subject to unlock</h3>
              <p>From your dashboard, choose English Language or Mathematics and submit your payment details for verification.</p>
            </div>
            <div className="card">
              <div className="icon">3</div>
              <h3>Verified &amp; unlocked</h3>
              <p>Once we verify your payment, that subject unlocks and you&apos;ll get an email confirming access — usually within a business day.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
