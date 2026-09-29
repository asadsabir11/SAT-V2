"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Submission {
  id: string; is_late: boolean; marks: number | null;
}
interface Assignment {
  id: string; title: string; description: string;
  due_at: string | null; max_marks: number | null;
  my_submission: Submission | null;
}

function fmtDue(d: string | null) {
  if (!d) return "No due date";
  return new Date(d).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
}

function statusFor(a: Assignment): { label: string; icon: string; bg: string; color: string; border: string } {
  if (a.my_submission?.marks !== null && a.my_submission?.marks !== undefined) {
    return { label: `Graded — ${a.my_submission.marks}${a.max_marks ? `/${a.max_marks}` : ""}`, icon: "🌟", bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" };
  }
  if (a.my_submission) {
    return a.my_submission.is_late
      ? { label: "Turned in late", icon: "⚠️", bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" }
      : { label: "Turned in", icon: "✅", bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" };
  }
  const overdue = a.due_at ? Date.now() > new Date(a.due_at).getTime() : false;
  return overdue
    ? { label: "Missing", icon: "❗", bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" }
    : { label: "Assigned", icon: "🕐", bg: "#fef3c7", color: "#92400e", border: "#fde68a" };
}

// Auth (session + program) is checked in the server page.tsx that renders
// this, same split used for the Q&A board.
export default function AmnaShamimaAssignmentsList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/amna-shamima/assignments").then((r) => r.json()).then((d) => setAssignments(d.assignments ?? [])).finally(() => setLoading(false));
  }, []);

  const gradedCount = assignments.filter((a) => a.my_submission?.marks !== null && a.my_submission?.marks !== undefined).length;
  const pendingCount = assignments.filter((a) => {
    const s = statusFor(a).label;
    return s === "Assigned" || s === "Missing";
  }).length;
  const allCaughtUp = !loading && assignments.length > 0 && pendingCount === 0;

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 780 }}>
        <Link href="/amna-shamima/portal" style={{ color: "#6b7c93", fontSize: ".85rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16, fontWeight: 600 }}>
          ← Portal
        </Link>

        {/* Header */}
        <div className="card" style={{ marginBottom: 20, position: "relative", overflow: "hidden", padding: "24px 26px" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, borderRadius: "50%", background: "linear-gradient(135deg,#0e7490,#06b6d4)", opacity: 0.08 }} />
          <div style={{ position: "absolute", bottom: -60, right: 40, width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg,#0e7490,#06b6d4)", opacity: 0.06 }} />
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: assignments.length > 0 ? 18 : 0, position: "relative" }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, flexShrink: 0, background: "linear-gradient(135deg,#0e7490,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", boxShadow: "0 8px 22px rgba(14,116,144,.35)" }}>
              📋
            </div>
            <div>
              <h1 style={{ fontSize: "1.55rem", fontWeight: 900, color: "#071b33", margin: "0 0 3px", letterSpacing: "-.02em" }}>Assignments</h1>
              <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>Submit your work here — late submissions are still accepted.</p>
            </div>
          </div>

          {!loading && assignments.length > 0 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10, background: "#f1f5f9" }}>
                <span style={{ fontWeight: 900, fontSize: "1.1rem", color: "#0e7490" }}>{assignments.length}</span>
                <span style={{ fontSize: ".78rem", fontWeight: 700, color: "#64748b" }}>Total</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10, background: "#d1fae5" }}>
                <span style={{ fontWeight: 900, fontSize: "1.1rem", color: "#065f46" }}>{gradedCount}</span>
                <span style={{ fontSize: ".78rem", fontWeight: 700, color: "#065f46" }}>Graded</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10, background: pendingCount > 0 ? "#fef3c7" : "#f1f5f9" }}>
                <span style={{ fontWeight: 900, fontSize: "1.1rem", color: pendingCount > 0 ? "#92400e" : "#94a3b8" }}>{pendingCount}</span>
                <span style={{ fontSize: ".78rem", fontWeight: 700, color: pendingCount > 0 ? "#92400e" : "#94a3b8" }}>Pending</span>
              </div>
            </div>
          )}
        </div>

        {allCaughtUp && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 12, background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)", border: "1.5px solid #86efac", marginBottom: 20 }}>
            <span style={{ fontSize: "1.3rem" }}>🎉</span>
            <p style={{ margin: 0, fontWeight: 800, color: "#15803d", fontSize: ".92rem" }}>You&apos;re all caught up — nothing pending!</p>
          </div>
        )}

        {loading ? (
          <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>Loading…</div>
        ) : assignments.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 56 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📋</div>
            <p style={{ fontWeight: 700, color: "#071b33", marginBottom: 6 }}>No assignments yet</p>
            <p style={{ color: "#6b7c93", fontSize: ".88rem" }}>Check back soon.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {assignments.map((a) => {
              const status = statusFor(a);
              return (
                <Link key={a.id} href={`/amna-shamima/portal/assignments/${a.id}`} style={{ textDecoration: "none" }}>
                  <div className="card" style={{ padding: "18px 20px", display: "flex", gap: 16, alignItems: "center", borderLeft: `4px solid ${status.border}`, transition: "box-shadow .15s, transform .15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(14,116,144,.14)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", background: status.bg }}>
                      {status.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 800, color: "#071b33", margin: "0 0 4px", fontSize: ".98rem" }}>{a.title}</p>
                      <p style={{ color: "#94a3b8", fontSize: ".8rem", margin: 0 }}>Due: {fmtDue(a.due_at)}</p>
                    </div>
                    <span style={{ padding: "6px 14px", borderRadius: 999, fontSize: ".76rem", fontWeight: 800, background: status.bg, color: status.color, flexShrink: 0, whiteSpace: "nowrap" }}>
                      {status.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
