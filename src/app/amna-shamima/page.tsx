import type { Metadata } from "next";
import { CTAButton } from "@/components/site";
import { AmnaShamimaRegistrationForm } from "@/components/AmnaShamimaRegistrationForm";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "AI Course — Amna Shamima Foundation",
  robots: { index: false, follow: false },
};

const WHAT_STUDENTS_RECEIVE = [
  { icon: "🎥", title: "Recorded lectures", description: "Watch structured video lessons at your own pace, any time." },
  { icon: "💻", title: "Live online class", description: "Join scheduled live sessions to ask questions and go deeper." },
  { icon: "🤖", title: "Practical AI skills", description: "Learn the tools and concepts behind modern AI, from the ground up." },
];

export default async function AmnaShamimaPage() {
  const session = await getSession();
  const isSignedIn = session?.role === "student" && session.program === "amna-shamima";

  return (
    <>
      <section className="section band">
        <div className="container">
          <div className="eyebrow" style={{ color: "#5eead4" }}>Amna Shamima Foundation — Exclusive Program</div>
          <h1 className="display" style={{ color: "#fff", maxWidth: 780 }}>
            AI Course for Amna Shamima Foundation Students
          </h1>
          <p className="lead" style={{ color: "rgba(255,255,255,.78)" }}>
            A dedicated AI training program built for Amna Shamima Foundation students — free video lectures and a
            live online class, taught by The Digital Tutor.
          </p>
          <div className="actions">
            {isSignedIn ? (
              <CTAButton href="/amna-shamima/portal" variant="accent">Go to My Portal</CTAButton>
            ) : (
              <CTAButton href="#apply" variant="accent">Register Now</CTAButton>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: "center" }}>What you&apos;ll get</div>
          <h2 className="title" style={{ textAlign: "center" }}>Everything you need to start learning AI</h2>
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

      <section className="section soft" id="apply" style={{ scrollMarginTop: 90 }}>
        <div className="container" style={{ maxWidth: 720 }}>
          {isSignedIn ? (
            <div className="card" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", padding: 40, background: "linear-gradient(135deg,#fff7ed,#eaf4ff)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
              <p style={{ fontWeight: 800, color: "#9a3412", marginBottom: 8, fontSize: "1.05rem" }}>You&apos;re already registered</p>
              <p style={{ color: "#7c4a1e", lineHeight: 1.65, margin: "0 auto 20px" }}>
                Head to your portal to watch lectures and join the online class.
              </p>
              <CTAButton href="/amna-shamima/portal" variant="primary">Go to my portal →</CTAButton>
            </div>
          ) : (
            <>
              <div className="eyebrow" style={{ justifyContent: "center" }}>Register</div>
              <h2 className="title" style={{ textAlign: "center" }}>Register for the AI Course</h2>
              <p className="lead" style={{ textAlign: "center", margin: "0 auto 28px" }}>
                This program is exclusively for Amna Shamima Foundation students. Fill out the form below to create
                your account.
              </p>
              <AmnaShamimaRegistrationForm />
            </>
          )}
        </div>
      </section>
    </>
  );
}
