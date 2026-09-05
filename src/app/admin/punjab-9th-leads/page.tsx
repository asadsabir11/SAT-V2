"use client";
import { Fragment, useEffect, useState } from "react";
import Link from "next/link";

interface Punjab9thLead {
  id: string;
  studentName: string;
  parentName: string;
  parentWhatsapp: string;
  city: string;
  punjabBoard: string;
  schoolName: string | null;
  studyGroup: string;
  teachingMedium: string;
  preferredClassTime: string;
  deviceAvailable: string | null;
  howHeard: string | null;
  createdAt: string;
}

type GroupFilter = "all" | "Biology" | "Computer Science";

export default function AdminPunjab9thLeads() {
  const [leads, setLeads] = useState<Punjab9thLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [groupFilter, setGroupFilter] = useState<GroupFilter>("all");

  useEffect(() => {
    fetch("/api/admin/punjab-9th-leads")
      .then((r) => r.json())
      .then((d) => setLeads(d.leads ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function deleteLead(id: string, name: string) {
    if (!confirm(`Delete the lead for "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/punjab-9th-leads/${id}`, { method: "DELETE" });
    setLeads((l) => l.filter((x) => x.id !== id));
  }

  // Group-wise, not subject-wise — matches how registration itself works
  // (one flat fee per group, no per-subject selection anywhere in this flow).
  const biologyCount = leads.filter((l) => l.studyGroup === "Biology").length;
  const csCount = leads.filter((l) => l.studyGroup === "Computer Science").length;
  const filtered = groupFilter === "all" ? leads : leads.filter((l) => l.studyGroup === groupFilter);

  return (
    <section className="section">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>Punjab Board 9th Class Leads</h1>
          <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>
            {leads.length} registration{leads.length === 1 ? "" : "s"} — admissions team follows up with each parent over WhatsApp.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {([
            ["all", `All (${leads.length})`],
            ["Biology", `🧬 Biology group (${biologyCount})`],
            ["Computer Science", `💻 Computer Science group (${csCount})`],
          ] as const).map(([value, label]) => {
            const active = groupFilter === value;
            return (
              <button key={value} onClick={() => setGroupFilter(value)} style={{ padding: "7px 16px", borderRadius: 999, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", border: active ? "2px solid #ea580c" : "2px solid #e8eef6", background: active ? "#fff7ed" : "#fff", color: active ? "#c2410c" : "#6b7c93" }}>
                {label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="card"><p>Loading…</p></div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>📗</div>
            <p>No {groupFilter === "all" ? "" : `${groupFilter} group `}leads {groupFilter === "all" ? "yet" : "in this group"}.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Parent</th>
                    <th>WhatsApp</th>
                    <th>City</th>
                    <th>Group</th>
                    <th>Registered</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => {
                    const isExpanded = expandedId === l.id;
                    return (
                      <Fragment key={l.id}>
                        <tr>
                          <td style={{ fontWeight: 700, color: "#071b33" }}>{l.studentName}</td>
                          <td style={{ fontSize: ".85rem" }}>{l.parentName}</td>
                          <td style={{ fontSize: ".85rem" }}>{l.parentWhatsapp}</td>
                          <td style={{ fontSize: ".85rem" }}>{l.city}</td>
                          <td>
                            <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 800, background: l.studyGroup === "Biology" ? "#f0fdf4" : l.studyGroup === "Computer Science" ? "#eff6ff" : "#f3f4f6", color: l.studyGroup === "Biology" ? "#15803d" : l.studyGroup === "Computer Science" ? "#155eef" : "#6b7c93" }}>
                              {l.studyGroup}
                            </span>
                          </td>
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
                            <td colSpan={8} style={{ background: "#f8fafc", padding: "16px 20px", whiteSpace: "normal" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px 28px" }}>
                                <div>
                                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Punjab Board</div>
                                  <div style={{ fontWeight: 700, color: "#071b33" }}>{l.punjabBoard}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>School</div>
                                  <div style={{ fontWeight: 700, color: "#071b33" }}>{l.schoolName || "—"}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Teaching medium</div>
                                  <div style={{ fontWeight: 700, color: "#071b33" }}>{l.teachingMedium}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Preferred class time</div>
                                  <div style={{ fontWeight: 700, color: "#071b33" }}>{l.preferredClassTime}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Device available</div>
                                  <div style={{ fontWeight: 700, color: "#071b33" }}>{l.deviceAvailable || "—"}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>How they heard about us</div>
                                  <div style={{ fontWeight: 700, color: "#071b33" }}>{l.howHeard || "—"}</div>
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
