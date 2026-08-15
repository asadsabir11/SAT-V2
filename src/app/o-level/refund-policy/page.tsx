import type { Metadata } from "next";
import { PageHero } from "@/components/site";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "Refund and cancellation policy for The Digital Tutor's O Level Founding Cohort.",
};

const SECTIONS: [string, string | null][] = [
  ["Whether the first payment is refundable", "Yes — your first payment is 100% refundable if you cancel within 7 days of making it."],
  ["The cancellation deadline", "7 days from the date of your first payment."],
  ["Whether attended classes are refundable", null],
  ["How refunds are requested", null],
  ["Processing time", null],
  ["Treatment of missed classes", null],
  ["What happens if The Digital Tutor cancels a cohort", null],
  ["Whether founder pricing continues after a break in enrollment", null],
];

export default function OLevelRefundPolicy() {
  return (
    <>
      <PageHero eyebrow="Refund & cancellation policy" title="Refund & Cancellation Policy" backHref="/o-level" backLabel="O Level">
        The core refund terms below are confirmed. The remaining sections will be published before the founding
        cohort begins.
      </PageHero>
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <div style={{ display: "grid", gap: 20 }}>
            {SECTIONS.map(([title, answer]) => (
              <div key={title} className="card" style={!answer ? { background: "#fffbeb", borderColor: "#fde68a" } : undefined}>
                <h3 style={{ marginTop: 0, fontSize: "1rem" }}>{title}</h3>
                <p style={{ margin: 0, color: answer ? "var(--muted)" : "#92400e" }}>
                  {answer ?? "⚠ To be confirmed by the founder before launch."}
                </p>
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
