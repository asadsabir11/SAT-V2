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
  return new Date(d).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function statusFor(a: Assignment): { label: string; icon: string; bg: string; color: string } {
  if (a.my_submission?.marks !== null && a.my_submission?.marks !== undefined) {
    return { label: `Graded — ${a.my_submission.marks}${a.max_marks ? `/${a.max_marks}` : ""}`, icon: "🌟", bg: "#d1fae5", color: "#065f46" };
  }
  if (a.my_submission) {
    return a.my_submission.is_late
      ? { label: "Turned in late", icon: "⚠️", bg: "#fee2e2", color: "#991b1b" }
      : { label: "Turned in", icon: "✅", bg: "#dbeafe", color: "#1d4ed8" };
  }
  const overdue = a.due_at ? Date.now() > new Date(a.due_at).getTime() : false;
  return overdue
    ? { label: "Missing", icon: "❗", bg: "#fee2e2", color: "#991b1b" }
    : { label: "Assigned", icon: "🕐", bg: "#fef3c7", color: "#92400e" };
}

// Auth (session + program) is checked in the server page.tsx that renders
// this, same split used for the Q&A board.
export default function AmnaShamimaAssignmentsList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/amna-shamima/assignments").then((r) => r.json()).then((d) => setAssignments(d.assignments ?? [])).finally(() => setLoading(false));
  }, []);

  const pendingCount = assignments.filter((a) => statusFor(a).label === "Assigned" || statusFor(a).label === "Missing").length;

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 780 }}>
        <Link href="/amna-shamima/portal" style={{ color: "#6b7c93", fontSize: ".85rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16, fontWeight: 600 }}>
          ← Portal
        </Link>

        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: "linear-gradient(135deg,#0e7490,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", boxShadow: "0 8px 22px rgba(14,116,144,.35)" }}>
            📋
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#071b33", margin: "0 0 2px", letterSpacing: "-.02em" }}>Assignments</h1>
            <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>
              {!loading && assignments.length > 0
                ? pendingCount > 0 ? `${pendingCount} need${pendingCount === 1 ? "s" : ""} your attention` : "You're all caught up! 🎉"
                : "Submit your work here — late submissions are still accepted."}
            </p>
          </div>
        </div>

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
                  <div className="card" style={{ padding: "18px 20px", display: "flex", gap: 16, alignItems: "center", transition: "box-shadow .15s, transform .15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(14,116,144,.14)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", background: status.bg }}>
                      {status.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 800, color: "#071b33", margin: "0 0 4px", fontSize: ".98rem" }}>{a.title}</p>
                      <p style={{ color: "#94a3b8", fontSize: ".8rem", margin: 0 }}>Due: {fmtDue(a.due_at)}</p>
                    </div>
                    <span style={{ padding: "5px 12px", borderRadius: 999, fontSize: ".74rem", fontWeight: 700, background: status.bg, color: status.color, flexShrink: 0, whiteSpace: "nowrap" }}>
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
