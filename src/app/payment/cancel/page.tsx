import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "52px 40px", maxWidth: 480, width: "100%", boxShadow: "0 8px 40px rgba(7,27,51,.1)", textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: 16 }}>↩️</div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "0 0 12px", letterSpacing: "-.03em" }}>
          Payment Cancelled
        </h1>
        <p style={{ color: "#6b7c93", lineHeight: 1.7, margin: "0 0 28px", fontSize: ".95rem" }}>
          No worries — your payment was not charged. You can unlock full access anytime from your dashboard.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/dashboard" style={{ padding: "12px 24px", background: "#f1f5f9", color: "#344054", borderRadius: 10, fontWeight: 700, fontSize: ".9rem", textDecoration: "none" }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
