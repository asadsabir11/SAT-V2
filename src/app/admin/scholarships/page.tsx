"use client";
import { Fragment, useEffect, useState } from "react";
import Link from "next/link";

interface Application {
  id: string;
  program: "sat" | "o-level";
  student_user_id: string | null;
  student_name: string;
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

const STATUS_OPTIONS = [
  "new", "under_review", "shortlisted", "parent_interview",
  "approved_full", "approved_partial", "waitlisted", "not_selected",
  "active_scholar", "probation", "completed",
] as const;

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  parent_interview: "Parent Interview",
  approved_full: "Approved — 100%",
  approved_partial: "Approved — Partial",
  waitlisted: "Waitlisted",
  not_selected: "Not Selected",
  active_scholar: "Active Scholar",
  probation: "Scholarship Probation",
  completed: "Completed",
};

const STATUS_META: Record<string, { bg: string; color: string }> = {
  new:              { bg: "#eff6ff", color: "#155eef" },
  under_review:     { bg: "#fffbeb", color: "#92400e" },
  shortlisted:      { bg: "#f5f3ff", color: "#7c3aed" },
  parent_interview: { bg: "#f5f3ff", color: "#7c3aed" },
  approved_full:    { bg: "#f0fdf4", color: "#15803d" },
  approved_partial: { bg: "#f0fdf4", color: "#15803d" },
  waitlisted:       { bg: "#fef3c7", color: "#92400e" },
  not_selected:     { bg: "#f3f4f6", color: "#6b7c93" },
  active_scholar:   { bg: "#d1fae5", color: "#065f46" },
  probation:        { bg: "#fee2e2", color: "#991b1b" },
  completed:        { bg: "#f3f4f6", color: "#374151" },
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
  const [draftAccountEmail, setDraftAccountEmail] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/scholarships")
      .then(r => r.json())
      .then(d => setApps(d.applications ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function save(id: string, app: Application) {
    const status = draftStatus[id];
    const pctRaw = draftPct[id];
    const scholarshipPercentage = pctRaw?.trim() ? Number(pctRaw) : null;
    const accountEmail = (draftAccountEmail[id] ?? app.parent_email).trim();
    setSaving(id);
    const r = await fetch(`/api/admin/scholarships/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, scholarshipPercentage, accountEmail }),
    });
    const d = await r.json();
    if (r.ok) {
      setApps(a => a.map(x => x.id === id ? d.application : x));
    } else {
      alert(d.error ?? "Failed to save");
    }
    setSaving(null);
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
                                <div>
                                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Student</div>
                                  <div style={{ fontWeight: 700, color: "#071b33" }}>{a.student_name} · Age {a.age} · Grade {a.grade}</div>
                                  <div style={{ fontSize: ".85rem", fontWeight: 700, color: a.student_user_id ? "#15803d" : "#a0aec0" }}>
                                    {a.student_user_id ? "✓ Account created" : "No account yet — created automatically when you approve below"}
                                  </div>
                                  <div style={{ color: "#6b7c93", fontSize: ".85rem" }}>{a.school || "School not given"} · {a.city}</div>
                                  <div style={{ color: "#6b7c93", fontSize: ".85rem" }}>Exam session: {a.exam_session}{a.subjects_required ? ` · Subjects: ${a.subjects_required}` : ""}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Parent / Guardian</div>
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
                                    onChange={e => setDraftStatus(d => ({ ...d, [a.id]: e.target.value }))}
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
                                {!a.student_user_id && (
                                  <div className="field" style={{ minWidth: 240 }}>
                                    <label>Account email (used on approval)</label>
                                    <input
                                      type="email"
                                      value={draftAccountEmail[a.id] ?? a.parent_email}
                                      onChange={e => setDraftAccountEmail(d => ({ ...d, [a.id]: e.target.value }))}
                                      placeholder="Defaults to parent email"
                                    />
                                  </div>
                                )}
                                <button
                                  onClick={() => save(a.id, a)}
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
