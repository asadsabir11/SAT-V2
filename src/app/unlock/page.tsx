"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import { PageHero } from "@/components/site";
import { trackInitiateCheckout, trackPaymentSubmitted } from "@/lib/analyticsClient";

const AMOUNT_DUE = 5300;
const WA_URL     = process.env.NEXT_PUBLIC_PAYMENT_WHATSAPP_URL ?? "";
// Same bank account as O-Level — one shared account, not a separate one per program.
const BANK_NAME        = process.env.NEXT_PUBLIC_OLEVEL_BANK_NAME ?? "";
const BANK_ACCOUNT_TITLE = process.env.NEXT_PUBLIC_OLEVEL_BANK_ACCOUNT_TITLE ?? "";
const BANK_IBAN        = process.env.NEXT_PUBLIC_OLEVEL_BANK_IBAN ?? "";
const JAZZCASH   = process.env.NEXT_PUBLIC_PAYMENT_JAZZCASH ?? "";
const EASYPAISA  = process.env.NEXT_PUBLIC_PAYMENT_EASYPAISA ?? "";

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
      <span style={{ fontWeight: 700, color: "#92400e" }}>Contact us</span>
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
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<"free" | "pending" | "unlocked">("free");

  const [paymentMethod, setPaymentMethod] = useState("");
  const [amountPaid, setAmountPaid] = useState(String(AMOUNT_DUE));
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

  const [isScholarshipStudent, setIsScholarshipStudent] = useState(false);
  const [scholarshipSubmitting, setScholarshipSubmitting] = useState(false);
  const [scholarshipError, setScholarshipError] = useState("");

  useEffect(() => {
    fetch("/api/student/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const status = d?.access_level ?? "free";
        setCurrentStatus(status);
        if (status === "free") {
          trackInitiateCheckout({ subject: "SAT Full Access" });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
            access: "public",
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
      const res = await fetch("/api/access/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
      trackPaymentSubmitted({ subject: "SAT Full Access", value: Number(amountPaid) });
      setScreenshotSkipped(skippedScreenshot);
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleScholarshipUnlock() {
    setScholarshipSubmitting(true);
    setScholarshipError("");
    try {
      const res = await fetch("/api/access/scholarship-unlock", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setScholarshipError(data.error ?? "Something went wrong. Please try again.");
        setScholarshipSubmitting(false);
        return;
      }
      setCurrentStatus("unlocked");
    } catch {
      setScholarshipError("Something went wrong. Please try again.");
    } finally {
      setScholarshipSubmitting(false);
    }
  }

  if (loading) {
    return <section className="section"><div className="container" style={{ textAlign: "center" }}><p>Loading…</p></div></section>;
  }

  return (
    <>
      <PageHero eyebrow="Pakistan · Manual payment" title="Unlock Full SAT Access" backHref="/dashboard" backLabel="Dashboard">
        Submit your payment details below — we&apos;ll verify and unlock your account, usually within a business day.
        Paying from outside Pakistan? Use the <Link href="/dashboard" style={{ color: "#5eead4" }}>Pay by Card</Link> option instead.
      </PageHero>
      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="card" style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontWeight: 800, color: "var(--navy)" }}>Full SAT Access</p>
              <p style={{ margin: "2px 0 0", color: "var(--muted)", fontSize: ".85rem" }}>One-time fee · unlocks every subject, permanently</p>
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--navy)" }}>PKR {AMOUNT_DUE.toLocaleString()}</div>
          </div>

          {currentStatus === "unlocked" ? (
            <div className="card" style={{ textAlign: "center", padding: 40, background: "linear-gradient(135deg,#d4faf5,#eaf4ff)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
              <p style={{ fontWeight: 800, color: "#075a50", marginBottom: 8, fontSize: "1.05rem" }}>Already unlocked!</p>
              <p style={{ color: "#2d6b60", lineHeight: 1.65, maxWidth: 480, margin: "0 auto 20px" }}>
                Your account already has full access. Head to your dashboard to start studying.
              </p>
              <Link href="/dashboard" className="btn btn-primary">Go to my dashboard →</Link>
            </div>
          ) : submitted ? (
            <div className="card" style={{ textAlign: "center", padding: 40, background: "linear-gradient(135deg,#d4faf5,#eaf4ff)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
              <p style={{ fontWeight: 800, color: "#075a50", marginBottom: 8, fontSize: "1.05rem" }}>Thank you.</p>
              <p style={{ color: "#2d6b60", lineHeight: 1.65, maxWidth: 480, margin: "0 auto" }}>
                Your payment details have been received and are being verified. We&apos;ll email you once your account
                is unlocked — usually within one business day.
              </p>
              {screenshotSkipped && WA_URL && (
                <p style={{ color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 16px", lineHeight: 1.6, maxWidth: 480, margin: "16px auto 0" }}>
                  We couldn&apos;t upload your screenshot (likely a slow connection). No problem — send it to us on{" "}
                  <a href={WA_URL} target="_blank" rel="noreferrer" style={{ color: "#c2410c", fontWeight: 700 }}>WhatsApp</a> with your registered email.
                </p>
              )}
              <Link href="/dashboard" className="btn btn-primary" style={{ marginTop: 20 }}>Go to my dashboard →</Link>
            </div>
          ) : (
            <>
              {currentStatus === "pending" && (
                <div className="card" style={{ marginBottom: 24, background: "#fffbeb", borderColor: "#fde68a" }}>
                  <p style={{ margin: 0, color: "#92400e", fontWeight: 700 }}>⏳ A payment is already under review.</p>
                  <p style={{ margin: "4px 0 0", color: "#78350f", fontSize: ".85rem" }}>You can resubmit below if you need to correct any details.</p>
                </div>
              )}

              <label style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, padding: "16px 20px", background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={isScholarshipStudent}
                  onChange={(e) => { setIsScholarshipStudent(e.target.checked); setScholarshipError(""); }}
                  style={{ width: 20, height: 20, accentColor: "#b45309" }}
                />
                <span style={{ fontWeight: 700, color: "#92400e" }}>
                  🎓 I am an Opportunity Scholarship student — this should be free for me
                </span>
              </label>

              {isScholarshipStudent ? (
                <div className="card" style={{ padding: "28px 32px" }}>
                  <p style={{ color: "var(--muted)", lineHeight: 1.65, marginBottom: 20 }}>
                    We&apos;ll check your account against our approved scholarship students. If you&apos;re on the
                    list, full SAT access unlocks immediately — no payment needed.
                  </p>
                  {scholarshipError && (
                    <div style={{ background: "#fff2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", color: "#c62828", fontSize: ".85rem", fontWeight: 600, marginBottom: 16 }}>
                      ⚠ {scholarshipError}
                    </div>
                  )}
                  <button className="btn btn-primary" type="button" onClick={handleScholarshipUnlock} disabled={scholarshipSubmitting}>
                    {scholarshipSubmitting ? "Checking…" : "Confirm Scholarship & Unlock"}
                  </button>
                </div>
              ) : (
                <>
                  <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--navy)", marginBottom: 14 }}>Payment methods</h2>
                  <div className="grid grid-3" style={{ marginBottom: 32 }}>
                    <PaymentMethodCard title="JazzCash" color="#c2410c" bg="#fff7ed">
                      {JAZZCASH ? <DetailRow label="Account" value={JAZZCASH} /> : <PlaceholderRow label="Account" />}
                    </PaymentMethodCard>
                    <PaymentMethodCard title="Easypaisa" color="#15803d" bg="#f0fdf4">
                      {EASYPAISA ? <DetailRow label="Account" value={EASYPAISA} /> : <PlaceholderRow label="Account" />}
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
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default function UnlockPage() {
  return (
    <Suspense>
      <UnlockForm />
    </Suspense>
  );
}
