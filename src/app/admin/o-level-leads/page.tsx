"use client";
import { Fragment, useEffect, useState } from "react";
import Link from "next/link";

interface OLevelLead {
  studentName?: string; studentEmail?: string; parentName?: string; parentEmail?: string;
  parentWhatsapp?: string; whatsapp?: string; city?: string; country?: string;
  studentGrade?: string; schoolName?: string; targetExamSession?: string; source?: string;
  studyGroupConsent?: boolean | string; createdAt: string;
}

export default function AdminOLevelLeads() {
  const [leads, setLeads] = useState<OLevelLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin")
      .then(r => r.json())
      .then(d => setLeads(d.oLevelLeads ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function deleteLead(email: string, name?: string) {
    if (!confirm(`Delete "${name}" (${email})? This removes their lead record, account, and subject access.`)) return;
    await fetch(`/api/admin/o-level-leads/${encodeURIComponent(email)}`, { method: "DELETE" });
    setLeads(l => l.filter(o => (o.studentEmail || "") !== email));
  }

  return (
    <section className="section">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>O Level Registered Students</h1>
          <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>{leads.length} enrollment lead{leads.length === 1 ? "" : "s"}</p>
        </div>

        {loading ? (
          <div className="card"><p>Loading…</p></div>
        ) : leads.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
            <p>No O-Level enrollment leads yet.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Student email</th>
                    <th>Parent</th>
                    <th>WhatsApp</th>
                    <th>City</th>
                    <th>Grade</th>
                    <th>Registered</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((o, i) => {
                    // Backward-compat: a handful of early leads were captured
                    // by an older form with different field names.
                    const studentEmail = o.studentEmail || "—";
                    const parentWhatsapp = o.parentWhatsapp || o.whatsapp || "—";
                    const city = o.city || o.country || "—";
                    const isExpanded = expandedId === i;
                    return (
                      <Fragment key={i}>
                        <tr>
                          <td>{o.studentName || "—"}</td>
                          <td style={{ fontSize: ".85rem" }}>{studentEmail}</td>
                          <td>{o.parentName || "—"}</td>
                          <td>{parentWhatsapp}</td>
                          <td>{city}</td>
                          <td>{o.studentGrade || "—"}</td>
                          <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : i)}
                              style={{ padding: "4px 10px", borderRadius: 6, background: isExpanded ? "#eff6ff" : "#f1f5f9", border: "none", color: isExpanded ? "#155eef" : "#6b7c93", fontWeight: 700, fontSize: ".75rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                              {isExpanded ? "Hide details" : "View details"}
                            </button>
                          </td>
                          <td>
                            {studentEmail !== "—" && (
                              <button onClick={() => deleteLead(studentEmail, o.studentName)}
                                style={{ padding: "4px 10px", borderRadius: 6, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".75rem", cursor: "pointer" }}>
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={9} style={{ background: "#f8fafc", padding: "16px 20px" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px 28px" }}>
                                <div>
                                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Parent email</div>
                                  <div style={{ fontWeight: 700, color: "#071b33" }}>{o.parentEmail || "—"}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>School</div>
                                  <div style={{ fontWeight: 700, color: "#071b33" }}>{o.schoolName || "—"}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Target exam session</div>
                                  <div style={{ fontWeight: 700, color: "#071b33" }}>{o.targetExamSession || "—"}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>How they heard about us</div>
                                  <div style={{ fontWeight: 700, color: "#071b33" }}>{o.source || "—"}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Study group opt-in</div>
                                  <div style={{ fontWeight: 700, color: "#071b33" }}>{String(o.studyGroupConsent) === "true" ? "Yes" : String(o.studyGroupConsent) === "false" ? "No" : "—"}</div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
