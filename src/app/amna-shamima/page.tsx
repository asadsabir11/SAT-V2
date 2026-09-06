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

const WHY_THIS_PROGRAM = [
  { icon: "🆓", title: "Completely free", description: "Sponsored through the partnership with Amna Shamima Foundation — no fees, ever." },
  { icon: "🌍", title: "Skills for the future", description: "AI literacy is quickly becoming a core skill — this course gives students a genuine head start." },
  { icon: "🧑‍🏫", title: "Real teaching, not just videos", description: "A live class alongside the lecture library means students can ask questions and get real feedback." },
];

export default async function AmnaShamimaPage() {
  const session = await getSession();
  const isSignedIn = session?.role === "student" && session.program === "amna-shamima";

  return (
    <>
      {/* Hero */}
      <section className="section band">
        <div className="container">
          <div className="hero-layout">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 3 }}>
                  <img src="/amna-shamima-logo.png" alt="Amna Shamima Foundation" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
                <div className="eyebrow" style={{ color: "#5eead4", margin: 0 }}>Amna Shamima Foundation — Exclusive Program</div>
              </div>
              <h1 className="display" style={{ color: "#fff", maxWidth: 700 }}>
                AI Course for Amna Shamima Foundation Students
              </h1>
              <p className="lead" style={{ color: "rgba(255,255,255,.78)" }}>
                A dedicated AI training program built exclusively for Amna Shamima Foundation students — free video
                lectures and a live online class, taught by The Digital Tutor.
              </p>
              <p style={{ color: "rgba(255,255,255,.62)", lineHeight: 1.75, maxWidth: 600 }}>
                The Amna Shamima Foundation works to bring quality education and skill-building to students who
                would otherwise have no access to it. Through this partnership, those same students now get a
                structured introduction to artificial intelligence — completely free, taught the same way we teach
                every other program on this platform.
              </p>
              <div className="actions">
                {isSignedIn ? (
                  <CTAButton href="/amna-shamima/portal" variant="accent">Go to My Portal</CTAButton>
                ) : (
                  <CTAButton href="#apply" variant="accent">Register Now</CTAButton>
                )}
              </div>
            </div>
            <div className="hero-panel" style={{ padding: 14 }}>
              <img
                src="/amna-shamim-classroom2.png"
                alt="Amna Shamima Foundation students in class"
                style={{ width: "100%", borderRadius: 18, display: "block", objectFit: "cover", maxHeight: 420 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why this program */}
      <section className="section">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: "center" }}>Why this program exists</div>
          <h2 className="title" style={{ textAlign: "center" }}>A free head start into AI</h2>
          <div className="grid grid-3" style={{ marginTop: 32 }}>
            {WHY_THIS_PROGRAM.map((f) => (
              <article className="card" key={f.title}>
                <div className="icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* What you'll get */}
      <section className="section soft">
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

      {/* Students in action */}
      <section className="section">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: "center" }}>Amna Shamima Foundation students</div>
          <h2 className="title" style={{ textAlign: "center" }}>Students already learning and growing together</h2>
          <div className="grid grid-2" style={{ marginTop: 32 }}>
            <figure style={{ margin: 0 }}>
              <img src="/amina-shamim-classroom1.png" alt="Foundation students practicing writing together" style={{ width: "100%", borderRadius: 16, display: "block", objectFit: "cover", maxHeight: 320 }} />
              <figcaption style={{ marginTop: 10, color: "var(--muted)", fontSize: ".85rem", textAlign: "center" }}>A group writing and calligraphy session at the Foundation</figcaption>
            </figure>
            <figure style={{ margin: 0 }}>
              <img src="/amna-shamim-classroom2.png" alt="Foundation students in a classroom lesson" style={{ width: "100%", borderRadius: 16, display: "block", objectFit: "cover", maxHeight: 320 }} />
              <figcaption style={{ marginTop: 10, color: "var(--muted)", fontSize: ".85rem", textAlign: "center" }}>Students following along during a classroom lesson</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Registration */}
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
