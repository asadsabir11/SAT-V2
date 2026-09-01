import type { Metadata } from "next";
import { PageHero } from "@/components/site";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "Refund and cancellation policy for The Digital Tutor's O Level Founding Cohort.",
  alternates: { canonical: "/o-level/refund-policy" },
};

const SECTIONS: [string, string | null][] = [
  ["Whether the first payment is refundable", "Yes — your first payment is 100% refundable if you cancel within 7 days of making it."],
  ["The cancellation deadline", "7 days from the date of your first payment."],
  ["Whether attended classes are refundable", "Classes already attended are non-refundable. Any eligible refund after withdrawal applies only to future/unused tuition."],
  ["How refunds are requested", "Refund requests must be submitted in writing using the student's/parent's registered email/contact channel and include the student's name, program/subject and reason for the request."],
  ["Processing time", "Approved refunds will normally be processed within 7–10 business days. Bank/payment-provider posting times may be additional."],
  ["Treatment of missed classes", "Student-missed classes are non-refundable. Where available, recordings, lesson materials, office hours or another reasonable catch-up option may be used."],
  ["What happens if The Digital Tutor cancels a cohort", "If cancelled before commencement, tuition paid for the cohort is refunded in full. If discontinued after commencement, students receive a prorated refund for paid classes not delivered, or may choose an available transfer."],
  ["If The Digital Tutor cancels an individual class", "We will normally reschedule or provide an equivalent replacement session. If we cannot reasonably provide a replacement, an appropriate credit or prorated refund will be issued."],
  ["Whether founder pricing continues after a break in enrollment", "Founder pricing remains available while continuous eligible enrollment is maintained. If enrollment is cancelled or lapses, re-enrollment is at the then-current price and subject to availability. We may preserve founder pricing for an approved temporary pause in exceptional circumstances."],
];

export default function OLevelRefundPolicy() {
  return (
    <>
      <PageHero eyebrow="Refund & cancellation policy" title="Refund & Cancellation Policy" backHref="/o-level" backLabel="O Level">
        The refund and cancellation terms for the O Level Founding Cohort are set out below.
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
