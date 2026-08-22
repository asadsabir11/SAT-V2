"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Challan {
  id: string;
  student_email: string;
  student_name: string | null;
  program: "sat" | "o-level";
  subject: string;
  period: string;
  amount_due: string;
  status: "unpaid" | "submitted" | "paid";
}

interface Submission {
  id: string;
  student_email: string;
  student_name: string;
  challan_ids: string;
  amount_paid: string;
  transaction_reference: string;
  payment_screenshot_url: string | null;
  status: "pending" | "verified" | "rejected";
  admin_notes: string | null;
  submitted_at: string;
}

const SUBJECT_LABELS: Record<string, string> = {
  "": "Full SAT Access",
  mathematics: "Mathematics",
  "english-language": "English Language",
  "computer-science": "Computer Science",
  islamiyat: "Islamiyat",
  "pakistan-studies": "Pakistan Studies",
};

const STATUS_META: Record<Challan["status"], { label: string; bg: string; color: string }> = {
  unpaid:    { label: "Unpaid",       bg: "#fee2e2", color: "#991b1b" },
  submitted: { label: "Under review", bg: "#fef3c7", color: "#92400e" },
  paid:      { label: "Paid",         bg: "#d1fae5", color: "#065f46" },
};

function fmtPeriod(period: string) {
  const [y, m] = period.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

type Tab = "submissions" | "challans";

export default function AdminFeesPage() {
  const [tab, setTab] = useState<Tab>("submissions");
  const [challans, setChallans] = useState<Challan[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState<Record<string, string>>({});
  const [challanFilter, setChallanFilter] = useState<"all" | Challan["status"]>("all");

  function load() {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/fees/challans").then(r => r.json()),
      fetch("/api/admin/fees/submissions").then(r => r.json()),
    ]).then(([c, s]) => {
      setChallans(c.challans ?? []);
      setSubmissions(s.submissions ?? []);
    }).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function generate() {
    setGenerating(true);
    setGenerateResult(null);
    const res = await fetch("/api/admin/fees/generate", { method: "POST" });
    const data = await res.json();
    setGenerating(false);
    if (res.ok) {
      setGenerateResult(`Generated ${data.created} challan${data.created === 1 ? "" : "s"} for ${fmtPeriod(data.period)} (${data.skipped} already existed).`);
      load();
    } else {
      setGenerateResult(data.error ?? "Something went wrong.");
    }
  }

  async function review(id: string, action: "verify" | "reject") {
    if (action === "reject" && !confirm("Reject this payment submission?")) return;
    setBusy(id);
    await fetch(`/api/admin/fees/submissions/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes: notesInput[id]?.trim() || undefined }),
    });
    setBusy(null);
    load();
  }

  const pendingSubmissions = submissions.filter(s => s.status === "pending");
  const filteredChallans = challans.filter(c => challanFilter === "all" || c.status === challanFilter);

  return (
    <section className="section">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>Fees</h1>
            <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>
              {pendingSubmissions.length > 0
                ? `${pendingSubmissions.length} payment${pendingSubmissions.length > 1 ? "s" : ""} waiting for verification`
                : "No pending payment submissions"}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <button onClick={generate} disabled={generating} className="btn btn-primary" style={{ minHeight: 40, padding: "0 20px", fontSize: ".88rem" }}>
              {generating ? "Generating…" : "Generate this month's challans"}
            </button>
            {generateResult && <p style={{ color: "#6b7c93", fontSize: ".8rem", margin: "8px 0 0", maxWidth: 280 }}>{generateResult}</p>}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <button onClick={() => setTab("submissions")} style={{ padding: "10px 22px", borderRadius: 10, fontWeight: 800, fontSize: ".9rem", cursor: "pointer", border: tab === "submissions" ? "2px solid #155eef" : "2px solid #e8eef6", background: tab === "submissions" ? "#eff6ff" : "#f8fafc", color: tab === "submissions" ? "#155eef" : "#6b7c93" }}>
            💳 Submissions to verify ({pendingSubmissions.length})
          </button>
          <button onClick={() => setTab("challans")} style={{ padding: "10px 22px", borderRadius: 10, fontWeight: 800, fontSize: ".9rem", cursor: "pointer", border: tab === "challans" ? "2px solid #155eef" : "2px solid #e8eef6", background: tab === "challans" ? "#eff6ff" : "#f8fafc", color: tab === "challans" ? "#155eef" : "#6b7c93" }}>
            📋 All Challans ({challans.length})
          </button>
        </div>

        {loading ? (
          <div className="card"><p>Loading…</p></div>
        ) : tab === "submissions" ? (
          submissions.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
              <p>No fee submissions yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {submissions.map(s => {
                const covers = s.challan_ids.split(",").filter(Boolean)
                  .map(id => challans.find(c => c.id === id))
                  .filter((c): c is Challan => !!c);
                const label = covers.length > 0
                  ? covers.map(c => `${fmtPeriod(c.period)} — ${SUBJECT_LABELS[c.subject] ?? c.subject}`).join(", ")
                  : "—";
                return (
                  <div key={s.id} className="card" style={{ padding: "18px 22px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 800, color: "#071b33" }}>{s.student_name}</p>
                        <p style={{ margin: "2px 0 0", color: "#6b7c93", fontSize: ".83rem" }}>{s.student_email}</p>
                      </div>
                      <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 800, background: s.status === "pending" ? "#fef3c7" : s.status === "verified" ? "#d1fae5" : "#fee2e2", color: s.status === "pending" ? "#92400e" : s.status === "verified" ? "#065f46" : "#991b1b", height: "fit-content" }}>
                        {s.status === "pending" ? "Pending" : s.status === "verified" ? "Verified" : "Rejected"}
                      </span>
                    </div>
                    <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px 24px" }}>
                      <div>
                        <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em" }}>Covers</div>
                        <div style={{ fontWeight: 700, color: "#071b33", fontSize: ".88rem" }}>{label}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em" }}>Amount paid</div>
                        <div style={{ fontWeight: 700, color: "#071b33" }}>PKR {Number(s.amount_paid).toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em" }}>Transaction ref</div>
                        <div style={{ fontWeight: 700, color: "#071b33" }}>{s.transaction_reference}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em" }}>Submitted</div>
                        <div style={{ fontWeight: 700, color: "#071b33" }}>{fmtDate(s.submitted_at)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".05em" }}>Screenshot</div>
                        {s.payment_screenshot_url ? (
                          <a href={s.payment_screenshot_url} target="_blank" rel="noreferrer" style={{ color: "#155eef", fontWeight: 700 }}>View →</a>
                        ) : (
                          <div style={{ color: "#6b7c93" }}>—</div>
                        )}
                      </div>
                    </div>
                    {s.status === "pending" ? (
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 14, flexWrap: "wrap" }}>
                        <input
                          value={notesInput[s.id] ?? ""}
                          onChange={e => setNotesInput(prev => ({ ...prev, [s.id]: e.target.value }))}
                          placeholder="Notes (optional)"
                          style={{ flex: 1, minWidth: 160, padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e8eef6", fontSize: ".82rem" }}
                        />
                        <button onClick={() => review(s.id, "verify")} disabled={busy === s.id} style={{ padding: "6px 16px", borderRadius: 8, background: "#22c55e", color: "#fff", border: "none", fontWeight: 800, fontSize: ".8rem", cursor: "pointer" }}>
                          {busy === s.id ? "…" : "Verify & Unlock"}
                        </button>
                        <button onClick={() => review(s.id, "reject")} disabled={busy === s.id} style={{ padding: "6px 16px", borderRadius: 8, background: "#fee2e2", color: "#991b1b", border: "none", fontWeight: 800, fontSize: ".8rem", cursor: "pointer" }}>
                          Reject
                        </button>
                      </div>
                    ) : s.admin_notes ? (
                      <p style={{ marginTop: 12, marginBottom: 0, color: "#6b7c93", fontSize: ".82rem" }}>Note: {s.admin_notes}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {(["all", "unpaid", "submitted", "paid"] as const).map(f => {
                const active = challanFilter === f;
                const count = f === "all" ? challans.length : challans.filter(c => c.status === f).length;
                return (
                  <button key={f} onClick={() => setChallanFilter(f)} style={{ padding: "7px 16px", borderRadius: 999, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", border: active ? "2px solid #155eef" : "2px solid #e8eef6", background: active ? "#eff6ff" : "#fff", color: active ? "#155eef" : "#6b7c93" }}>
                    {f === "all" ? "All" : STATUS_META[f].label} ({count})
                  </button>
                );
              })}
            </div>
            {filteredChallans.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
                <p>No challans match this filter.</p>
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Program</th>
                        <th>Item</th>
                        <th>Period</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredChallans.map(c => {
                        const meta = STATUS_META[c.status];
                        return (
                          <tr key={c.id}>
                            <td style={{ fontWeight: 700, color: "#071b33" }}>{c.student_name || "—"}<br /><span style={{ fontWeight: 400, color: "#6b7c93", fontSize: ".78rem" }}>{c.student_email}</span></td>
                            <td style={{ fontSize: ".83rem" }}>{c.program === "o-level" ? "O Level" : "SAT"}</td>
                            <td style={{ fontSize: ".83rem" }}>{SUBJECT_LABELS[c.subject] ?? c.subject}</td>
                            <td style={{ fontSize: ".83rem", whiteSpace: "nowrap" }}>{fmtPeriod(c.period)}</td>
                            <td style={{ fontSize: ".83rem", fontWeight: 700 }}>PKR {Number(c.amount_due).toLocaleString()}</td>
                            <td>
                              <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 800, background: meta.bg, color: meta.color }}>
                                {meta.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
