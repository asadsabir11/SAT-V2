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
  partnershipLeads: number;
  contactMessages: number;
  diagnosticCompletions: number;
  diagnosticCompletionRate: number;
  oLevelLeads: number;
}

interface AdminData {
  metrics: Metrics;
  students: Record<string, string>[];
  webinar: Record<string, string>[];
  partners: Record<string, string>[];
  oLevelLeads: Record<string, string>[];
}

export default function Admin() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFounder, setIsFounder] = useState(false);

  async function deleteStudent(email: string, name: string) {
    if (!confirm(`Delete "${name}" (${email})? This removes their account and all data.`)) return;
    await fetch(`/api/admin/students/${encodeURIComponent(email)}`, { method: "DELETE" });
    setData(d => d ? { ...d, students: d.students.filter(s => s.studentEmail !== email) } : d);
  }

  async function clearTestData() {
    if (!confirm("⚠️ This will permanently delete ALL student registrations, diagnostics, and quiz results. This cannot be undone. Continue?")) return;
    await fetch("/api/admin/clear-test-data", { method: "DELETE" });
    setData(d => d ? { ...d, students: [], metrics: { ...d.metrics, totalLeads: 0, freeSignups: 0, paidFounderCohortStudents: 0, premiumStudents: 0, diagnosticCompletions: 0, diagnosticCompletionRate: 0 } } : d);
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
        ["Premium students", m.premiumStudents, "Goal: 10+"],
        ["Webinar registrations", m.parentWebinarRegistrations, "Goal: 30+"],
        ["Partnership leads", m.partnershipLeads, "Schools, NGOs, sponsors"],
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
            {isFounder && (
              <Link href="/admin/o-level-applications" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #c2410c", background: "#fff7ed", color: "#c2410c" }}>
                📋 O Level applications →
              </Link>
            )}
            <Link href="/admin/past-papers" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #0e7490", background: "#ecfeff", color: "#0e7490" }}>
              📄 O Level past papers →
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
                👨‍👩‍👧 Parent accounts →
              </Link>
            )}
            {isFounder && (
              <Link href="/admin/teachers" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #9333ea", background: "#faf5ff", color: "#7e22ce" }}>
                👨‍🏫 Teacher accounts →
              </Link>
            )}
            <Link href="/admin/attendance" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #15803d", background: "#f0fdf4", color: "#15803d" }}>
              ✅ Attendance →
            </Link>
            <Link href="/admin/homework" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #7c3aed", background: "#f5f3ff", color: "#7c3aed" }}>
              📚 Homework →
            </Link>
            <Link href="/admin/reports" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #155eef", background: "#eff6ff", color: "#155eef" }}>
              📊 Parent reports →
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
            <>
              <div className="grid grid-4">
                {cards.map(([l, v, d]) => (
                  <DashboardCard key={l} label={String(l)} value={String(v)} detail={String(d)} />
                ))}
              </div>

              <div className="card" style={{ marginTop: 24 }}>
                <div className="eyebrow">Registered students</div>
                <h2 style={{ color: "#071b33" }}>Student registrations</h2>
                {data?.students.length === 0 ? (
                  <p>No student registrations yet. Submit the registration form to see data here.</p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Country</th>
                          <th>Package</th>
                          <th>Email</th>
                          <th>Grade</th>
                          <th>Registered</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.students.map((s, i) => (
                          <tr key={i}>
                            <td>{s.studentName}</td>
                            <td>{s.country}</td>
                            <td>{s.packageType}</td>
                            <td>{s.studentEmail}</td>
                            <td>{s.grade ?? "—"}</td>
                            <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                            <td>
                              <button onClick={() => deleteStudent(s.studentEmail, s.studentName)}
                                style={{ padding: "4px 10px", borderRadius: 6, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".75rem", cursor: "pointer" }}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {(data?.webinar.length ?? 0) > 0 && (
                <div className="card" style={{ marginTop: 24 }}>
                  <div className="eyebrow">Parent webinar</div>
                  <h2 style={{ color: "#071b33" }}>Webinar registrations</h2>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Parent name</th>
                          <th>Country</th>
                          <th>Email</th>
                          <th>Main concern</th>
                          <th>Registered</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.webinar.map((w, i) => (
                          <tr key={i}>
                            <td>{w.parentName}</td>
                            <td>{w.country}</td>
                            <td>{w.email}</td>
                            <td>{w.mainConcern?.slice(0, 60)}{(w.mainConcern?.length ?? 0) > 60 ? "…" : ""}</td>
                            <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {(data?.partners.length ?? 0) > 0 && (
                <div className="card" style={{ marginTop: 24 }}>
                  <div className="eyebrow">Partnership leads</div>
                  <h2 style={{ color: "#071b33" }}>Partner inquiries</h2>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Organization</th>
                          <th>Contact</th>
                          <th>Country</th>
                          <th>Type</th>
                          <th>Students</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.partners.map((p, i) => (
                          <tr key={i}>
                            <td>{p.organizationName}</td>
                            <td>{p.contactName}</td>
                            <td>{p.country}</td>
                            <td>{p.organizationType}</td>
                            <td>{p.estimatedStudents ?? "—"}</td>
                            <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {(data?.oLevelLeads.length ?? 0) > 0 && (
                <div className="card" style={{ marginTop: 24 }}>
                  <div className="eyebrow">Academy — O Level</div>
                  <h2 style={{ color: "#071b33" }}>O-Level enrollment leads</h2>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Parent</th>
                          <th>Country</th>
                          <th>Subjects</th>
                          <th>WhatsApp</th>
                          <th>Registered</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.oLevelLeads.map((o, i) => (
                          <tr key={i}>
                            <td>{o.studentName}</td>
                            <td>{o.parentName}</td>
                            <td>{o.country}</td>
                            <td>{o.subject || "—"}</td>
                            <td>{o.whatsapp}</td>
                            <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
