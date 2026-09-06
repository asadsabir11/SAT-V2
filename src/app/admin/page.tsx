"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardCard, PageHero } from "@/components/site";

interface Metrics {
  totalLeads: number;
  freeSignups: number;
  paidFounderCohortStudents: number;
  premiumStudents: number;
  parentWebinarRegistrations: number;
  contactMessages: number;
  diagnosticCompletions: number;
  diagnosticCompletionRate: number;
  oLevelLeads: number;
}

interface AdminData {
  metrics: Metrics;
}

function BigNavCard({ href, icon, title, count, accent }: { href: string; icon: string; title: string; count: number | string; accent: string }) {
  return (
    <Link href={href} className="card" style={{ display: "block", textDecoration: "none", padding: "28px 26px", borderTop: `4px solid ${accent}` }}>
      <div style={{ fontSize: "2rem", marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: "1.7rem", fontWeight: 900, color: "#071b33" }}>{count}</div>
      <div style={{ fontWeight: 800, color: "#071b33", fontSize: "1.05rem", margin: "4px 0 6px" }}>{title}</div>
      <div style={{ color: accent, fontSize: ".85rem", fontWeight: 700 }}>View all →</div>
    </Link>
  );
}

export default function Admin() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFounder, setIsFounder] = useState(false);
  const [scholarshipStudentCount, setScholarshipStudentCount] = useState<number | null>(null);
  const [punjab9thLeadCount, setPunjab9thLeadCount] = useState<number | null>(null);
  const [amnaShamimaLeadCount, setAmnaShamimaLeadCount] = useState<number | null>(null);

  async function clearTestData() {
    const typed = window.prompt(
      "This permanently deletes EVERY student — SAT registrations, O-Level registrations, and scholarship students alike — plus their diagnostics, quiz results, and O-Level subject unlocks. This is not limited to test accounts; it includes every real registration too. This cannot be undone.\n\nType DELETE to confirm:"
    );
    if (typed !== "DELETE") return;
    await fetch("/api/admin/clear-test-data", { method: "DELETE" });
    setData(d => d ? { ...d, metrics: { ...d.metrics, totalLeads: 0, freeSignups: 0, paidFounderCohortStudents: 0, premiumStudents: 0, diagnosticCompletions: 0, diagnosticCompletionRate: 0, oLevelLeads: 0 } } : d);
    setScholarshipStudentCount(0);
    alert("All students cleared. Metrics reset to zero.");
  }

  useEffect(() => {
    fetch("/api/admin")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setIsFounder(d.user?.role === "founder"))
      .catch(() => {});
    fetch("/api/admin/scholarships")
      .then((r) => r.json())
      .then((d) => setScholarshipStudentCount((d.applications ?? []).filter((a: { student_user_id: string | null }) => a.student_user_id).length))
      .catch(() => {});
    fetch("/api/admin/punjab-9th-leads")
      .then((r) => r.json())
      .then((d) => setPunjab9thLeadCount((d.leads ?? []).length))
      .catch(() => {});
    fetch("/api/admin/amna-shamima-leads")
      .then((r) => r.json())
      .then((d) => setAmnaShamimaLeadCount((d.leads ?? []).length))
      .catch(() => {});
  }, []);

  const m = data?.metrics;
  const cards: [string, string | number, string][] = m
    ? [
        ["Total registrations", m.totalLeads, "All student leads"],
        ["Free signups", m.freeSignups, "Top of funnel"],
        ["Core Plan students", m.paidFounderCohortStudents, "Goal: 20+"],
        ["Contact messages", m.contactMessages, "Inbound inquiries"],
        ["Diagnostics taken", m.diagnosticCompletions, "Lead activation"],
        ["Diagnostic rate", `${m.diagnosticCompletionRate}%`, "Completions / registrations"],
        ["O-Level leads", m.oLevelLeads, "Academy — program=o-level"],
      ]
    : [];

  return (
    <>
      <PageHero eyebrow="Founder validation dashboard" title="Measure behavior, not applause.">
        Live data from all form submissions — updates in real time.
      </PageHero>
      <section className="section">
        <div className="container">
          <div style={{ display: "grid", gap: 20, marginBottom: 32 }}>
            {/* O Level */}
            <article className="card" style={{ padding: "22px 24px", borderTop: "4px solid #4338ca" }}>
              <h3 style={{ margin: "0 0 14px", color: "#071b33", fontSize: "1.05rem" }}>📘 O Level</h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/admin/o-level-quizzes" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #b45309", background: "#fef3c7", color: "#b45309" }}>
                  📘 O Level quizzes →
                </Link>
                {isFounder && (
                  <Link href="/admin/o-level-access" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #22c55e", background: "#f0fdf4", color: "#15803d" }}>
                    🔑 O Level access →
                  </Link>
                )}
                <Link href="/admin/past-papers" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #0e7490", background: "#ecfeff", color: "#0e7490" }}>
                  📄 O Level past papers →
                </Link>
                <Link href="/admin/workbooks" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #7c3aed", background: "#f5f3ff", color: "#7c3aed" }}>
                  📘 O Level workbooks →
                </Link>
                <Link href="/admin/o-level-attendance" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #4338ca", background: "#eef2ff", color: "#4338ca" }}>
                  ✅ O Level attendance →
                </Link>
                {isFounder && (
                  <Link href="/admin/o-level-parents" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #4338ca", background: "#eef2ff", color: "#4338ca" }}>
                    👨‍👩‍👧 O Level parent accounts →
                  </Link>
                )}
                <Link href="/admin/o-level-reports" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #4338ca", background: "#eef2ff", color: "#4338ca" }}>
                  📊 O Level parent reports →
                </Link>
                {/* Shared with SAT — one page, program toggle inside */}
                <Link href="/admin/lectures" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #7c3aed", background: "#f5f3ff", color: "#7c3aed" }}>
                  🎬 Manage lectures →
                </Link>
                <Link href="/admin/question-bank" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #155eef", background: "#eff6ff", color: "#155eef" }}>
                  📚 Question bank →
                </Link>
                <Link href="/admin/sessions" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #065f46", background: "#d1fae5", color: "#065f46" }}>
                  📅 Manage sessions →
                </Link>
                {/* General tools, relevant here too */}
                <Link href="/admin/announcements" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #d97706", background: "#fef3c7", color: "#92400e" }}>
                  📢 Announcements →
                </Link>
                {isFounder && (
                  <Link href="/admin/scholarships" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #b45309", background: "#fffbeb", color: "#92400e" }}>
                    🎓 Scholarship applications →
                  </Link>
                )}
                {isFounder && (
                  <Link href="/admin/teachers" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #9333ea", background: "#faf5ff", color: "#7e22ce" }}>
                    👨‍🏫 Teacher accounts →
                  </Link>
                )}
                <Link href="/admin/homework" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #7c3aed", background: "#f5f3ff", color: "#7c3aed" }}>
                  📚 Homework →
                </Link>
                <Link href="/admin/analytics" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #7c3aed", background: "#f5f3ff", color: "#7c3aed" }}>
                  📈 Analytics →
                </Link>
                <Link href="/discussion" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #7c3aed", background: "#ede9fe", color: "#7c3aed" }}>
                  💬 Q&A board →
                </Link>
                {isFounder && (
                  <button onClick={clearTestData} style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #dc2626", background: "#fee2e2", color: "#991b1b", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>
                    🗑 Clear ALL students (every program)
                  </button>
                )}
              </div>
            </article>

            {/* SAT */}
            <article className="card" style={{ padding: "22px 24px", borderTop: "4px solid #155eef" }}>
              <h3 style={{ margin: "0 0 14px", color: "#071b33", fontSize: "1.05rem" }}>🎓 SAT</h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {isFounder && (
                  <Link href="/admin/quiz" className="btn btn-primary" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem" }}>
                    Manage diagnostic quizzes →
                  </Link>
                )}
                <Link href="/admin/quizzes" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #1d4ed8", background: "#eff6ff", color: "#1d4ed8" }}>
                  📝 SAT quizzes →
                </Link>
                <Link href="/admin/materials" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #0ea5e9", background: "#f0f9ff", color: "#0369a1" }}>
                  📚 Study materials →
                </Link>
                {isFounder && (
                  <Link href="/admin/access" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #22c55e", background: "#f0fdf4", color: "#15803d" }}>
                    🔑 Access requests →
                  </Link>
                )}
                <Link href="/admin/attendance" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #15803d", background: "#f0fdf4", color: "#15803d" }}>
                  ✅ SAT attendance →
                </Link>
                {isFounder && (
                  <Link href="/admin/parents" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #0e7490", background: "#ecfeff", color: "#0e7490" }}>
                    👨‍👩‍👧 SAT parent accounts →
                  </Link>
                )}
                <Link href="/admin/reports" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #155eef", background: "#eff6ff", color: "#155eef" }}>
                  📊 SAT parent reports →
                </Link>
                {/* Shared with O Level — one page, program toggle inside */}
                <Link href="/admin/lectures" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #7c3aed", background: "#f5f3ff", color: "#7c3aed" }}>
                  🎬 Manage lectures →
                </Link>
                <Link href="/admin/question-bank" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #155eef", background: "#eff6ff", color: "#155eef" }}>
                  📚 Question bank →
                </Link>
                <Link href="/admin/sessions" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #065f46", background: "#d1fae5", color: "#065f46" }}>
                  📅 Manage sessions →
                </Link>
                {/* General tools, relevant here too */}
                <Link href="/admin/announcements" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #d97706", background: "#fef3c7", color: "#92400e" }}>
                  📢 Announcements →
                </Link>
                {isFounder && (
                  <Link href="/admin/scholarships" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #b45309", background: "#fffbeb", color: "#92400e" }}>
                    🎓 Scholarship applications →
                  </Link>
                )}
                {isFounder && (
                  <Link href="/admin/teachers" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #9333ea", background: "#faf5ff", color: "#7e22ce" }}>
                    👨‍🏫 Teacher accounts →
                  </Link>
                )}
                <Link href="/admin/homework" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #7c3aed", background: "#f5f3ff", color: "#7c3aed" }}>
                  📚 Homework →
                </Link>
                <Link href="/admin/analytics" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #7c3aed", background: "#f5f3ff", color: "#7c3aed" }}>
                  📈 Analytics →
                </Link>
                <Link href="/discussion" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #7c3aed", background: "#ede9fe", color: "#7c3aed" }}>
                  💬 Q&A board →
                </Link>
                {isFounder && (
                  <button onClick={clearTestData} style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #dc2626", background: "#fee2e2", color: "#991b1b", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>
                    🗑 Clear ALL students (every program)
                  </button>
                )}
              </div>
            </article>

            {/* 9th Grade */}
            <article className="card" style={{ padding: "22px 24px", borderTop: "4px solid #ea580c" }}>
              <h3 style={{ margin: "0 0 14px", color: "#071b33", fontSize: "1.05rem" }}>📗 9th Grade</h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {isFounder && (
                  <Link href="/admin/punjab-9th-access" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #ea580c", background: "#fff7ed", color: "#c2410c" }}>
                    🔑 9th Class access →
                  </Link>
                )}
                <Link href="/admin/punjab-9th-sessions" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #ea580c", background: "#fff7ed", color: "#c2410c" }}>
                  🎥 9th Online Classes →
                </Link>
                <Link href="/admin/punjab-9th-quizzes" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #ea580c", background: "#fff7ed", color: "#c2410c" }}>
                  📝 9th Class quizzes →
                </Link>
                <Link href="/admin/punjab-9th-attendance" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #ea580c", background: "#fff7ed", color: "#c2410c" }}>
                  ✅ 9th Grade attendance →
                </Link>
                {/* General tools, relevant here too */}
                {isFounder && (
                  <Link href="/admin/teachers" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #9333ea", background: "#faf5ff", color: "#7e22ce" }}>
                    👨‍🏫 Teacher accounts →
                  </Link>
                )}
                <Link href="/admin/homework" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #7c3aed", background: "#f5f3ff", color: "#7c3aed" }}>
                  📚 Homework →
                </Link>
                <Link href="/admin/analytics" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #7c3aed", background: "#f5f3ff", color: "#7c3aed" }}>
                  📈 Analytics →
                </Link>
                <Link href="/discussion" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #7c3aed", background: "#ede9fe", color: "#7c3aed" }}>
                  💬 Q&A board →
                </Link>
                {isFounder && (
                  <button onClick={clearTestData} style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #dc2626", background: "#fee2e2", color: "#991b1b", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>
                    🗑 Clear ALL students (every program)
                  </button>
                )}
              </div>
            </article>

            {/* Amna Shamima */}
            <article className="card" style={{ padding: "22px 24px", borderTop: "4px solid #7c3aed" }}>
              <h3 style={{ margin: "0 0 14px", color: "#071b33", fontSize: "1.05rem" }}>🤖 Amna Shamima</h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/admin/amna-shamima-lectures" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #7c3aed", background: "#f5f3ff", color: "#7c3aed" }}>
                  🤖 Amna Shamima lectures →
                </Link>
                <Link href="/admin/amna-shamima-sessions" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #059669", background: "#ecfdf5", color: "#047857" }}>
                  💻 Amna Shamima online class →
                </Link>
                {/* General tools, relevant here too */}
                {isFounder && (
                  <Link href="/admin/teachers" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #9333ea", background: "#faf5ff", color: "#7e22ce" }}>
                    👨‍🏫 Teacher accounts →
                  </Link>
                )}
                <Link href="/admin/homework" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #7c3aed", background: "#f5f3ff", color: "#7c3aed" }}>
                  📚 Homework →
                </Link>
                <Link href="/admin/analytics" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #7c3aed", background: "#f5f3ff", color: "#7c3aed" }}>
                  📈 Analytics →
                </Link>
                <Link href="/discussion" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #7c3aed", background: "#ede9fe", color: "#7c3aed" }}>
                  💬 Q&A board →
                </Link>
                {isFounder && (
                  <button onClick={clearTestData} style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #dc2626", background: "#fee2e2", color: "#991b1b", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>
                    🗑 Clear ALL students (every program)
                  </button>
                )}
              </div>
            </article>

            {/* Fees */}
            {isFounder && (
              <article className="card" style={{ padding: "22px 24px", borderTop: "4px solid #059669" }}>
                <h3 style={{ margin: "0 0 14px", color: "#071b33", fontSize: "1.05rem" }}>💰 Fees</h3>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link href="/admin/fees" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #059669", background: "#ecfdf5", color: "#047857" }}>
                    💰 Fees →
                  </Link>
                </div>
              </article>
            )}
          </div>

          {loading ? (
            <div className="card">
              <p>Loading metrics…</p>
            </div>
          ) : (
            <>
              <div className="grid grid-4">
                {cards.map(([l, v, d]) => (
                  <DashboardCard key={l} label={String(l)} value={String(v)} detail={String(d)} />
                ))}
              </div>

              <div style={{ marginTop: 32 }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>Registered students</div>
                <div className="grid grid-4">
                  <BigNavCard href="/admin/sat-students" icon="🎓" title="SAT Registered Students" count={m?.totalLeads ?? "—"} accent="#155eef" />
                  <BigNavCard href="/admin/o-level-leads" icon="🎓" title="O Level Registered Students" count={m?.oLevelLeads ?? "—"} accent="#4338ca" />
                  <BigNavCard href="/admin/scholarship-students" icon="🎓" title="Scholarship Students" count={scholarshipStudentCount ?? "—"} accent="#b45309" />
                  <BigNavCard href="/admin/punjab-9th-leads" icon="📗" title="Punjab 9th Class Leads" count={punjab9thLeadCount ?? "—"} accent="#ea580c" />
                  <BigNavCard href="/admin/amna-shamima-leads" icon="🤖" title="Amna Shamima AI Course Leads" count={amnaShamimaLeadCount ?? "—"} accent="#7c3aed" />
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
