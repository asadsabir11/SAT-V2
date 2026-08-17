"use client";
import { useEffect, useState } from "react";
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
  const [search, setSearch] = useState("");
  const [grantingId, setGrantingId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

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

  const filtered = rows.filter(r => {
    if (filter !== "all" && r.status !== filter) return false;
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
                    <th>Payment details</th>
                    <th>Approved</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => {
                    const meta = STATUS_META[r.status];
                    const subjMeta = SUBJECT_META[r.subject] ?? { label: r.subject, icon: "📘" };
                    const rowKey = `${r.email}:${r.subject}`;
                    const isGranting = grantingId === r.id;
                    return (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 700, color: "#071b33" }}>{r.name || "—"}</td>
                        <td style={{ fontSize: ".83rem" }}>{r.email}</td>
                        <td style={{ fontSize: ".83rem" }}>{subjMeta.icon} {subjMeta.label}</td>
                        <td>
                          <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 800, background: meta.bg, color: meta.color }}>
                            {meta.label}
                          </span>
                        </td>
                        <td style={{ fontSize: ".83rem", whiteSpace: "nowrap" }}>{fmtDate(r.payment_requested_at)}</td>
                        <td style={{ fontSize: ".8rem" }}>
                          {r.payment_method ? (
                            <div style={{ display: "grid", gap: 2 }}>
                              <span style={{ fontWeight: 700, color: "#071b33" }}>
                                {PAYMENT_METHOD_LABELS[r.payment_method] ?? r.payment_method} · PKR {r.amount_paid ? Number(r.amount_paid).toLocaleString() : "—"}
                              </span>
                              <span style={{ color: "#6b7c93" }}>Ref: {r.transaction_reference || "—"}</span>
                              <span style={{ color: "#6b7c93" }}>{fmtDate(r.payment_date)} · {r.payer_account_name || "—"}</span>
                              {r.payment_screenshot_url && (
                                <a href={`/api/admin/o-level-access/${r.id}/screenshot`} target="_blank" rel="noreferrer" style={{ color: "#155eef", fontWeight: 700 }}>
                                  View screenshot →
                                </a>
                              )}
                            </div>
                          ) : "—"}
                        </td>
                        <td style={{ fontSize: ".83rem", whiteSpace: "nowrap" }}>{fmtDate(r.approved_at)}</td>
                        <td style={{ fontSize: ".83rem", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.notes ?? ""}>{r.notes || "—"}</td>
                        <td>
                          {r.status !== "unlocked" ? (
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
