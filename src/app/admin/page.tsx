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

export default function Admin() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFounder, setIsFounder] = useState(false);

  async function clearTestData() {
    if (!confirm("⚠️ This will permanently delete ALL student registrations, diagnostics, and quiz results. This cannot be undone. Continue?")) return;
    await fetch("/api/admin/clear-test-data", { method: "DELETE" });
    setData(d => d ? { ...d, metrics: { ...d.metrics, totalLeads: 0, freeSignups: 0, paidFounderCohortStudents: 0, premiumStudents: 0, diagnosticCompletions: 0, diagnosticCompletionRate: 0 } } : d);
    alert("Test data cleared. Metrics reset to zero.");
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
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            {isFounder && (
              <Link href="/admin/quiz" className="btn btn-primary" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem" }}>
                Manage diagnostic quizzes →
              </Link>
            )}
            <Link href="/admin/sat-students" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #155eef", background: "#eff6ff", color: "#155eef" }}>
              🎓 SAT registered students →
            </Link>
            <Link href="/admin/o-level-leads" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #4338ca", background: "#eef2ff", color: "#4338ca" }}>
              🎓 O Level registered students →
            </Link>
            <Link href="/admin/quizzes" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #1d4ed8", background: "#eff6ff", color: "#1d4ed8" }}>
              📝 SAT quizzes →
            </Link>
            <Link href="/admin/materials" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #0ea5e9", background: "#f0f9ff", color: "#0369a1" }}>
              📚 Study materials →
            </Link>
            <Link href="/admin/question-bank" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #155eef", background: "#eff6ff", color: "#155eef" }}>
              📚 Question bank →
            </Link>
            <Link href="/admin/lectures" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #7c3aed", background: "#f5f3ff", color: "#7c3aed" }}>
              🎬 Manage lectures →
            </Link>
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
            {isFounder && (
              <Link href="/admin/access" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #22c55e", background: "#f0fdf4", color: "#15803d" }}>
                🔑 Access requests →
              </Link>
            )}
            <Link href="/admin/sessions" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #065f46", background: "#d1fae5", color: "#065f46" }}>
              📅 Manage sessions →
            </Link>
            <Link href="/discussion" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #7c3aed", background: "#ede9fe", color: "#7c3aed" }}>
              💬 Q&A board →
            </Link>
            <Link href="/admin/announcements" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #d97706", background: "#fef3c7", color: "#92400e" }}>
              📢 Announcements →
            </Link>
            {isFounder && (
              <Link href="/admin/parents" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #0e7490", background: "#ecfeff", color: "#0e7490" }}>
                👨‍👩‍👧 SAT parent accounts →
              </Link>
            )}
            {isFounder && (
              <Link href="/admin/o-level-parents" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #4338ca", background: "#eef2ff", color: "#4338ca" }}>
                👨‍👩‍👧 O Level parent accounts →
              </Link>
            )}
            {isFounder && (
              <Link href="/admin/teachers" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #9333ea", background: "#faf5ff", color: "#7e22ce" }}>
                👨‍🏫 Teacher accounts →
              </Link>
            )}
            {isFounder && (
              <Link href="/admin/scholarships" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #b45309", background: "#fffbeb", color: "#92400e" }}>
                🎓 Scholarship students →
              </Link>
            )}
            <Link href="/admin/attendance" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #15803d", background: "#f0fdf4", color: "#15803d" }}>
              ✅ SAT attendance →
            </Link>
            <Link href="/admin/o-level-attendance" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #4338ca", background: "#eef2ff", color: "#4338ca" }}>
              ✅ O Level attendance →
            </Link>
            <Link href="/admin/homework" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #7c3aed", background: "#f5f3ff", color: "#7c3aed" }}>
              📚 Homework →
            </Link>
            <Link href="/admin/reports" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #155eef", background: "#eff6ff", color: "#155eef" }}>
              📊 SAT parent reports →
            </Link>
            <Link href="/admin/o-level-reports" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #4338ca", background: "#eef2ff", color: "#4338ca" }}>
              📊 O Level parent reports →
            </Link>
            <Link href="/admin/analytics" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #7c3aed", background: "#f5f3ff", color: "#7c3aed" }}>
              📈 Analytics →
            </Link>
            {isFounder && (
              <button onClick={clearTestData} style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #dc2626", background: "#fee2e2", color: "#991b1b", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>
                🗑 Clear test data
              </button>
            )}
          </div>

          {loading ? (
            <div className="card">
              <p>Loading metrics…</p>
            </div>
          ) : (
            <div className="grid grid-4">
              {cards.map(([l, v, d]) => (
                <DashboardCard key={l} label={String(l)} value={String(v)} detail={String(d)} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
