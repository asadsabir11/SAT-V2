"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Category = "math" | "english";

interface Submission {
  id: string; is_late: boolean; marks: number | null;
}
interface Assignment {
  id: string; title: string; category: Category;
  due_at: string | null; max_marks: number | null;
  my_submission: Submission | null;
}

const CATEGORY_META: Record<Category, { label: string; icon: string }> = {
  math: { label: "Math", icon: "📐" },
  english: { label: "English", icon: "📖" },
};

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

export default function SatAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [accessLevel, setAccessLevel] = useState<"free" | "pending" | "unlocked">("free");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | Category>("all");

  useEffect(() => {
    fetch("/api/sat/assignments").then((r) => r.json()).then((d) => {
      setAssignments(d.assignments ?? []);
      setAccessLevel(d.access_level ?? "free");
    }).finally(() => setLoading(false));
  }, []);

  const locked = !loading && accessLevel !== "unlocked";
  const visible = tab === "all" ? assignments : assignments.filter((a) => a.category === tab);

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 780 }}>
        <Link href="/dashboard" style={{ color: "#6b7c93", fontSize: ".85rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16, fontWeight: 600 }}>
          ← Dashboard
        </Link>

        <div className="card" style={{ marginBottom: 20, position: "relative", overflow: "hidden", padding: "24px 26px" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, borderRadius: "50%", background: "linear-gradient(135deg,#155eef,#18a999)", opacity: 0.08 }} />
          <div style={{ display: "flex", gap: 16, alignItems: "center", position: "relative" }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, flexShrink: 0, background: "linear-gradient(135deg,#155eef,#18a999)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", boxShadow: "0 8px 22px rgba(21,94,239,.35)" }}>
              📋
            </div>
            <div>
              <h1 style={{ fontSize: "1.55rem", fontWeight: 900, color: "#071b33", margin: "0 0 3px", letterSpacing: "-.02em" }}>Assignments</h1>
              <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>Submit your work — late submissions are still accepted.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>Loading…</div>
        ) : locked ? (
          <div className="card" style={{ textAlign: "center", padding: 56 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔒</div>
            <p style={{ fontWeight: 700, color: "#071b33", marginBottom: 6 }}>
              {accessLevel === "pending" ? "Payment under review" : "Full access required"}
            </p>
            <p style={{ color: "#6b7c93", fontSize: ".88rem", marginBottom: 16 }}>
              {accessLevel === "pending" ? "We're verifying your payment — assignments will appear here once unlocked." : "Unlock full access to see and submit assignments."}
            </p>
            {accessLevel !== "pending" && <Link href="/dashboard" className="btn btn-primary">Unlock Full Access →</Link>}
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              {(["all", "math", "english"] as ("all" | Category)[]).map((c) => {
                const active = tab === c;
                const count = c === "all" ? assignments.length : assignments.filter((a) => a.category === c).length;
                return (
                  <button
                    key={c}
                    onClick={() => setTab(c)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 12, fontWeight: 800, fontSize: ".88rem", cursor: "pointer", transition: "all .15s",
                      border: active ? "2px solid #155eef" : "2px solid #e8eef6",
                      background: active ? "#eff6ff" : "#f8fafc",
                      color: active ? "#155eef" : "#6b7c93",
                    }}
                  >
                    {c !== "all" && <span style={{ fontSize: "1.1rem" }}>{CATEGORY_META[c].icon}</span>}
                    {c === "all" ? "All" : CATEGORY_META[c].label}
                    {count > 0 && <span style={{ padding: "2px 8px", borderRadius: 999, background: active ? "#155eef" : "#e8eef6", color: active ? "#fff" : "#6b7c93", fontSize: ".72rem", fontWeight: 800 }}>{count}</span>}
                  </button>
                );
              })}
            </div>

            {visible.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: 56 }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📋</div>
                <p style={{ fontWeight: 700, color: "#071b33", marginBottom: 6 }}>No assignments yet</p>
                <p style={{ color: "#6b7c93", fontSize: ".88rem" }}>Check back soon.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {visible.map((a) => {
                  const status = statusFor(a);
                  return (
                    <Link key={a.id} href={`/assignments/${a.id}`} style={{ textDecoration: "none" }}>
                      <div className="card" style={{ padding: "18px 20px", display: "flex", gap: 16, alignItems: "center", borderLeft: `4px solid ${status.border}`, transition: "box-shadow .15s, transform .15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(21,94,239,.14)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
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
          </>
        )}
      </div>
    </section>
  );
}
