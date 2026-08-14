import type { Metadata } from "next";
import { PageHero } from "@/components/site";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "Refund and cancellation policy for The Digital Tutor's O Level Founding Cohort.",
};

const SECTIONS = [
  "Whether the first payment is refundable",
  "The cancellation deadline",
  "Whether attended classes are refundable",
  "How refunds are requested",
  "Processing time",
  "Treatment of missed classes",
  "What happens if The Digital Tutor cancels a cohort",
  "Whether founder pricing continues after a break in enrollment",
];

export default function OLevelRefundPolicy() {
  return (
    <>
      <PageHero eyebrow="Refund & cancellation policy" title="Refund & Cancellation Policy" backHref="/o-level" backLabel="O Level">
        This policy will be published in full, approved by the founder, before the O Level Founding Cohort begins
        accepting payment.
      </PageHero>
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="card" style={{ background: "#fffbeb", borderColor: "#fde68a", marginBottom: 32 }}>
            <p style={{ margin: 0, color: "#92400e", fontWeight: 700 }}>
              ⚠ This policy is pending founder approval and is not yet final. It will be completed before any
              payment is accepted for the founding cohort.
            </p>
          </div>
          <div style={{ display: "grid", gap: 20 }}>
            {SECTIONS.map((s) => (
              <div key={s} className="card">
                <h3 style={{ marginTop: 0, fontSize: "1rem" }}>{s}</h3>
                <p style={{ margin: 0, color: "var(--muted)" }}>To be confirmed by the founder before launch.</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 32, color: "var(--muted)", fontSize: ".85rem", textAlign: "center" }}>
            Questions in the meantime? Message us on WhatsApp using the button in the corner of this page.
          </p>
        </div>
      </section>
    </>
  );
}
