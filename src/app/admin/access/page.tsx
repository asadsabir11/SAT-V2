"use client";
import { Fragment, useEffect, useState } from "react";
import Link from "next/link";

interface Student {
  id: string;
  email: string;
  name: string;
  created_at: string;
  access_level: "free" | "pending" | "unlocked";
  payment_requested_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  notes: string | null;
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
  stripe: "Stripe (Card)",
};

type Filter = "all" | "free" | "pending" | "unlocked";

const STATUS_META: Record<Student["access_level"], { label: string; bg: string; color: string }> = {
  free:     { label: "Free",     bg: "#f3f4f6", color: "#6b7c93" },
  pending:  { label: "Pending",  bg: "#fef3c7", color: "#92400e" },
  unlocked: { label: "Unlocked", bg: "#d1fae5", color: "#065f46" },
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminAccess() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [grantingId, setGrantingId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/access")
      .then(r => r.json())
      .then(d => setStudents(d.students ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function grant(email: string) {
    setBusy(email);
    await fetch("/api/admin/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "grant", email, notes: noteInput.trim() || undefined }),
    });
    setStudents(ss => ss.map(s => s.email === email ? { ...s, access_level: "unlocked", approved_at: new Date().toISOString(), notes: noteInput.trim() || s.notes } : s));
    setGrantingId(null);
    setNoteInput("");
    setBusy(null);
  }

  async function revoke(email: string) {
    if (!confirm(`Revoke access for ${email}? They will lose all paid content access.`)) return;
    setBusy(email);
    await fetch("/api/admin/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "revoke", email }),
    });
    setStudents(ss => ss.map(s => s.email === email ? { ...s, access_level: "free", approved_at: null, approved_by: null } : s));
    setBusy(null);
  }

  const filtered = students.filter(s => {
    if (filter !== "all" && s.access_level !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.email.toLowerCase().includes(q) || (s.name ?? "").toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    all: students.length,
    pending: students.filter(s => s.access_level === "pending").length,
    free: students.filter(s => s.access_level === "free").length,
    unlocked: students.filter(s => s.access_level === "unlocked").length,
  };

  return (
    <section className="section">
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>Access Requests</h1>
          <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>
            {counts.pending > 0
              ? `${counts.pending} student${counts.pending > 1 ? "s" : ""} waiting for approval`
              : "No pending approvals"}
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {(["all", "pending", "free", "unlocked"] as Filter[]).map(f => {
            const active = filter === f;
            const label = f === "all" ? `All (${counts.all})` : f === "pending" ? `⏳ Pending (${counts.pending})` : f === "unlocked" ? `✓ Unlocked (${counts.unlocked})` : `Free (${counts.free})`;
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
            <p style={{ color: "#6b7c93" }}>{search || filter !== "all" ? "No students match your filter." : "No students registered yet."}</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Signed up</th>
                    <th>Status</th>
                    <th>Payment sent</th>
                    <th>Approved</th>
                    <th></th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => {
                    const meta = STATUS_META[s.access_level];
                    const isGranting = grantingId === s.id;
                    const isExpanded = expandedId === s.id;
                    return (
                      <Fragment key={s.id}>
                      <tr>
                        <td style={{ fontWeight: 700, color: "#071b33" }}>{s.name || "—"}</td>
                        <td style={{ fontSize: ".83rem" }}>{s.email}</td>
                        <td style={{ fontSize: ".83rem", whiteSpace: "nowrap" }}>{fmtDate(s.created_at)}</td>
                        <td>
                          <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 800, background: meta.bg, color: meta.color }}>
                            {meta.label}
                          </span>
                        </td>
                        <td style={{ fontSize: ".83rem", whiteSpace: "nowrap" }}>{fmtDate(s.payment_requested_at)}</td>
                        <td style={{ fontSize: ".83rem", whiteSpace: "nowrap" }}>{fmtDate(s.approved_at)}</td>
                        <td>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : s.id)}
                            style={{ padding: "5px 12px", borderRadius: 7, background: isExpanded ? "#eff6ff" : "#f1f5f9", border: "none", color: isExpanded ? "#155eef" : "#6b7c93", fontWeight: 700, fontSize: ".78rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                            {isExpanded ? "Hide details" : "View details"}
                          </button>
                        </td>
                        <td>
                          {s.access_level !== "unlocked" ? (
                            isGranting ? (
                              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <input
                                  value={noteInput}
                                  onChange={e => setNoteInput(e.target.value)}
                                  placeholder="Txn ref (optional)"
                                  style={{ width: 130, padding: "4px 8px", borderRadius: 6, border: "1.5px solid #e8eef6", fontSize: ".78rem" }}
                                />
                                <button
                                  onClick={() => grant(s.email)}
                                  disabled={busy === s.email}
                                  style={{ padding: "4px 12px", borderRadius: 7, background: "#22c55e", color: "#fff", border: "none", fontWeight: 800, fontSize: ".75rem", cursor: "pointer" }}>
                                  {busy === s.email ? "…" : "Confirm"}
                                </button>
                                <button onClick={() => { setGrantingId(null); setNoteInput(""); }} style={{ padding: "4px 10px", borderRadius: 7, background: "#f1f5f9", border: "none", fontWeight: 700, fontSize: ".75rem", cursor: "pointer", color: "#6b7c93" }}>
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setGrantingId(s.id); setNoteInput(""); }}
                                style={{ padding: "5px 14px", borderRadius: 7, background: "#22c55e", color: "#fff", border: "none", fontWeight: 800, fontSize: ".78rem", cursor: "pointer" }}>
                                Grant Access
                              </button>
                            )
                          ) : (
                            <button
                              onClick={() => revoke(s.email)}
                              disabled={busy === s.email}
                              style={{ padding: "5px 14px", borderRadius: 7, background: "#fee2e2", color: "#991b1b", border: "none", fontWeight: 800, fontSize: ".78rem", cursor: "pointer" }}>
                              {busy === s.email ? "…" : "Revoke"}
                            </button>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} style={{ background: "#f8fafc", padding: "18px 20px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px 32px" }}>
                              <div>
                                <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Payment method</div>
                                <div style={{ fontWeight: 700, color: "#071b33" }}>{s.payment_method ? (PAYMENT_METHOD_LABELS[s.payment_method] ?? s.payment_method) : "—"}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Amount paid</div>
                                <div style={{ fontWeight: 700, color: "#071b33" }}>{s.amount_paid ? (s.payment_method === "stripe" ? Number(s.amount_paid).toLocaleString() : `PKR ${Number(s.amount_paid).toLocaleString()}`) : "—"}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Transaction reference</div>
                                <div style={{ fontWeight: 700, color: "#071b33" }}>{s.transaction_reference || "—"}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Payment date</div>
                                <div style={{ fontWeight: 700, color: "#071b33" }}>{fmtDate(s.payment_date)}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Name on sending account</div>
                                <div style={{ fontWeight: 700, color: "#071b33" }}>{s.payer_account_name || "—"}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Screenshot</div>
                                {s.payment_screenshot_url ? (
                                  <a href={s.payment_screenshot_url} target="_blank" rel="noreferrer" style={{ color: "#155eef", fontWeight: 700 }}>
                                    View screenshot →
                                  </a>
                                ) : (
                                  <div style={{ color: "#6b7c93" }}>—</div>
                                )}
                              </div>
                              <div>
                                <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Approved</div>
                                <div style={{ fontWeight: 700, color: "#071b33" }}>{fmtDate(s.approved_at)}{s.approved_by ? ` · ${s.approved_by}` : ""}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Notes</div>
                                <div style={{ fontWeight: 700, color: "#071b33" }}>{s.notes || "—"}</div>
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
