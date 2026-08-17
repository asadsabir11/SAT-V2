"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { PageHero } from "@/components/site";
import { trackInitiateCheckout, trackPaymentSubmitted } from "@/lib/analyticsClient";

type Subject = "mathematics" | "english-language";
const SUBJECT_LABELS: Record<string, string> = {
  "mathematics": "Mathematics",
  "english-language": "English Language",
};
const AMOUNT_DUE: Record<Subject, number> = {
  "mathematics": 10000,
  "english-language": 10000,
};

const BANK_NAME = process.env.NEXT_PUBLIC_OLEVEL_BANK_NAME ?? "";
const BANK_ACCOUNT_TITLE = process.env.NEXT_PUBLIC_OLEVEL_BANK_ACCOUNT_TITLE ?? "";
const BANK_IBAN = process.env.NEXT_PUBLIC_OLEVEL_BANK_IBAN ?? "";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: ".85rem", padding: "4px 0" }}>
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span style={{ fontWeight: 700, color: "var(--navy)", textAlign: "right" }}>{value}</span>
    </div>
  );
}
function PlaceholderRow({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: ".85rem", padding: "4px 0" }}>
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span style={{ fontWeight: 700, color: "#92400e" }}>Pending</span>
    </div>
  );
}
function PaymentMethodCard({ title, color, bg, children }: { title: string; color: string; bg: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ background: bg, borderColor: color }}>
      <h3 style={{ color, fontSize: "1rem", marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );
}

function UnlockForm() {
  const params = useSearchParams();
  const subjectParam = params.get("subject");
  const subject: Subject | null = subjectParam === "mathematics" || subjectParam === "english-language" ? subjectParam : null;

  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<"free" | "pending" | "unlocked">("free");

  const [paymentMethod, setPaymentMethod] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [payerAccountName, setPayerAccountName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [screenshotSkipped, setScreenshotSkipped] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!subject) { setLoading(false); return; }
    setAmountPaid(String(AMOUNT_DUE[subject]));
    fetch("/api/o-level/access")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const status = d?.access?.[subject] ?? "free";
        setCurrentStatus(status);
        if (status === "free") {
          trackInitiateCheckout({ subject, value: AMOUNT_DUE[subject] });
        }
      })
      .finally(() => setLoading(false));
  }, [subject]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject) return;
    if (!paymentMethod || !amountPaid || !transactionReference.trim() || !paymentDate || !payerAccountName.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");

    let screenshotUrl: string | null = null;
    let skippedScreenshot = false;
    if (file) {
      setUploadPct(1);
      try {
        const UPLOAD_TIMEOUT_MS = 20_000;
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("upload-timeout")), UPLOAD_TIMEOUT_MS)
        );
        const blob = await Promise.race([
          upload(file.name, file, {
            access: "private",
            handleUploadUrl: "/api/o-level/applications/upload",
            onUploadProgress: ({ percentage }) => setUploadPct(Math.round(percentage)),
          }),
          timeout,
        ]);
        screenshotUrl = blob.url;
      } catch {
        skippedScreenshot = true;
      }
      setUploadPct(0);
    }

    try {
      const res = await fetch("/api/o-level/access/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          paymentMethod,
          amountPaid,
          transactionReference: transactionReference.trim(),
          paymentDate,
          payerAccountName: payerAccountName.trim(),
          paymentScreenshotUrl: screenshotUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      trackPaymentSubmitted({ subject, value: Number(amountPaid) });
      setScreenshotSkipped(skippedScreenshot);
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!subject) {
    return (
      <section className="section"><div className="container" style={{ maxWidth: 640, textAlign: "center" }}>
        <p style={{ color: "var(--muted)" }}>No subject specified. Head back to your dashboard and choose a subject to unlock.</p>
        <Link href="/dashboard" className="btn btn-primary" style={{ marginTop: 16 }}>Go to my dashboard</Link>
      </div></section>
    );
  }

  if (loading) {
    return <section className="section"><div className="container" style={{ textAlign: "center" }}><p>Loading…</p></div></section>;
  }

  return (
    <>
      <PageHero eyebrow="Unlock a subject" title={`Unlock O Level ${SUBJECT_LABELS[subject]}`} backHref="/dashboard" backLabel="Dashboard">
        Submit your payment details below — we&apos;ll verify and unlock this subject, usually within a business day.
      </PageHero>
      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="card" style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontWeight: 800, color: "var(--navy)" }}>{SUBJECT_LABELS[subject]}</p>
              <p style={{ margin: "2px 0 0", color: "var(--muted)", fontSize: ".85rem" }}>Monthly price</p>
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--navy)" }}>PKR {AMOUNT_DUE[subject].toLocaleString()}</div>
          </div>

          {currentStatus === "unlocked" ? (
            <div className="card" style={{ textAlign: "center", padding: 40, background: "linear-gradient(135deg,#d4faf5,#eaf4ff)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
              <p style={{ fontWeight: 800, color: "#075a50", marginBottom: 8, fontSize: "1.05rem" }}>Already unlocked!</p>
              <p style={{ color: "#2d6b60", lineHeight: 1.65, maxWidth: 480, margin: "0 auto 20px" }}>
                {SUBJECT_LABELS[subject]} is unlocked on your account. Head to your dashboard to start studying.
              </p>
              <Link href="/dashboard" className="btn btn-primary">Go to my dashboard →</Link>
            </div>
          ) : submitted ? (
            <div className="card" style={{ textAlign: "center", padding: 40, background: "linear-gradient(135deg,#d4faf5,#eaf4ff)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
              <p style={{ fontWeight: 800, color: "#075a50", marginBottom: 8, fontSize: "1.05rem" }}>Thank you.</p>
              <p style={{ color: "#2d6b60", lineHeight: 1.65, maxWidth: 480, margin: "0 auto" }}>
                Your payment details have been received and are being verified. We&apos;ll email you once{" "}
                {SUBJECT_LABELS[subject]} is unlocked — usually within one business day.
              </p>
              {screenshotSkipped && (
                <p style={{ color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 16px", lineHeight: 1.6, maxWidth: 480, margin: "16px auto 0" }}>
                  We couldn&apos;t upload your screenshot (likely a slow connection). No problem — send it to us on
                  WhatsApp using the button in the corner of this page.
                </p>
              )}
              <Link href="/dashboard" className="btn btn-primary" style={{ marginTop: 20 }}>Go to my dashboard →</Link>
            </div>
          ) : (
            <>
              {currentStatus === "pending" && (
                <div className="card" style={{ marginBottom: 24, background: "#fffbeb", borderColor: "#fde68a" }}>
                  <p style={{ margin: 0, color: "#92400e", fontWeight: 700 }}>⏳ A payment for this subject is already under review.</p>
                  <p style={{ margin: "4px 0 0", color: "#78350f", fontSize: ".85rem" }}>You can resubmit below if you need to correct any details.</p>
                </div>
              )}

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

              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--navy)", marginBottom: 14 }}>Submit payment for verification</h2>
              <form className="form card" onSubmit={handleSubmit} noValidate>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="paymentMethod">Payment method *</label>
                    <select id="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <option value="">Select method</option>
                      <option value="jazzcash">JazzCash</option>
                      <option value="easypaisa">Easypaisa</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="amountPaid">Amount paid (PKR) *</label>
                    <input id="amountPaid" type="number" min={1} value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
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
                    {file && (
                      <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }} style={{ padding: "8px 14px", border: "none", borderRadius: 9, background: "#fee2e2", fontWeight: 700, fontSize: ".82rem", cursor: "pointer", color: "#991b1b" }}>
                        Remove
                      </button>
                    )}
                    {file && <span style={{ fontSize: ".8rem", color: "#344054", fontWeight: 600 }}>{file.name}</span>}
                  </div>
                  {uploadPct > 0 && <p style={{ fontSize: ".75rem", color: "#6b7c93", marginTop: 6 }}>Uploading… {uploadPct}%</p>}
                </div>

                <p style={{ fontSize: ".78rem", color: "#6b7c93", margin: "0 0 4px" }}>
                  By submitting, you confirm you&apos;ve reviewed our{" "}
                  <a href="/o-level/refund-policy" target="_blank" rel="noreferrer" style={{ color: "#155eef" }}>Refund &amp; Cancellation Policy</a>.
                </p>

                {error && (
                  <div style={{ background: "#fff2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", color: "#c62828", fontSize: ".85rem", fontWeight: 600 }}>
                    ⚠ {error}
                  </div>
                )}

                <button className="btn btn-primary" type="submit" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Payment for Verification"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default function OLevelUnlockPage() {
  return (
    <Suspense>
      <UnlockForm />
    </Suspense>
  );
}
