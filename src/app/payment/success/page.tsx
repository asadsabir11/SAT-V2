import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "52px 40px", maxWidth: 480, width: "100%", boxShadow: "0 8px 40px rgba(7,27,51,.1)", textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "0 0 12px", letterSpacing: "-.03em" }}>
          Payment Successful!
        </h1>
        <p style={{ color: "#6b7c93", lineHeight: 1.7, margin: "0 0 24px", fontSize: ".95rem" }}>
          Your account has been unlocked. You now have full access to all lectures, practice tests, and live sessions.
        </p>
        <div style={{ padding: "16px 20px", borderRadius: 12, background: "#f0fdf4", border: "1.5px solid #86efac", marginBottom: 28, textAlign: "left" }}>
          <div style={{ fontWeight: 800, color: "#065f46", marginBottom: 8, fontSize: ".9rem" }}>You now have access to:</div>
          {["All Math lectures", "All Reading & Writing lectures", "Live Sessions", "Q&A Board", "AI Tutor", "Practice Tests"].map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", color: "#047857", fontSize: ".85rem", fontWeight: 600 }}>
              <span style={{ color: "#22c55e" }}>✓</span> {f}
            </div>
          ))}
        </div>
        <Link href="/dashboard" style={{ display: "inline-block", padding: "14px 32px", background: "#155eef", color: "#fff", borderRadius: 12, fontWeight: 800, fontSize: ".95rem", textDecoration: "none" }}>
          Go to Dashboard →
        </Link>
      </div>
    </div>
  );
}
