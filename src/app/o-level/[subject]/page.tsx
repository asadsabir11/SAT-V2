import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CTAButton, FAQAccordion } from "@/components/site";
import { InstructorProfile } from "@/components/academy/InstructorProfile";
import { AcademyPricingTable } from "@/components/academy/AcademyPricingTable";
import { TrackViewContent } from "../TrackViewContent";
import {
  getCohortForSubject,
  getInstructor,
  getOLevelSubjects,
  getSubject,
} from "@/lib/academy/data";

export function generateStaticParams() {
  return getOLevelSubjects().map((s) => ({ subject: s.slug }));
}

// Mirrors SUBJECT_CLASS_TIME in ../page.tsx — duplicated here (not
// imported) since that file isn't a shared module, just the sibling
// marketing page. Only the 3 subjects actually open for enrollment (the
// other 3 — islamiyat, pakistan-studies, physics — show "Coming soon" with
// no real day/time yet) get a schedule in the Course schema below.
const SUBJECT_SCHEDULE: Record<string, { days: string[]; start: string; end: string; workload: string }> = {
  "english-language": { days: ["Friday"], start: "18:00", end: "19:00", workload: "PT1H" },
  "mathematics": { days: ["Saturday"], start: "18:00", end: "19:00", workload: "PT1H" },
  "computer-science": { days: ["Monday", "Tuesday", "Wednesday", "Thursday"], start: "19:00", end: "20:30", workload: "PT1H30M" },
};

function formatTime12h(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

function formatSchedule(s: { days: string[]; start: string; end: string }): string {
  const dayLabel = s.days.length > 1 ? `${s.days[0]}–${s.days[s.days.length - 1]}` : s.days[0];
  return `${dayLabel}, ${formatTime12h(s.start)} – ${formatTime12h(s.end)} (PKT)`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string }>;
}): Promise<Metadata> {
  const { subject: slug } = await params;
  const subject = getSubject(slug);
  if (!subject) return { title: "Subject not found" };
  const title = subject.seoTitle ?? `O Level ${subject.name}`;
  const description = subject.seoDescription ?? `${subject.short} Live classes, office hours, past-paper practice, and progress reporting for Cambridge O Level ${subject.name}.`;
  return {
    // absolute: these titles already carry brand-free keyword + syllabus code.
    // Letting the root layout append " | The Digital Tutor" pushed them past
    // ~75 chars, so Google truncated the syllabus code off the end.
    title: subject.seoTitle ? { absolute: subject.seoTitle } : title,
    description,
    alternates: { canonical: `/o-level/${slug}` },
    openGraph: { title, description, url: `/o-level/${slug}`, type: "website", images: ["/opengraph-image"] },
  };
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject: slug } = await params;
  const subject = getSubject(slug);
  if (!subject || subject.program !== "o-level") notFound();

  const instructor = getInstructor(subject.instructorId);
  const cohort = getCohortForSubject(subject.slug);

  const BASE_URL = "https://academy.thedigitaltutor.net";
  // PKR 10,000/month is the real advertised single-subject price shown
  // throughout the page (FAQ, pricing table) — the bundle/marginal pricing
  // only applies to an already-signed-in student with other subjects
  // unlocked, which isn't something anonymous schema can represent.
  const schedule = SUBJECT_SCHEDULE[subject.slug];
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `Cambridge O Level ${subject.name}${subject.syllabusCode ? ` (${subject.syllabusCode})` : ""}`,
    description: subject.description,
    provider: { "@type": "EducationalOrganization", name: "The Digital Tutor", sameAs: BASE_URL },
    url: `${BASE_URL}/o-level/${subject.slug}`,
    ...(instructor ? { instructor: { "@type": "Person", name: instructor.name } } : {}),
    offers: {
      "@type": "Offer",
      price: "10000",
      priceCurrency: "PKR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "10000",
        priceCurrency: "PKR",
        unitText: "MONTH",
      },
      availability: schedule ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      url: `${BASE_URL}/o-level#apply`,
    },
    ...(schedule ? {
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: schedule.workload,
        courseSchedule: {
          "@type": "Schedule",
          repeatFrequency: "P1W",
          byDay: schedule.days.map((d) => `https://schema.org/${d}`),
          startTime: schedule.start,
          endTime: schedule.end,
        },
      },
    } : {}),
  };
  const faqSchema = subject.faqs && subject.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: subject.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  } : null;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "O Level", item: `${BASE_URL}/o-level` },
      { "@type": "ListItem", position: 3, name: subject.name, item: `${BASE_URL}/o-level/${subject.slug}` },
    ],
  };

  return (
    <section className="section">
      <TrackViewContent contentName={`O Level ${subject.name}`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="container" style={{ maxWidth: 880 }}>
        <nav style={{ marginBottom: 20, color: "var(--muted)", fontSize: ".85rem" }}>
          <Link href="/" style={{ color: "var(--muted)" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/o-level" style={{ color: "var(--muted)" }}>O Level</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--navy)" }}>{subject.name}</span>
        </nav>

        <div className="eyebrow">Cambridge O Level / IGCSE</div>
        <h1 className="title" style={{ marginTop: 8 }}>{subject.seoH1 ?? `O Level ${subject.name}`}</h1>
        {subject.syllabusRef && (
          <p style={{ marginTop: -4, color: "var(--blue)", fontSize: ".92rem", fontWeight: 700 }}>
            {subject.syllabusRef}{subject.syllabusCode ? ` · ${subject.syllabusCode}` : ""}
          </p>
        )}
        <p className="lead">{subject.description}</p>
        {schedule && (
          <p style={{ color: "var(--blue)", fontWeight: 800, fontSize: "1rem", marginTop: -8, marginBottom: 16 }}>
            {formatSchedule(schedule)} · PKR 10,000/month
          </p>
        )}
        {/* This page is statically generated (generateStaticParams) and served
            identically to every visitor, signed in or not — it can't check
            session state the way the dynamic /o-level page does. One button,
            not several — they all pointed at the same /o-level#apply anchor
            anyway (a prior fix, since they used to link straight into
            middleware-protected routes like /o-level/lectures and bounce
            every signed-out visitor to /login). An already signed-in student
            landing here can still reach their lectures via the header/
            dashboard nav. */}
        <div className="actions">
          <CTAButton href="/o-level#apply" variant="accent">View Schedule &amp; Register Free</CTAButton>
        </div>
        <p style={{ marginTop: 12, color: "var(--muted)", fontSize: ".82rem", maxWidth: 560 }}>
          Creating an account is free — you can preview the learning platform before paying anything. When you&apos;re
          ready, unlock the course by paying via bank transfer from your dashboard; verification usually takes
          one business day.
        </p>
        {subject.slug === "computer-science" && (
          <p style={{ marginTop: 4, color: "var(--muted)", fontSize: ".82rem" }}>
            Also available: the companion{" "}
            <Link href="/o-level/computer-science-book" style={{ color: "var(--blue)", fontWeight: 700 }}>
              O Level Computer Science Interactive Exam Workbook →
            </Link>
          </p>
        )}

        {cohort && (
          <div className="card" style={{ marginTop: 32, background: "#eaf1ff", borderColor: "#c9dcfb" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, fontSize: ".88rem" }}>
              <span style={{ fontWeight: 800, color: "var(--navy)" }}>Founding cohort</span>
              <span style={{ color: "var(--muted)" }}>Target exam: {cohort.targetExam}</span>
              <span style={{ color: "var(--muted)" }}>{cohort.scheduleLabel}</span>
              <span className="badge teal">{cohort.status === "enrolling" ? "Now enrolling" : cohort.status}</span>
            </div>
          </div>
        )}

        <Section title="Who this course is for">
          <ul className="check-list">
            {subject.forWho.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </Section>

        <div className="grid grid-2" style={{ marginTop: 40 }}>
          <article className="card">
            <h3 style={{ marginTop: 0 }}>Topics we cover</h3>
            <p style={{ fontSize: ".78rem", color: "var(--muted)" }}>
              Indicative topic areas — always aligned to the current Cambridge syllabus.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", marginTop: 4 }}>
              {subject.indicativeTopics.map((t) => (
                <span className="badge" key={t}>{t}</span>
              ))}
            </div>
          </article>
          <article className="card">
            <h3 style={{ marginTop: 0 }}>Learning outcomes</h3>
            <ul className="check-list">
              {subject.learningOutcomes.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </article>
        </div>

        <Section title="Weekly class model">
          <div className="grid grid-2">
            {subject.classModel.map((slot) => (
              <div className="card" key={slot.title}>
                <p style={{ margin: 0, fontWeight: 800, color: "var(--navy)" }}>{slot.title}</p>
                <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: ".88rem" }}>
                  {slot.durationMins} minutes · {slot.cadence}
                </p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 12, color: "var(--muted)", fontSize: ".78rem" }}>
            Exact days and times are set per cohort and shared on enrollment.
          </p>
        </Section>

        <div className="grid grid-2" style={{ marginTop: 40 }}>
          <article className="card">
            <h3 style={{ marginTop: 0 }}>Assessment approach</h3>
            <p>{subject.assessmentApproach}</p>
          </article>
          <article className="card">
            <h3 style={{ marginTop: 0 }}>Practice &amp; past papers</h3>
            <p>
              Topical questions, timed practice, and past-paper style questions with review. Original Digital Tutor
              practice material is clearly distinct from official Cambridge past papers.
            </p>
          </article>
        </div>

        <Section title="Open office hours">
          <p>
            Stuck between classes? Join live office hours to ask questions, review homework, and work through
            difficult problems — no need to wait for the next lesson.
          </p>
        </Section>

        {instructor && (
          <Section title="Your teacher">
            <InstructorProfile instructor={instructor} />
          </Section>
        )}

        <section id="enroll" style={{ marginTop: 48, scrollMarginTop: 90 }}>
          <h2 className="title">Enroll</h2>
          <p className="lead">
            Founding pricing applies across all O Level subjects — add more subjects for a lower per-subject rate.
          </p>
          <div style={{ marginTop: 24 }}>
            <AcademyPricingTable />
          </div>
        </section>

        {subject.faqs && subject.faqs.length > 0 && (
          <Section title="FAQs">
            <FAQAccordion items={subject.faqs.map((f) => [f.q, f.a])} />
          </Section>
        )}
      </div>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 40 }}>
      <h2 style={{ color: "var(--navy)", fontSize: "1.15rem", fontWeight: 800 }}>{title}</h2>
      <div style={{ marginTop: 14 }}>{children}</div>
    </section>
  );
}
