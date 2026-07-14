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
}

interface AdminData {
  metrics: Metrics;
  students: Record<string, string>[];
  webinar: Record<string, string>[];
  partners: Record<string, string>[];
}

export default function Admin() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const m = data?.metrics;
  const cards: [string, string | number, string][] = m
    ? [
        ["Total registrations", m.totalLeads, "All student leads"],
        ["Free signups", m.freeSignups, "Top of funnel"],
        ["Founder Core students", m.paidFounderCohortStudents, "Goal: 20+"],
        ["Premium students", m.premiumStudents, "Goal: 10+"],
        ["Webinar registrations", m.parentWebinarRegistrations, "Goal: 30+"],
        ["Partnership leads", m.partnershipLeads, "Schools, NGOs, sponsors"],
        ["Contact messages", m.contactMessages, "Inbound inquiries"],
        ["Diagnostics taken", m.diagnosticCompletions, "Lead activation"],
        ["Diagnostic rate", `${m.diagnosticCompletionRate}%`, "Completions / registrations"],
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
            <Link href="/admin/quiz" className="btn btn-primary" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem" }}>
              Manage diagnostic quizzes →
            </Link>
            <Link href="/admin/question-bank" className="btn" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem", border: "2px solid #155eef", background: "#eff6ff", color: "#155eef" }}>
              📚 Question bank →
            </Link>
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
            </>
          )}
        </div>
      </section>
    </>
  );
}
