"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { trackInitiateCheckout, trackPaymentSubmitted } from "@/lib/analyticsClient";

interface ApplicationSummary {
  id: string;
  parent_name: string;
  student_name: string;
  subject: string;
  amount_due: number | null;
  status: string;
  parent_whatsapp: string;
}

const SUBJECT_LABELS: Record<string, string> = {
  "english-language": "English Language",
  "mathematics": "Mathematics",
  "english-language+mathematics": "English Language and Mathematics",
  "computer-science-waitlist": "Computer Science (waiting list)",
  "islamiyat-waitlist": "Islamiyat (waiting list)",
  "pakistan-studies-waitlist": "Pakistan Studies (waiting list)",
};

const WA_URL = process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL ?? "#";

function PaymentMethodCard({ title, color, bg, children }: { title: string; color: string; bg: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ borderTop: `3px solid ${color}` }}>
      <div style={{ display: "inline-block", padding: "3px 12px", borderRadius: 999, background: bg, color, fontWeight: 800, fontSize: ".78rem", marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function PlaceholderRow({ label }: { label: string }) {
  return (
    <p style={{ margin: "4px 0", fontSize: ".88rem", color: "#92400e", background: "#fffbeb", border: "1px dashed #fde68a", borderRadius: 6, padding: "6px 10px" }}>
      ⚠ {label}: pending — will be added by the founder before launch
    </p>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <p style={{ margin: "4px 0", fontSize: ".88rem", color: "#071b33" }}>
      <span style={{ color: "#6b7c93" }}>{label}: </span>
      <strong>{value}</strong>
    </p>
  );
}

const BANK_NAME = process.env.NEXT_PUBLIC_OLEVEL_BANK_NAME;
const BANK_ACCOUNT_TITLE = process.env.NEXT_PUBLIC_OLEVEL_BANK_ACCOUNT_TITLE;
const BANK_IBAN = process.env.NEXT_PUBLIC_OLEVEL_BANK_IBAN;

export default function PaymentPageClient() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");

  const [application, setApplication] = useState<ApplicationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<"jazzcash" | "easypaisa" | "bank_transfer" | "">("");
  const [amountPaid, setAmountPaid] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [payerAccountName, setPayerAccountName] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!applicationId) { setNotFound(true); setLoading(false); return; }
    fetch(`/api/o-level/applications/${applicationId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) { setNotFound(true); return; }
        setApplication(d.application);
        if (d.application.status !== "new_application" && d.application.status !== "contact_required" && d.application.status !== "awaiting_payment") {
          setSubmitted(true);
        } else {
          trackInitiateCheckout({ subject: d.application.subject, value: d.application.amount_due ?? undefined });
        }
      })
      .finally(() => setLoading(false));
  }, [applicationId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!applicationId || !application) return;
    if (!paymentMethod || !amountPaid || !transactionReference.trim() || !paymentDate || !payerAccountName.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      let screenshotUrl: string | null = null;
      if (file) {
        setUploadPct(1);
        const blob = await upload(file.name, file, {
          access: "private",
          handleUploadUrl: "/api/o-level/applications/upload",
          onUploadProgress: ({ percentage }) => setUploadPct(Math.round(percentage)),
        });
        screenshotUrl = blob.url;
        setUploadPct(0);
      }

      const res = await fetch(`/api/o-level/applications/${applicationId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          amountPaid,
          transactionReference: transactionReference.trim(),
          paymentDate,
          payerAccountName: payerAccountName.trim(),
          paymentScreenshotUrl: screenshotUrl,
          note: note.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      trackPaymentSubmitted({ subject: application.subject, value: Number(amountPaid) });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <section className="section"><div className="container"><div className="card" style={{ maxWidth: 400 }}><p>Loading…</p></div></div></section>;
  }

  if (notFound || !application) {
    return (
      <section className="section"><div className="container">
        <div className="card" style={{ maxWidth: 440, textAlign: "center", padding: 40 }}>
          <p style={{ fontWeight: 700, marginBottom: 12 }}>We couldn&apos;t find that application.</p>
          <Link href="/o-level/enroll" style={{ color: "#155eef", fontWeight: 700 }}>Start a new application →</Link>
        </div>
      </div></section>
    );
  }

  const subjectLabel = SUBJECT_LABELS[application.subject] ?? application.subject;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Link href="/o-level" style={{ display: "inline-block", marginBottom: 14, color: "#6b7c93", fontSize: ".82rem", fontWeight: 600, textDecoration: "none" }}>← O Level</Link>
          <div className="eyebrow">Reserve your seat</div>
          <h1 className="title" style={{ maxWidth: 780 }}>Reserve Your Founding Cohort Seat</h1>
          <p className="lead">
            Your application has been received. To reserve {application.student_name}&apos;s seat, please transfer the
            applicable fee using one of the payment methods below. Enrollment will be confirmed after the transaction
            is verified.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="card" style={{ marginBottom: 28, background: "#eaf1ff", borderColor: "#c9dcfb" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 800, color: "var(--navy)" }}>{application.student_name} · {subjectLabel}</p>
                <p style={{ margin: "2px 0 0", color: "var(--muted)", fontSize: ".85rem" }}>Application ID: {application.id}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: ".75rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Amount due</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--navy)" }}>
                  {application.amount_due ? `PKR ${application.amount_due.toLocaleString()}` : "To be confirmed"}
                </div>
              </div>
            </div>
          </div>

          {submitted ? (
            <div className="card" style={{ textAlign: "center", padding: 40, background: "linear-gradient(135deg,#d4faf5,#eaf4ff)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
              <p style={{ fontWeight: 800, color: "#075a50", marginBottom: 8, fontSize: "1.05rem" }}>Thank you.</p>
              <p style={{ color: "#2d6b60", lineHeight: 1.65, maxWidth: 480, margin: "0 auto" }}>
                Your payment information has been received and is being verified. We will confirm the student&apos;s
                enrollment through WhatsApp and email. Please allow up to one business day.
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--navy)", marginBottom: 14 }}>Payment methods</h2>
              <div className="grid grid-3" style={{ marginBottom: 32 }}>
                <PaymentMethodCard title="JazzCash" color="#c2410c" bg="#fff7ed">
                  <PlaceholderRow label="Account title" />
                  <PlaceholderRow label="Mobile/account number" />
                </PaymentMethodCard>
                <PaymentMethodCard title="Easypaisa" color="#15803d" bg="#f0fdf4">
                  <PlaceholderRow label="Account title" />
                  <PlaceholderRow label="Mobile/account number" />
                </PaymentMethodCard>
                <PaymentMethodCard title="Bank Transfer" color="#1d4ed8" bg="#eff6ff">
                  {BANK_NAME && BANK_ACCOUNT_TITLE && BANK_IBAN ? (
                    <>
                      <DetailRow label="Bank" value={BANK_NAME} />
                      <DetailRow label="Account title" value={BANK_ACCOUNT_TITLE} />
                      <DetailRow label="IBAN" value={BANK_IBAN} />
                    </>
                  ) : (
                    <>
                      <PlaceholderRow label="Bank name" />
                      <PlaceholderRow label="Account title" />
                      <PlaceholderRow label="Account / IBAN" />
                    </>
                  )}
                </PaymentMethodCard>
              </div>

              <div style={{ padding: "16px 18px", borderRadius: 12, background: "#f0fdf4", border: "1.5px solid #86efac", marginBottom: 32 }}>
                <p style={{ fontWeight: 800, color: "#065f46", margin: "0 0 4px", fontSize: ".9rem" }}>
                  Please include the student&apos;s name in the transfer reference where possible.
                </p>
                <p style={{ color: "#047857", fontSize: ".85rem", margin: "0 0 10px", lineHeight: 1.5 }}>
                  After making payment, submit the transaction details below. Questions? Message us on WhatsApp.
                </p>
                <a href={WA_URL} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#22c55e", color: "#fff", borderRadius: 8, fontWeight: 800, fontSize: ".85rem", textDecoration: "none" }}>
                  Open WhatsApp →
                </a>
              </div>

              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--navy)", marginBottom: 14 }}>Submit payment for verification</h2>
              <form className="form card" onSubmit={handleSubmit} noValidate>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="paymentMethod">Payment method *</label>
                    <select id="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}>
                      <option value="">Select method</option>
                      <option value="jazzcash">JazzCash</option>
                      <option value="easypaisa">Easypaisa</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="amountPaid">Amount paid (PKR) *</label>
                    <input id="amountPaid" type="number" min="0" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder={application.amount_due ? String(application.amount_due) : ""} />
                  </div>
                  <div className="field">
                    <label htmlFor="transactionReference">Transaction ID / reference number *</label>
                    <input id="transactionReference" type="text" value={transactionReference} onChange={(e) => setTransactionReference(e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="paymentDate">Payment date *</label>
                    <input id="paymentDate" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="payerAccountName">Name on the sending account *</label>
                    <input id="payerAccountName" type="text" value={payerAccountName} onChange={(e) => setPayerAccountName(e.target.value)} />
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

                <div className="field">
                  <label htmlFor="note">Additional note (optional)</label>
                  <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d0d7e3", fontFamily: "inherit", resize: "vertical" }} />
                </div>

                <p style={{ fontSize: ".78rem", color: "#6b7c93", margin: "0 0 4px" }}>
                  By submitting, you confirm you&apos;ve reviewed our{" "}
                  <a href="/o-level/refund-policy" target="_blank" rel="noreferrer" style={{ color: "#155eef" }}>Refund &amp; Cancellation Policy</a>.
                </p>
                <button className="btn btn-primary" type="submit" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Payment for Verification"}
                </button>
                {error && <div className="note">{error}</div>}
              </form>
            </>
          )}
        </div>
      </section>
    </>
  );
}
