import type { Metadata } from "next";
import Link from "next/link";
import { ScholarshipForm } from "@/components/ScholarshipForm";
import { getSession } from "@/lib/auth";
import { getScholarshipByStudentUserId } from "@/lib/scholarships";

const BASE_URL = "https://academy.thedigitaltutor.net";
const DESC = "The Digital Tutor Opportunity Scholarship reserves fully funded places in our founding cohorts for students who demonstrate financial need and a genuine commitment to learning.";

export const metadata: Metadata = {
  title: "Opportunity Scholarship",
  description: DESC,
  alternates: { canonical: `${BASE_URL}/scholarship` },
  openGraph: { title: "The Digital Tutor Opportunity Scholarship", description: DESC, url: `${BASE_URL}/scholarship`, type: "website", images: ["/opengraph-image"] },
};

const REQUIREMENTS = [
  "Maintain at least 90% live-class attendance",
  "Complete at least 90% of assigned work",
  "Attempt all required assessments",
  "Attend office hours / support sessions when requested by the teacher",
  "Participate consistently and communicate when help is needed",
  "Maintain academic integrity",
  "Demonstrate genuine effort and willingness to improve",
];

export default async function ScholarshipPage() {
  const session = await getSession();
  const myScholarship = session?.role === "student" ? await getScholarshipByStudentUserId(session.id) : null;
  const programLabel = myScholarship?.program === "o-level" ? "Cambridge O Level" : "SAT Prep";

  return (
    <>
      <section className="section band">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="eyebrow" style={{ color: "#5eead4" }}>The Digital Tutor Opportunity Scholarship</div>
          <h1 className="display" style={{ color: "#fff" }}>Can&apos;t Afford Tuition? Don&apos;t Let That Stop You.</h1>
          <p className="lead" style={{ maxWidth: 680 }}>
            The Digital Tutor is reserving a limited number of <strong>100% tuition scholarships</strong> for
            deserving students whose families cannot comfortably afford tuition.
          </p>
          <p className="lead" style={{ maxWidth: 680 }}>
            We don&apos;t expect perfect grades. We expect commitment. If you attend your classes, complete your
            work, take your assessments, ask for help when you need it and genuinely work toward improvement, we
            want to hear from you.
          </p>
          <p style={{ fontWeight: 800, fontSize: "1.05rem", color: "#fff", maxWidth: 680 }}>
            Financial circumstances should not determine how far a serious student can go.
          </p>
          <div className="actions">
            {myScholarship ? (
              <Link href="/dashboard" className="btn btn-primary">Go to my dashboard →</Link>
            ) : (
              <a href="#apply" className="btn btn-primary">Apply for a 100% Opportunity Scholarship →</a>
            )}
          </div>
          <p style={{ color: "#9fb3c8", fontSize: ".85rem", marginTop: 16 }}>
            Applications are private, and scholarship students receive the same classes, resources and support as
            every other Digital Tutor student.
          </p>
        </div>
      </section>

      <section className="section soft">
        <div className="container" style={{ maxWidth: 780 }}>
          <div style={{ maxWidth: 720, margin: "0 auto 32px", textAlign: "center" }}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>Scholarship Requirements</div>
            <h2 className="title">What we ask of a scholarship student</h2>
          </div>
          <details open style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", border: "1px solid var(--line)" }}>
            <summary style={{ fontSize: "1rem" }}>A scholarship student is expected to:</summary>
            <ul className="check-list" style={{ margin: "16px 0 0" }}>
              {REQUIREMENTS.map(r => <li key={r}>{r}</li>)}
            </ul>
            <div style={{ marginTop: 20, padding: "16px 18px", borderRadius: 12, background: "#eff6ff", border: "1px solid #bfdbfe" }}>
              <p style={{ margin: "0 0 8px", fontWeight: 800, color: "#071b33" }}>Your scholarship does NOT depend on getting an A or A*.</p>
              <p style={{ margin: 0, color: "#344054", fontSize: ".92rem", lineHeight: 1.65 }}>
                A student who is struggling academically but attending, completing the work and genuinely trying
                should remain eligible. Scholarships may be reviewed when a student repeatedly fails to participate
                or complete required work — and before a scholarship is withdrawn, the student and parent will
                always receive a warning and a probation opportunity first.
              </p>
            </div>
          </details>
        </div>
      </section>

      <section id="apply" className="section" style={{ scrollMarginTop: 90 }}>
        <div className="container" style={{ maxWidth: 780 }}>
          {myScholarship ? (
            <div className="card" style={{ textAlign: "center", padding: "48px 32px", background: "linear-gradient(135deg,#d4faf5,#eaf4ff)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🎓</div>
              <p style={{ fontWeight: 800, color: "#075a50", marginBottom: 8, fontSize: "1.2rem" }}>
                Your Opportunity Scholarship is approved!
              </p>
              <p style={{ color: "#2d6b60", lineHeight: 1.65, maxWidth: 480, margin: "0 auto 24px" }}>
                {myScholarship.student_name}, you have a full 100% scholarship for the <strong>{programLabel}</strong> program.
                There&apos;s nothing further to apply for — head to your dashboard to keep learning.
              </p>
              <Link href="/dashboard" className="btn btn-primary">Go to my dashboard →</Link>
            </div>
          ) : (
            <>
              <div style={{ maxWidth: 720, margin: "0 auto 32px", textAlign: "center" }}>
                <div className="eyebrow" style={{ justifyContent: "center" }}>Apply</div>
                <h2 className="title">Opportunity Scholarship application</h2>
                <p className="lead" style={{ margin: "0 auto" }}>
                  Takes a few minutes. No account, bank statements, or financial documents needed at this stage.
                </p>
              </div>
              <ScholarshipForm />
              <p style={{ textAlign: "center", color: "#6b7c93", fontSize: ".85rem", marginTop: 20 }}>
                We review every application privately. If approved, we&apos;ll create your account and email you a
                link to set your password — no need to register separately.
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
