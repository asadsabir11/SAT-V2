import type { Metadata } from "next";
import { TeacherApplicationForm } from "@/components/TeacherApplicationForm";

const BASE_URL = "https://academy.thedigitaltutor.net";

export const metadata: Metadata = {
  title: "Teaching Jobs — Join The Digital Tutor",
  description: "We're hiring teachers for SAT, Cambridge O Level, and Punjab Board 9th Class. Submit your resume and our team will contact you directly.",
  alternates: { canonical: `${BASE_URL}/careers` },
};

const WHAT_WE_LOOK_FOR = [
  { icon: "🎓", title: "Subject expertise", description: "Strong command of your subject — SAT, O Level, or Punjab Board 9th Class." },
  { icon: "💬", title: "Clear communication", description: "Able to explain concepts simply and keep students engaged in live online classes." },
  { icon: "⏱️", title: "Reliability", description: "Consistent attendance and punctuality for scheduled classes." },
];

export default function CareersPage() {
  return (
    <>
      <section className="section band">
        <div className="container">
          <div className="eyebrow" style={{ color: "#5eead4" }}>We&apos;re Hiring</div>
          <h1 className="display" style={{ color: "#fff", maxWidth: 700 }}>
            Teach With The Digital Tutor
          </h1>
          <p className="lead" style={{ color: "rgba(255,255,255,.78)" }}>
            We&apos;re looking for experienced teachers to join our online academy across SAT prep, Cambridge O Level,
            and Punjab Board 9th Class. Submit your resume below and our team will reach out directly.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: "center" }}>What we look for</div>
          <h2 className="title" style={{ textAlign: "center" }}>A good fit for our teaching team</h2>
          <div className="grid grid-3" style={{ marginTop: 32 }}>
            {WHAT_WE_LOOK_FOR.map((f) => (
              <article className="card" key={f.title}>
                <div className="icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container" style={{ maxWidth: 640 }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Apply</div>
          <h2 className="title" style={{ textAlign: "center" }}>Submit Your Application</h2>
          <p className="lead" style={{ textAlign: "center", margin: "0 auto 28px" }}>
            Fill out the form below and attach your resume. If your profile matches what we&apos;re looking for,
            we&apos;ll contact you directly by phone.
          </p>
          <TeacherApplicationForm />
        </div>
      </section>
    </>
  );
}
