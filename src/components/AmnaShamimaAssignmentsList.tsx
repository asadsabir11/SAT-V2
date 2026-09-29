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

function statusFor(a: Assignment): { label: string; bg: string; color: string } {
  if (a.my_submission?.marks !== null && a.my_submission?.marks !== undefined) {
    return { label: `Graded — ${a.my_submission.marks}${a.max_marks ? `/${a.max_marks}` : ""}`, bg: "#d1fae5", color: "#065f46" };
  }
  if (a.my_submission) {
    return a.my_submission.is_late
      ? { label: "Turned in late", bg: "#fee2e2", color: "#991b1b" }
      : { label: "Turned in", bg: "#dbeafe", color: "#1d4ed8" };
  }
  const overdue = a.due_at ? Date.now() > new Date(a.due_at).getTime() : false;
  return overdue
    ? { label: "Missing", bg: "#fee2e2", color: "#991b1b" }
    : { label: "Assigned", bg: "#fef3c7", color: "#92400e" };
}

// Auth (session + program) is checked in the server page.tsx that renders
// this, same split used for the Q&A board.
export default function AmnaShamimaAssignmentsList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/amna-shamima/assignments").then((r) => r.json()).then((d) => setAssignments(d.assignments ?? [])).finally(() => setLoading(false));
  }, []);

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 780 }}>
        <Link href="/amna-shamima/portal" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none", display: "block", marginBottom: 16 }}>← Portal</Link>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 900, color: "#071b33", margin: "0 0 4px", letterSpacing: "-.03em" }}>Assignments</h1>
        <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: "0 0 24px" }}>Submit your work here — late submissions are still accepted.</p>

        {loading ? (
          <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>Loading…</div>
        ) : assignments.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 56 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📋</div>
            <p style={{ fontWeight: 700, color: "#071b33", marginBottom: 6 }}>No assignments yet</p>
            <p style={{ color: "#6b7c93", fontSize: ".88rem" }}>Check back soon.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {assignments.map((a) => {
              const status = statusFor(a);
              return (
                <Link key={a.id} href={`/amna-shamima/portal/assignments/${a.id}`} style={{ textDecoration: "none" }}>
                  <div className="card" style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: ".71rem", fontWeight: 700, background: status.bg, color: status.color }}>{status.label}</span>
                    </div>
                    <p style={{ fontWeight: 800, color: "#071b33", margin: "0 0 4px", fontSize: ".95rem" }}>{a.title}</p>
                    <p style={{ color: "#6b7c93", fontSize: ".8rem", margin: 0 }}>Due: {fmtDue(a.due_at)}</p>
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
