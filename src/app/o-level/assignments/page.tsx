"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getOLevelSubjects } from "@/lib/academy/data";

type Category = "mathematics" | "computer-science" | "english-language" | "islamiyat" | "pakistan-studies" | "physics";

interface Submission {
  id: string; is_late: boolean; marks: number | null;
}
interface Assignment {
  id: string; title: string; category: Category;
  due_at: string | null; max_marks: number | null;
  my_submission: Submission | null;
}

const SUBJECT_ICON: Record<Category, string> = {
  mathematics: "📐", "computer-science": "💻", "english-language": "📖", islamiyat: "🕌", "pakistan-studies": "🌍", physics: "⚛️",
};
const ALL_SUBJECTS = getOLevelSubjects().map((s) => ({ slug: s.slug as Category, name: s.name }));

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

// Locked subjects are hidden entirely — the API only ever returns
// assignments for subjects the student has unlocked, and the tab list below
// is built only from `unlockedSubjects`, so a locked subject never appears
// even as a greyed-out tab (unlike O-Level Lectures, which shows every tab
// with a lock icon).
export default function OLevelAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [unlockedSubjects, setUnlockedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Category | null>(null);

  useEffect(() => {
    fetch("/api/o-level/assignments").then((r) => r.json()).then((d) => {
      setAssignments(d.assignments ?? []);
      const unlocked: string[] = d.unlockedSubjects ?? [];
      setUnlockedSubjects(unlocked);
      const firstUnlocked = ALL_SUBJECTS.find((s) => unlocked.includes(s.slug));
      if (firstUnlocked) setTab(firstUnlocked.slug);
    }).finally(() => setLoading(false));
  }, []);

  const visibleSubjects = ALL_SUBJECTS.filter((s) => unlockedSubjects.includes(s.slug));
  const visibleAssignments = tab ? assignments.filter((a) => a.category === tab) : [];

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 780 }}>
        <Link href="/o-level" style={{ color: "#6b7c93", fontSize: ".85rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16, fontWeight: 600 }}>
          ← O Level
        </Link>

        <div className="card" style={{ marginBottom: 20, position: "relative", overflow: "hidden", padding: "24px 26px" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, borderRadius: "50%", background: "linear-gradient(135deg,#dc2626,#f87171)", opacity: 0.08 }} />
          <div style={{ display: "flex", gap: 16, alignItems: "center", position: "relative" }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, flexShrink: 0, background: "linear-gradient(135deg,#dc2626,#f87171)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", boxShadow: "0 8px 22px rgba(220,38,38,.35)" }}>
              📋
            </div>
            <div>
              <h1 style={{ fontSize: "1.55rem", fontWeight: 900, color: "#071b33", margin: "0 0 3px", letterSpacing: "-.02em" }}>Assignments</h1>
              <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>Submit your work per subject — late submissions are still accepted.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>Loading…</div>
        ) : visibleSubjects.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 56 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔒</div>
            <p style={{ fontWeight: 700, color: "#071b33", marginBottom: 6 }}>No unlocked subjects yet</p>
            <p style={{ color: "#6b7c93", fontSize: ".88rem", marginBottom: 16 }}>Unlock a subject to see its assignments here.</p>
            <Link href="/o-level/unlock" className="btn btn-primary">Unlock a subject →</Link>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              {visibleSubjects.map(({ slug, name }) => {
                const active = tab === slug;
                const count = assignments.filter((a) => a.category === slug).length;
                return (
                  <button
                    key={slug}
                    onClick={() => setTab(slug)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 12, fontWeight: 800, fontSize: ".88rem", cursor: "pointer", transition: "all .15s",
                      border: active ? "2px solid #dc2626" : "2px solid #e8eef6",
                      background: active ? "#fef2f2" : "#f8fafc",
                      color: active ? "#dc2626" : "#6b7c93",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>{SUBJECT_ICON[slug]}</span>
                    {name}
                    {count > 0 && <span style={{ padding: "2px 8px", borderRadius: 999, background: active ? "#dc2626" : "#e8eef6", color: active ? "#fff" : "#6b7c93", fontSize: ".72rem", fontWeight: 800 }}>{count}</span>}
                  </button>
                );
              })}
            </div>

            {visibleAssignments.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: 56, maxWidth: 480 }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>{tab ? SUBJECT_ICON[tab] : "📋"}</div>
                <p style={{ fontWeight: 700, color: "#071b33", marginBottom: 6 }}>No assignments yet</p>
                <p style={{ color: "#6b7c93", fontSize: ".88rem" }}>Check back soon.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {visibleAssignments.map((a) => {
                  const status = statusFor(a);
                  return (
                    <Link key={a.id} href={`/o-level/assignments/${a.id}`} style={{ textDecoration: "none" }}>
                      <div className="card" style={{ padding: "18px 20px", display: "flex", gap: 16, alignItems: "center", borderLeft: `4px solid ${status.border}`, transition: "box-shadow .15s, transform .15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(220,38,38,.14)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
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
