import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CTAButton, FAQAccordion } from "@/components/site";
import { InstructorProfile } from "@/components/academy/InstructorProfile";
import { AcademyPricingTable } from "@/components/academy/AcademyPricingTable";
import {
  getCohortForSubject,
  getInstructor,
  getOLevelSubjects,
  getSubject,
} from "@/lib/academy/data";

export function generateStaticParams() {
  return getOLevelSubjects().map((s) => ({ subject: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string }>;
}): Promise<Metadata> {
  const { subject: slug } = await params;
  const subject = getSubject(slug);
  if (!subject) return { title: "Subject not found" };
  return {
    title: `O Level ${subject.name}`,
    description: `${subject.short} Live classes, office hours, past-paper practice, and progress reporting for Cambridge O Level ${subject.name}.`,
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
  const enrollHref = `/o-level/enroll?program=o-level&subject=${subject.slug}`;

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 880 }}>
        <nav style={{ marginBottom: 20, color: "var(--muted)", fontSize: ".85rem" }}>
          <Link href="/academy" style={{ color: "var(--muted)" }}>Academy</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/o-level" style={{ color: "var(--muted)" }}>O Level</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--navy)" }}>{subject.name}</span>
        </nav>

        <div className="eyebrow">Cambridge O Level / IGCSE</div>
        <h1 className="title" style={{ marginTop: 8 }}>O Level {subject.name}</h1>
        {subject.syllabusRef && (
          <p style={{ marginTop: -4, color: "var(--blue)", fontSize: ".92rem", fontWeight: 700 }}>
            {subject.syllabusRef}{subject.syllabusCode ? ` · ${subject.syllabusCode}` : ""}
          </p>
        )}
        <p className="lead">{subject.description}</p>
        <div className="actions">
          <CTAButton href={enrollHref} variant="accent">Take a Free Diagnostic</CTAButton>
          <CTAButton href="#enroll">Enroll in the Founding Cohort</CTAButton>
        </div>

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
