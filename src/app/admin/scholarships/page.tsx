"use client";
import { Fragment, useEffect, useState } from "react";
import Link from "next/link";

interface Application {
  id: string;
  program: "sat" | "o-level";
  student_user_id: string | null;
  student_name: string;
  student_email: string | null;
  age: string;
  city: string;
  school: string | null;
  grade: string;
  subjects_required: string | null;
  exam_session: string;
  parent_name: string;
  parent_whatsapp: string;
  parent_email: string;
  parent_occupation: string | null;
  income_range: string;
  financial_explanation: string;
  motivation: string;
  agrees_attendance_work: boolean;
  agrees_assessments_support: boolean;
  parent_commitment_agreed: boolean;
  status: string;
  scholarship_percentage: number | null;
  admin_notes: string | null;
  created_at: string;
}

const STATUS_OPTIONS = ["new", "approved", "waitlisted", "not_selected"] as const;

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  approved: "Approved",
  waitlisted: "Waitlisted",
  not_selected: "Not Selected",
};

const STATUS_META: Record<string, { bg: string; color: string }> = {
  new:          { bg: "#eff6ff", color: "#155eef" },
  approved:     { bg: "#f0fdf4", color: "#15803d" },
  waitlisted:   { bg: "#fef3c7", color: "#92400e" },
  not_selected: { bg: "#f3f4f6", color: "#6b7c93" },
};

const INCOME_LABELS: Record<string, string> = {
  under_50k: "Under PKR 50,000",
  "50k_100k": "PKR 50,000–100,000",
  "100k_150k": "PKR 100,001–150,000",
  "150k_250k": "PKR 150,001–250,000",
  above_250k: "Above PKR 250,000",
  prefer_not_to_say: "Prefer to discuss privately",
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminScholarships() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [draftStatus, setDraftStatus] = useState<Record<string, string>>({});
  const [draftPct, setDraftPct] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [draftAccountName, setDraftAccountName] = useState<Record<string, string>>({});
  const [draftAccountEmail, setDraftAccountEmail] = useState<Record<string, string>>({});
  const [creatingAccount, setCreatingAccount] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/scholarships")
      .then(r => r.json())
      .then(d => setApps(d.applications ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function save(id: string) {
    const status = draftStatus[id];
    const pctRaw = draftPct[id];
    const scholarshipPercentage = pctRaw?.trim() ? Number(pctRaw) : null;
    setSaving(id);
    const r = await fetch(`/api/admin/scholarships/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, scholarshipPercentage }),
    });
    const d = await r.json();
    if (r.ok) {
      setApps(a => a.map(x => x.id === id ? d.application : x));
    } else {
      alert(d.error ?? "Failed to save");
    }
    setSaving(null);
  }

  async function createAccount(id: string, app: Application) {
    const name = (draftAccountName[id] ?? app.student_name).trim();
    const email = (draftAccountEmail[id] ?? app.student_email ?? "").trim();
    if (!name || !email) { alert("Name and email are required."); return; }
    setCreatingAccount(id);
    const r = await fetch(`/api/admin/scholarships/${id}/create-account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const d = await r.json();
    if (r.ok) {
      setApps(a => a.map(x => x.id === id ? { ...x, student_user_id: d.studentUserId } : x));
    } else {
      alert(d.error ?? "Failed to create account");
    }
    setCreatingAccount(null);
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete the scholarship application for "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/scholarships/${id}`, { method: "DELETE" });
    setApps(a => a.filter(x => x.id !== id));
  }

  const filtered = statusFilter === "all" ? apps : apps.filter(a => a.status === statusFilter);
  const newCount = apps.filter(a => a.status === "new").length;

  return (
    <section className="section">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>Opportunity Scholarship Applications</h1>
          <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>
            {newCount > 0 ? `${newCount} new application${newCount > 1 ? "s" : ""} awaiting review` : "No new applications"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <button onClick={() => setStatusFilter("all")} style={{ padding: "7px 16px", borderRadius: 999, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", border: statusFilter === "all" ? "2px solid #155eef" : "2px solid #e8eef6", background: statusFilter === "all" ? "#eff6ff" : "#fff", color: statusFilter === "all" ? "#155eef" : "#6b7c93" }}>
            All ({apps.length})
          </button>
          {STATUS_OPTIONS.map(s => {
            const count = apps.filter(a => a.status === s).length;
            if (count === 0 && statusFilter !== s) return null;
            const active = statusFilter === s;
            const meta = STATUS_META[s];
            return (
              <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "7px 16px", borderRadius: 999, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", border: active ? `2px solid ${meta.color}` : "2px solid #e8eef6", background: active ? meta.bg : "#fff", color: active ? meta.color : "#6b7c93" }}>
                {STATUS_LABELS[s]} ({count})
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="card"><p>Loading…</p></div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48 }}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>🎓</div>
            <p style={{ color: "#6b7c93" }}>No applications {statusFilter !== "all" ? "in this status" : "yet"}.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Program</th>
                    <th>City</th>
                    <th>Applied</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => {
                    const isExpanded = expandedId === a.id;
                    const meta = STATUS_META[a.status];
                    return (
                      <Fragment key={a.id}>
                        <tr>
                          <td style={{ fontWeight: 700, color: "#071b33" }}>{a.student_name}</td>
                          <td style={{ fontSize: ".83rem" }}>{a.program === "o-level" ? "O Level" : "SAT"}</td>
                          <td style={{ fontSize: ".83rem" }}>{a.city}</td>
                          <td style={{ fontSize: ".83rem", whiteSpace: "nowrap" }}>{fmtDate(a.created_at)}</td>
                          <td>
                            <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 800, background: meta.bg, color: meta.color }}>
                              {STATUS_LABELS[a.status]}
                              {a.scholarship_percentage != null ? ` · ${a.scholarship_percentage}%` : ""}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : a.id)}
                              style={{ padding: "5px 12px", borderRadius: 7, background: isExpanded ? "#eff6ff" : "#f1f5f9", border: "none", color: isExpanded ? "#155eef" : "#6b7c93", fontWeight: 700, fontSize: ".78rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                              {isExpanded ? "Hide details" : "View details"}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} style={{ background: "#f8fafc", padding: "20px 22px" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px 32px", marginBottom: 20 }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 2 }}>Student</div>
                                  <div style={{ fontWeight: 700, color: "#071b33" }}>{a.student_name} · Age {a.age} · Grade {a.grade}</div>
                                  {a.student_email && <div style={{ color: "#6b7c93", fontSize: ".85rem" }}>{a.student_email}</div>}
                                  <div style={{ color: "#6b7c93", fontSize: ".85rem" }}>{a.school || "School not given"} · {a.city}</div>
                                  <div style={{ color: "#6b7c93", fontSize: ".85rem" }}>Exam session: {a.exam_session}{a.subjects_required ? ` · Subjects: ${a.subjects_required}` : ""}</div>
                                  <div style={{ fontSize: ".82rem", fontWeight: 700, color: a.student_user_id ? "#15803d" : "#a0aec0", marginTop: 2 }}>
                                    {a.student_user_id ? "✓ Account created" : "No account yet"}
                                  </div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 2 }}>Parent / Guardian</div>
                                  <div style={{ fontWeight: 700, color: "#071b33" }}>{a.parent_name}</div>
                                  <div style={{ color: "#6b7c93", fontSize: ".85rem" }}>{a.parent_email} · {a.parent_whatsapp}</div>
                                  <div style={{ color: "#6b7c93", fontSize: ".85rem" }}>{a.parent_occupation || "Occupation not given"}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Household income</div>
                                  <div style={{ fontWeight: 700, color: "#071b33" }}>{INCOME_LABELS[a.income_range] ?? a.income_range}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Commitments confirmed</div>
                                  <div style={{ color: "#15803d", fontSize: ".85rem" }}>
                                    {a.agrees_attendance_work ? "✓" : "✗"} 90% attendance / work &nbsp;
                                    {a.agrees_assessments_support ? "✓" : "✗"} assessments / support &nbsp;
                                    {a.parent_commitment_agreed ? "✓" : "✗"} parent commitment
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 20 }}>
                                <div>
                                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Why tuition is difficult</div>
                                  <div style={{ color: "#071b33", fontSize: ".88rem", lineHeight: 1.6, background: "#fff", padding: "10px 14px", borderRadius: 8, border: "1px solid #e8eef6" }}>{a.financial_explanation}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Student&apos;s motivation</div>
                                  <div style={{ color: "#071b33", fontSize: ".88rem", lineHeight: 1.6, background: "#fff", padding: "10px 14px", borderRadius: 8, border: "1px solid #e8eef6" }}>{a.motivation}</div>
                                </div>
                              </div>

                              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", background: "#fff", padding: "14px 16px", borderRadius: 10, border: "1.5px solid #e8eef6" }}>
                                <div className="field" style={{ minWidth: 200 }}>
                                  <label>Status</label>
                                  <select
                                    value={draftStatus[a.id] ?? a.status}
                                    onChange={e => {
                                      const value = e.target.value;
                                      setDraftStatus(d => ({ ...d, [a.id]: value }));
                                      // Scholarships default to 100% — this founding
                                      // cohort's public emphasis — so approving doesn't
                                      // require typing a number every time. Still
                                      // editable below for a future partial scholarship.
                                      if (value === "approved" && a.scholarship_percentage == null) {
                                        setDraftPct(d => ({ ...d, [a.id]: "100" }));
                                      }
                                    }}
                                  >
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                                  </select>
                                </div>
                                <div className="field" style={{ width: 160 }}>
                                  <label>Scholarship %</label>
                                  <input
                                    type="number" min={0} max={100}
                                    value={draftPct[a.id] ?? (a.scholarship_percentage ?? "")}
                                    onChange={e => setDraftPct(d => ({ ...d, [a.id]: e.target.value }))}
                                    placeholder="e.g. 100"
                                  />
                                </div>
                                <button
                                  onClick={() => save(a.id)}
                                  disabled={saving === a.id}
                                  className="btn btn-primary"
                                  style={{ minHeight: 40, padding: "0 18px" }}>
                                  {saving === a.id ? "Saving…" : "Save"}
                                </button>
                                <button
                                  onClick={() => remove(a.id, a.student_name)}
                                  style={{ minHeight: 40, padding: "0 16px", borderRadius: 8, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".82rem", cursor: "pointer" }}>
                                  Delete
                                </button>
                              </div>

                              {!a.student_user_id && a.status === "approved" && (
                                <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", background: "#f0fdf4", padding: "14px 16px", borderRadius: 10, border: "1.5px solid #86efac", marginTop: 12 }}>
                                  <div style={{ width: "100%", fontWeight: 800, color: "#15803d", fontSize: ".85rem", marginBottom: 2 }}>Create student account</div>
                                  <div className="field" style={{ minWidth: 200 }}>
                                    <label>Name</label>
                                    <input
                                      value={draftAccountName[a.id] ?? a.student_name}
                                      onChange={e => setDraftAccountName(d => ({ ...d, [a.id]: e.target.value }))}
                                    />
                                  </div>
                                  <div className="field" style={{ minWidth: 240 }}>
                                    <label>Email</label>
                                    <input
                                      type="email"
                                      value={draftAccountEmail[a.id] ?? a.student_email ?? ""}
                                      onChange={e => setDraftAccountEmail(d => ({ ...d, [a.id]: e.target.value }))}
                                      placeholder={a.student_email ? undefined : "This older application has no student email on file"}
                                    />
                                  </div>
                                  <button
                                    onClick={() => createAccount(a.id, a)}
                                    disabled={creatingAccount === a.id}
                                    className="btn btn-primary"
                                    style={{ minHeight: 40, padding: "0 18px" }}>
                                    {creatingAccount === a.id ? "Creating…" : "Create account →"}
                                  </button>
                                </div>
                              )}
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
