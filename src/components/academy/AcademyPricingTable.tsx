import { CTAButton } from "@/components/site";
import { getActivePricing, formatPrice } from "@/lib/academy/data";

/**
 * Renders the currently-active O Level pricing schedule (founding by default).
 * Prices come entirely from lib/academy/data.ts — no literals here.
 */
export function AcademyPricingTable() {
  const schedule = getActivePricing();

  return (
    <div className="card">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <h3 style={{ margin: 0 }}>{schedule.label} pricing</h3>
        <span style={{ color: "var(--muted)", fontSize: ".78rem", fontWeight: 700 }}>
          Prices in {schedule.currency} / month
        </span>
      </div>
      {schedule.note && <p style={{ marginTop: 4 }}>{schedule.note}</p>}

      <div className="stat-row">
        {schedule.tiers.map((tier) => (
          <div className="stat-cell" key={tier.subjects} style={{ textAlign: "center" }}>
            <span>{tier.subjects} {tier.subjects === 1 ? "subject" : "subjects"}</span>
            <strong>{formatPrice(schedule.currency, tier.price)}</strong>
            <span>/ month</span>
          </div>
        ))}
      </div>

      <div className="actions">
        <CTAButton href="/o-level/enroll">Join the Founding Cohort</CTAButton>
        <CTAButton href="/o-level#subjects" variant="secondary">View Subjects</CTAButton>
      </div>
      <p style={{ marginTop: 16, color: "var(--muted)", fontSize: ".8rem", lineHeight: 1.6 }}>
        Structured preparation, expert guidance, and regular practice. We do not
        guarantee Cambridge grades — we focus on current readiness, exam strategy,
        and steady improvement.
      </p>
    </div>
  );
}
