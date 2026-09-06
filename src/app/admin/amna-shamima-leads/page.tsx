"use client";
import { Fragment, useEffect, useState } from "react";
import Link from "next/link";

interface AmnaShamimaLead {
  id: string;
  studentName: string;
  studentEmail: string;
  whatsapp: string;
  city: string | null;
  createdAt: string;
}

export default function AdminAmnaShamimaLeads() {
  const [leads, setLeads] = useState<AmnaShamimaLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/amna-shamima-leads")
      .then((r) => r.json())
      .then((d) => setLeads(d.leads ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function deleteLead(id: string, name: string) {
    if (!confirm(`Delete the lead for "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/amna-shamima-leads/${id}`, { method: "DELETE" });
    setLeads((l) => l.filter((x) => x.id !== id));
  }

  return (
    <section className="section">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>Amna Shamima Foundation — AI Course Leads</h1>
          <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>
            {leads.length} registration{leads.length === 1 ? "" : "s"}.
          </p>
        </div>

        {loading ? (
          <div className="card"><p>Loading…</p></div>
        ) : leads.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>🤖</div>
            <p>No leads yet.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>WhatsApp</th>
                    <th>City</th>
                    <th>Registered</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => {
                    const isExpanded = expandedId === l.id;
                    return (
                      <Fragment key={l.id}>
                        <tr>
                          <td style={{ fontWeight: 700, color: "#071b33" }}>{l.studentName}</td>
                          <td style={{ fontSize: ".85rem" }}>{l.whatsapp}</td>
                          <td style={{ fontSize: ".85rem" }}>{l.city || "—"}</td>
                          <td style={{ fontSize: ".83rem", whiteSpace: "nowrap" }}>{new Date(l.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                          <td>
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : l.id)}
                              style={{ padding: "4px 10px", borderRadius: 6, background: isExpanded ? "#eff6ff" : "#f1f5f9", border: "none", color: isExpanded ? "#155eef" : "#6b7c93", fontWeight: 700, fontSize: ".75rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                              {isExpanded ? "Hide details" : "View details"}
                            </button>
                          </td>
                          <td>
                            <button onClick={() => deleteLead(l.id, l.studentName)}
                              style={{ padding: "4px 10px", borderRadius: 6, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".75rem", cursor: "pointer" }}>
                              Delete
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} style={{ background: "#f8fafc", padding: "16px 20px", whiteSpace: "normal" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px 28px" }}>
                                <div>
                                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Email (account login)</div>
                                  <div style={{ fontWeight: 700, color: "#071b33" }}>{l.studentEmail}</div>
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
