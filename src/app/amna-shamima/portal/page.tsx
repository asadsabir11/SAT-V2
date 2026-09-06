import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PageHero } from "@/components/site";

export const metadata: Metadata = { title: "My Account", robots: { index: false, follow: false } };

// Deliberately its own page rather than the shared /dashboard — that page is
// built entirely around the SAT/O-Level content model. This program has no
// fee gating, no subjects, no quizzes — just two things: lectures and the
// online class — so the portal is intentionally just two permanent cards.
export default async function AmnaShamimaPortal() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "amna-shamima") {
    redirect("/login?role=student&program=amna-shamima&next=/amna-shamima/portal");
  }

  return (
    <>
      <PageHero eyebrow="🤖 AI Course · Amna Shamima Foundation" title={`Welcome, ${session!.name.split(" ")[0]}!`}>
        Watch lectures at your own pace, or join the live online class.
      </PageHero>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ maxWidth: 700 }}>
          <div className="grid grid-2">
            <Link
              href="/amna-shamima/portal/lectures"
              className="module-card fade-up"
              style={{ "--module-accent": "#7c3aed", "--module-accent-grad": "linear-gradient(135deg,#7c3aed,#a855f7)", "--module-glow": "rgba(124,58,237,.35)" } as CSSProperties}
            >
              <article className="card" style={{ height: "100%" }}>
                <div className="module-icon">🎥</div>
                <h3>Lectures</h3>
                <p>Watch recorded video lessons at your own pace.</p>
                <span className="module-arrow" style={{ color: "#7c3aed", fontWeight: 700, fontSize: ".85rem" }}>Open →</span>
              </article>
            </Link>
            <Link
              href="/amna-shamima/portal/online-class"
              className="module-card fade-up"
              style={{ "--module-accent": "#059669", "--module-accent-grad": "linear-gradient(135deg,#059669,#10b981)", "--module-glow": "rgba(5,150,105,.35)" } as CSSProperties}
            >
              <article className="card" style={{ height: "100%" }}>
                <div className="module-icon">💻</div>
                <h3>Online Class</h3>
                <p>Join the live class and ask questions in real time.</p>
                <span className="module-arrow" style={{ color: "#059669", fontWeight: 700, fontSize: ".85rem" }}>Open →</span>
              </article>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
