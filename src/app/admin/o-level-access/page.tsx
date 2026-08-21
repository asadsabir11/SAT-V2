"use client";
import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { getOLevelSubjects } from "@/lib/academy/data";

interface AccessRow {
  id: string;
  email: string;
  name: string | null;
  subject: string;
  status: "free" | "pending" | "unlocked";
  payment_requested_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  notes: string | null;
  created_at: string;
  payment_method: string | null;
  amount_paid: string | null;
  transaction_reference: string | null;
  payment_date: string | null;
  payer_account_name: string | null;
  payment_screenshot_url: string | null;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  jazzcash: "JazzCash",
  easypaisa: "Easypaisa",
  bank_transfer: "Bank Transfer",
};

type Filter = "all" | "pending" | "unlocked";
type SubjectFilter = "all" | "mathematics" | "english-language" | "both";

const SUBJECTS = getOLevelSubjects().map((s) => ({ slug: s.slug, name: s.name }));
const SUBJECT_META: Record<string, { label: string; icon: string }> = Object.fromEntries(
  SUBJECTS.map((s) => [s.slug, { label: s.name, icon: "📘" }])
);

const STATUS_META: Record<AccessRow["status"], { label: string; bg: string; color: string }> = {
  free:     { label: "Free",     bg: "#f3f4f6", color: "#6b7c93" },
  pending:  { label: "Pending",  bg: "#fef3c7", color: "#92400e" },
  unlocked: { label: "Unlocked", bg: "#d1fae5", color: "#065f46" },
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminOLevelAccess() {
  const [rows, setRows] = useState<AccessRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>("all");
  const [search, setSearch] = useState("");
  const [grantingId, setGrantingId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [showGrantForm, setShowGrantForm] = useState(false);
  const [grantEmail, setGrantEmail] = useState("");
  const [grantSubject, setGrantSubject] = useState(SUBJECTS[0].slug);
  const [grantNotes, setGrantNotes] = useState("");
  const [grantSubmitting, setGrantSubmitting] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/admin/o-level-access")
      .then(r => r.json())
      .then(d => setRows(d.requests ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function grant(email: string, subject: string) {
    setBusy(`${email}:${subject}`);
    await fetch("/api/admin/o-level-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "grant", email, subject, notes: noteInput.trim() || undefined }),
    });
    setGrantingId(null);
    setNoteInput("");
    setBusy(null);
    load();
  }

  async function revoke(email: string, subject: string) {
    if (!confirm(`Revoke ${subject} access for ${email}?`)) return;
    setBusy(`${email}:${subject}`);
    await fetch("/api/admin/o-level-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "revoke", email, subject }),
    });
    setBusy(null);
    load();
  }

  async function submitManualGrant() {
    if (!grantEmail.trim()) return;
    setGrantSubmitting(true);
    await fetch("/api/admin/o-level-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "grant", email: grantEmail.trim(), subject: grantSubject, notes: grantNotes.trim() || undefined }),
    });
    setGrantSubmitting(false);
    setShowGrantForm(false);
    setGrantEmail("");
    setGrantNotes("");
    load();
  }

  // Students currently holding BOTH paid subjects unlocked at once — used by
  // the "Both" subfilter, a view-only list so admin can see at a glance who's
  // paying for the 2-subject bundle (relevant when one gets dropped later and
  // the other's bundle price needs to be re-evaluated).
  const unlockedSubjectsByEmail: Record<string, Set<string>> = {};
  rows.forEach(r => {
    if (r.status !== "unlocked") return;
    if (r.subject !== "mathematics" && r.subject !== "english-language") return;
    (unlockedSubjectsByEmail[r.email] ??= new Set()).add(r.subject);
  });
  const bothEmails = new Set(
    Object.entries(unlockedSubjectsByEmail)
      .filter(([, subjects]) => subjects.has("mathematics") && subjects.has("english-language"))
      .map(([email]) => email)
  );

  const filtered = rows.filter(r => {
    if (filter !== "all" && r.status !== filter) return false;
    if (subjectFilter === "mathematics" && r.subject !== "mathematics") return false;
    if (subjectFilter === "english-language" && r.subject !== "english-language") return false;
    if (subjectFilter === "both") {
      if (r.subject !== "mathematics" && r.subject !== "english-language") return false;
      if (!bothEmails.has(r.email)) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return r.email.toLowerCase().includes(q) || (r.name ?? "").toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    all: rows.length,
    pending: rows.filter(r => r.status === "pending").length,
    unlocked: rows.filter(r => r.status === "unlocked").length,
  };

  const subjectCounts = {
    mathematics: rows.filter(r => r.subject === "mathematics").length,
    "english-language": rows.filter(r => r.subject === "english-language").length,
    both: bothEmails.size,
  };

  return (
    <section className="section">
      <div className="container">

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>O Level Subject Access</h1>
            <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>
              {counts.pending > 0
                ? `${counts.pending} request${counts.pending > 1 ? "s" : ""} waiting for approval`
                : "No pending approvals"}
            </p>
          </div>
          <button onClick={() => setShowGrantForm(s => !s)} className="btn btn-primary" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem" }}>
            {showGrantForm ? "Cancel" : "+ Grant subject manually"}
          </button>
        </div>

        {/* Manual grant form */}
        {showGrantForm && (
          <div className="card" style={{ marginBottom: 24, background: "#f8fafc", border: "1.5px solid #dce5ef" }}>
            <h3 style={{ margin: "0 0 14px", color: "#071b33" }}>Grant access without a request</h3>
            <div className="form-grid" style={{ marginBottom: 14 }}>
              <div className="field">
                <label>Student email *</label>
                <input value={grantEmail} onChange={e => setGrantEmail(e.target.value)} placeholder="student@gmail.com" />
              </div>
              <div className="field">
                <label>Subject *</label>
                <select value={grantSubject} onChange={e => setGrantSubject(e.target.value)}>
                  {SUBJECTS.map(s => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Notes (optional)</label>
                <input value={grantNotes} onChange={e => setGrantNotes(e.target.value)} placeholder="Txn ref" />
              </div>
            </div>
            <button className="btn btn-primary" onClick={submitManualGrant} disabled={grantSubmitting || !grantEmail.trim()}>
              {grantSubmitting ? "Granting…" : "Grant access"}
            </button>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {(["all", "pending", "unlocked"] as Filter[]).map(f => {
            const active = filter === f;
            const label = f === "all" ? `All (${counts.all})` : f === "pending" ? `⏳ Pending (${counts.pending})` : `✓ Unlocked (${counts.unlocked})`;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 18px", borderRadius: 10, fontWeight: 700, fontSize: ".85rem", cursor: "pointer", border: active ? "2px solid #155eef" : "2px solid #e8eef6", background: active ? "#eff6ff" : "#f8fafc", color: active ? "#155eef" : "#6b7c93" }}>
                {label}
              </button>
            );
          })}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email…"
            style={{ flex: 1, minWidth: 200, padding: "8px 14px", borderRadius: 10, border: "2px solid #e8eef6", fontSize: ".88rem", outline: "none" }}
          />
        </div>

        {/* Subject subfilter */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: ".78rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".04em" }}>Subject:</span>
          {([
            ["all", "All subjects"],
            ["mathematics", `📐 Mathematics (${subjectCounts.mathematics})`],
            ["english-language", `📖 English Language (${subjectCounts["english-language"]})`],
            ["both", `🎯 Both (${subjectCounts.both})`],
          ] as [SubjectFilter, string][]).map(([f, label]) => {
            const active = subjectFilter === f;
            return (
              <button key={f} onClick={() => setSubjectFilter(f)} style={{ padding: "7px 16px", borderRadius: 999, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", border: active ? "2px solid #7c3aed" : "2px solid #e8eef6", background: active ? "#f5f3ff" : "#f8fafc", color: active ? "#7c3aed" : "#6b7c93" }}>
                {label}
              </button>
            );
          })}
          {subjectFilter === "both" && (
            <span style={{ fontSize: ".78rem", color: "#7c3aed", fontWeight: 600 }}>
              View only — students holding both paid subjects at once. No actions here; use the Mathematics/English tabs to revoke.
            </span>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="card"><p>Loading…</p></div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48 }}>
            <p style={{ color: "#6b7c93" }}>{search || filter !== "all" ? "No requests match your filter." : "No O Level access requests yet."}</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Requested</th>
                    <th></th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => {
                    const meta = STATUS_META[r.status];
                    const subjMeta = SUBJECT_META[r.subject] ?? { label: r.subject, icon: "📘" };
                    const rowKey = `${r.email}:${r.subject}`;
                    const isGranting = grantingId === r.id;
                    const isExpanded = expandedId === r.id;
                    return (
                      <Fragment key={r.id}>
                      <tr>
                        <td style={{ fontWeight: 700, color: "#071b33" }}>{r.name || "—"}</td>
                        <td style={{ fontSize: ".83rem" }}>{r.email}</td>
                        <td style={{ fontSize: ".83rem" }}>{subjMeta.icon} {subjMeta.label}</td>
                        <td>
                          <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 800, background: meta.bg, color: meta.color }}>
                            {meta.label}
                          </span>
                        </td>
                        <td style={{ fontSize: ".83rem", whiteSpace: "nowrap" }}>{fmtDate(r.payment_requested_at)}</td>
                        <td>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : r.id)}
                            style={{ padding: "5px 12px", borderRadius: 7, background: isExpanded ? "#eff6ff" : "#f1f5f9", border: "none", color: isExpanded ? "#155eef" : "#6b7c93", fontWeight: 700, fontSize: ".78rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                            {isExpanded ? "Hide details" : "View details"}
                          </button>
                        </td>
                        <td>
                          {subjectFilter === "both" ? (
                            <span style={{ color: "#a0aec0", fontSize: ".78rem" }}>—</span>
                          ) : r.status !== "unlocked" ? (
                            isGranting ? (
                              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <input
                                  value={noteInput}
                                  onChange={e => setNoteInput(e.target.value)}
                                  placeholder="Txn ref (optional)"
                                  style={{ width: 130, padding: "4px 8px", borderRadius: 6, border: "1.5px solid #e8eef6", fontSize: ".78rem" }}
                                />
                                <button
                                  onClick={() => grant(r.email, r.subject)}
                                  disabled={busy === rowKey}
                                  style={{ padding: "4px 12px", borderRadius: 7, background: "#22c55e", color: "#fff", border: "none", fontWeight: 800, fontSize: ".75rem", cursor: "pointer" }}>
                                  {busy === rowKey ? "…" : "Confirm"}
                                </button>
                                <button onClick={() => { setGrantingId(null); setNoteInput(""); }} style={{ padding: "4px 10px", borderRadius: 7, background: "#f1f5f9", border: "none", fontWeight: 700, fontSize: ".75rem", cursor: "pointer", color: "#6b7c93" }}>
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setGrantingId(r.id); setNoteInput(""); }}
                                style={{ padding: "5px 14px", borderRadius: 7, background: "#22c55e", color: "#fff", border: "none", fontWeight: 800, fontSize: ".78rem", cursor: "pointer" }}>
                                Grant Access
                              </button>
                            )
                          ) : (
                            <button
                              onClick={() => revoke(r.email, r.subject)}
                              disabled={busy === rowKey}
                              style={{ padding: "5px 14px", borderRadius: 7, background: "#fee2e2", color: "#991b1b", border: "none", fontWeight: 800, fontSize: ".78rem", cursor: "pointer" }}>
                              {busy === rowKey ? "…" : "Revoke"}
                            </button>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} style={{ background: "#f8fafc", padding: "18px 20px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px 32px" }}>
                              <div>
                                <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Payment method</div>
                                <div style={{ fontWeight: 700, color: "#071b33" }}>{r.payment_method ? (PAYMENT_METHOD_LABELS[r.payment_method] ?? r.payment_method) : "—"}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Amount paid</div>
                                <div style={{ fontWeight: 700, color: "#071b33" }}>{r.amount_paid ? `PKR ${Number(r.amount_paid).toLocaleString()}` : "—"}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Transaction reference</div>
                                <div style={{ fontWeight: 700, color: "#071b33" }}>{r.transaction_reference || "—"}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Payment date</div>
                                <div style={{ fontWeight: 700, color: "#071b33" }}>{fmtDate(r.payment_date)}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Name on sending account</div>
                                <div style={{ fontWeight: 700, color: "#071b33" }}>{r.payer_account_name || "—"}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Screenshot</div>
                                {r.payment_screenshot_url ? (
                                  <a href={r.payment_screenshot_url} target="_blank" rel="noreferrer" style={{ color: "#155eef", fontWeight: 700 }}>
                                    View screenshot →
                                  </a>
                                ) : (
                                  <div style={{ color: "#6b7c93" }}>—</div>
                                )}
                              </div>
                              <div>
                                <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Approved</div>
                                <div style={{ fontWeight: 700, color: "#071b33" }}>{fmtDate(r.approved_at)}{r.approved_by ? ` · ${r.approved_by}` : ""}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Notes</div>
                                <div style={{ fontWeight: 700, color: "#071b33" }}>{r.notes || "—"}</div>
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
