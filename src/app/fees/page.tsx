"use client";
import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { PageHero } from "@/components/site";

interface Challan {
  id: string;
  program: "sat" | "o-level";
  subject: string;
  period: string;
  amount_due: string;
  status: "unpaid" | "submitted" | "paid";
}

const SUBJECT_LABELS: Record<string, string> = {
  "": "Full SAT Access",
  mathematics: "Mathematics",
  "english-language": "English Language",
  "computer-science": "Computer Science",
  islamiyat: "Islamiyat",
  "pakistan-studies": "Pakistan Studies",
  physics: "Physics",
};

const STATUS_META: Record<Challan["status"], { label: string; bg: string; color: string }> = {
  unpaid:    { label: "Unpaid",    bg: "#fee2e2", color: "#991b1b" },
  submitted: { label: "Under review", bg: "#fef3c7", color: "#92400e" },
  paid:      { label: "Paid",      bg: "#d1fae5", color: "#065f46" },
};

function fmtPeriod(period: string) {
  const [y, m] = period.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

type Tab = "challans" | "submit";

export default function FeesPage() {
  const [tab, setTab] = useState<Tab>("challans");
  const [me, setMe] = useState<{ name: string; email: string } | null>(null);
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [amountPaid, setAmountPaid] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    Promise.all([
      fetch("/api/auth/me").then(r => r.json()),
      fetch("/api/fees/challans").then(r => r.json()),
    ]).then(([authData, feeData]) => {
      setMe(authData.user ? { name: authData.user.name, email: authData.user.email } : null);
      setChallans(feeData.challans ?? []);
    }).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const unpaidChallans = challans.filter(c => c.status === "unpaid");

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // Auto-sum selected challans as a starting point — student can still edit
  // the amount by hand (e.g. if a bank fee shifted what actually landed).
  useEffect(() => {
    const total = unpaidChallans
      .filter(c => selected.has(c.id))
      .reduce((sum, c) => sum + Number(c.amount_due), 0);
    if (total > 0) setAmountPaid(String(total));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.size === 0) {
      setError("Select at least one item you're paying for.");
      return;
    }
    if (!amountPaid || !transactionReference.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");

    let screenshotUrl: string | null = null;
    if (file) {
      setUploadPct(1);
      try {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/o-level/applications/upload",
          onUploadProgress: ({ percentage }) => setUploadPct(Math.round(percentage)),
        });
        screenshotUrl = blob.url;
      } catch {
        // Non-fatal — admin can still verify against the transaction reference.
      }
      setUploadPct(0);
    }

    try {
      const res = await fetch("/api/fees/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challanIds: [...selected],
          amountPaid: Number(amountPaid),
          transactionReference: transactionReference.trim(),
          paymentScreenshotUrl: screenshotUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHero eyebrow="Fee portal" title="Fees" backHref="/dashboard" backLabel="Dashboard">
        View your monthly fee challans and submit payment proof for verification.
      </PageHero>
      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
            <button onClick={() => setTab("challans")} style={{ padding: "10px 22px", borderRadius: 10, fontWeight: 800, fontSize: ".9rem", cursor: "pointer", border: tab === "challans" ? "2px solid #155eef" : "2px solid #e8eef6", background: tab === "challans" ? "#eff6ff" : "#f8fafc", color: tab === "challans" ? "#155eef" : "#6b7c93" }}>
              📋 Fee Challans
            </button>
            <button onClick={() => setTab("submit")} style={{ padding: "10px 22px", borderRadius: 10, fontWeight: 800, fontSize: ".9rem", cursor: "pointer", border: tab === "submit" ? "2px solid #155eef" : "2px solid #e8eef6", background: tab === "submit" ? "#eff6ff" : "#f8fafc", color: tab === "submit" ? "#155eef" : "#6b7c93" }}>
              💳 Submit Payment
            </button>
          </div>

          {loading ? (
            <div className="card"><p>Loading…</p></div>
          ) : tab === "challans" ? (
            challans.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
                <div style={{ fontSize: "2rem", marginBottom: 10 }}>📋</div>
                <p>No fee challans yet. They&apos;ll appear here once generated for your account.</p>
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Period</th>
                        <th>Item</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {challans.map(c => {
                        const meta = STATUS_META[c.status];
                        return (
                          <tr key={c.id}>
                            <td style={{ fontWeight: 700, color: "#071b33" }}>{fmtPeriod(c.period)}</td>
                            <td style={{ fontSize: ".85rem" }}>{SUBJECT_LABELS[c.subject] ?? c.subject}</td>
                            <td style={{ fontSize: ".85rem", fontWeight: 700 }}>PKR {Number(c.amount_due).toLocaleString()}</td>
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
            )
          ) : submitted ? (
            <div className="card" style={{ textAlign: "center", padding: 40, background: "linear-gradient(135deg,#d4faf5,#eaf4ff)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
              <p style={{ fontWeight: 800, color: "#075a50", marginBottom: 8, fontSize: "1.05rem" }}>Thank you.</p>
              <p style={{ color: "#2d6b60", lineHeight: 1.65, maxWidth: 480, margin: "0 auto 20px" }}>
                Your payment details have been received and are being verified. We&apos;ll email you once it&apos;s
                confirmed — usually within one business day.
              </p>
              <button className="btn btn-primary" onClick={() => { setSubmitted(false); setSelected(new Set()); setAmountPaid(""); setTransactionReference(""); setFile(null); load(); }}>
                Submit another payment
              </button>
            </div>
          ) : unpaidChallans.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
              <div style={{ fontSize: "2rem", marginBottom: 10 }}>✅</div>
              <p>Nothing outstanding right now — you&apos;re all paid up.</p>
            </div>
          ) : (
            <form className="form card" onSubmit={handleSubmit} noValidate>
              <div className="form-grid" style={{ marginBottom: 8 }}>
                <div className="field">
                  <label>Name</label>
                  <input value={me?.name ?? ""} disabled />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input value={me?.email ?? ""} disabled />
                </div>
              </div>

              <div className="field">
                <label>Which subject(s)/item(s) are you paying for? *</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
                  {unpaidChallans.map(c => (
                    <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "1.5px solid #e8eef6", borderRadius: 10, cursor: "pointer", background: selected.has(c.id) ? "#eff6ff" : "#fff" }}>
                      <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} style={{ width: 18, height: 18 }} />
                      <span style={{ fontWeight: 700, color: "#071b33" }}>{fmtPeriod(c.period)} — {SUBJECT_LABELS[c.subject] ?? c.subject}</span>
                      <span style={{ marginLeft: "auto", color: "#6b7c93", fontWeight: 700 }}>PKR {Number(c.amount_due).toLocaleString()}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label htmlFor="amountPaid">Amount paid (PKR) *</label>
                  <input id="amountPaid" type="number" min={1} value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="transactionReference">Transaction ID / reference number *</label>
                  <input id="transactionReference" type="text" value={transactionReference} onChange={(e) => setTransactionReference(e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label>Payment screenshot (optional — JPG, PNG or PDF, max 10MB)</label>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,application/pdf" style={{ display: "none" }} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <button type="button" onClick={() => fileRef.current?.click()} style={{ padding: "8px 14px", border: "1.5px solid #dce5ef", borderRadius: 9, background: "#fff", fontWeight: 700, fontSize: ".82rem", cursor: "pointer", color: "#344054" }}>
                    {file ? "Change file" : "Choose file"}
                  </button>
                  {file && <span style={{ fontSize: ".8rem", color: "#344054", fontWeight: 600 }}>{file.name}</span>}
                </div>
                {uploadPct > 0 && <p style={{ fontSize: ".75rem", color: "#6b7c93", marginTop: 6 }}>Uploading… {uploadPct}%</p>}
              </div>

              {error && (
                <div style={{ background: "#fff2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", color: "#c62828", fontSize: ".85rem", fontWeight: 600 }}>
                  ⚠ {error}
                </div>
              )}

              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit Payment for Verification"}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
