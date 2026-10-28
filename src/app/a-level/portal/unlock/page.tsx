"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { upload } from "@vercel/blob/client";

type Subject = "computer-science-vol1" | "computer-science-vol2";
const SUBJECT_LABELS: Record<Subject, string> = {
  "computer-science-vol1": "Computer Science (CS 9618 Vol 1)",
  "computer-science-vol2": "Computer Science (CS 9618 Vol 2)",
};
const AMOUNT_DUE = 10000;
// Same shared bank account as O-Level/SAT/9th — one account, not a separate one per program.
const BANK_NAME = process.env.NEXT_PUBLIC_OLEVEL_BANK_NAME ?? "";
const BANK_ACCOUNT_TITLE = process.env.NEXT_PUBLIC_OLEVEL_BANK_ACCOUNT_TITLE ?? "";
const BANK_IBAN = process.env.NEXT_PUBLIC_OLEVEL_BANK_IBAN ?? "";
const JAZZCASH = process.env.NEXT_PUBLIC_PAYMENT_JAZZCASH ?? "";
const EASYPAISA = process.env.NEXT_PUBLIC_PAYMENT_EASYPAISA ?? "";

function BigDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(190,18,60,.15)" }}>
      <div style={{ color: "#be123c", fontSize: ".8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>{label}</div>
      <div style={{ color: "var(--navy)", fontSize: "1.5rem", fontWeight: 900, wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}
function BigPlaceholderRow({ label }: { label: string }) {
  return (
    <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(190,18,60,.15)" }}>
      <div style={{ color: "#be123c", fontSize: ".8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#92400e", fontSize: "1.5rem", fontWeight: 900 }}>Pending</div>
    </div>
  );
}

function UnlockForm() {
  const params = useSearchParams();
  const subjectParam = params.get("subject");
  const subject: Subject | null =
    subjectParam === "computer-science-vol1" || subjectParam === "computer-science-vol2" ? subjectParam : null;

  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<"free" | "pending" | "unlocked">("free");

  const paymentMethod = "bank_transfer";
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

  useEffect(() => {
    if (!subject) { setLoading(false); return; }
    fetch(`/api/a-level/access/status?subject=${subject}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setCurrentStatus(d?.access_level ?? "free"))
      .finally(() => setLoading(false));
  }, [subject]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject) return;
    if (!amountPaid || !transactionReference.trim() || !paymentDate || !payerAccountName.trim()) {
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
      const res = await fetch("/api/a-level/access/request", {
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
      <div className="card" style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: 40 }}>
        <p style={{ fontWeight: 800, color: "#071b33", marginBottom: 16 }}>Which subject would you like to unlock?</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(Object.keys(SUBJECT_LABELS) as Subject[]).map((s) => (
            <Link key={s} href={`/a-level/portal/unlock?subject=${s}`} className="btn btn-primary" style={{ background: "#be123c", borderColor: "#be123c" }}>
              {SUBJECT_LABELS[s]} →
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return <p style={{ textAlign: "center", color: "var(--muted)" }}>Loading…</p>;
  }

  return (
    <>
      {currentStatus === "unlocked" ? (
        <div className="card" style={{ textAlign: "center", padding: 40, background: "linear-gradient(135deg,#fff1f2,#eaf4ff)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
          <p style={{ fontWeight: 800, color: "#9f1239", marginBottom: 8, fontSize: "1.05rem" }}>Already unlocked!</p>
          <p style={{ color: "#9d174d", lineHeight: 1.65, maxWidth: 480, margin: "0 auto 20px" }}>
            {SUBJECT_LABELS[subject]} is unlocked on your account. Head to your portal to start studying.
          </p>
          <Link href="/a-level/portal" className="btn btn-primary" style={{ background: "#be123c", borderColor: "#be123c" }}>Go to my portal →</Link>
        </div>
      ) : submitted ? (
        <div className="card" style={{ textAlign: "center", padding: 40, background: "linear-gradient(135deg,#fff1f2,#eaf4ff)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
          <p style={{ fontWeight: 800, color: "#9f1239", marginBottom: 8, fontSize: "1.05rem" }}>Thank you.</p>
          <p style={{ color: "#9d174d", lineHeight: 1.65, maxWidth: 480, margin: "0 auto" }}>
            Your payment details have been received and are being verified. We&apos;ll email you once{" "}
            {SUBJECT_LABELS[subject]} is unlocked — usually within one business day.
          </p>
          {screenshotSkipped && (
            <p style={{ color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 16px", lineHeight: 1.6, maxWidth: 480, margin: "16px auto 0" }}>
              We couldn&apos;t upload your screenshot (likely a slow connection). No problem — send it to us on WhatsApp instead.
            </p>
          )}
          <Link href="/a-level/portal" className="btn btn-primary" style={{ marginTop: 20, background: "#be123c", borderColor: "#be123c" }}>Go to my portal →</Link>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontWeight: 800, color: "var(--navy)" }}>{SUBJECT_LABELS[subject]}</p>
              <p style={{ margin: "2px 0 0", color: "var(--muted)", fontSize: ".85rem" }}>Monthly fee · full access to this volume</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--navy)" }}>PKR {AMOUNT_DUE.toLocaleString()}<span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--muted)" }}>/mo</span></div>
            </div>
          </div>

          {currentStatus === "pending" && (
            <div className="card" style={{ marginBottom: 24, background: "#fffbeb", borderColor: "#fde68a" }}>
              <p style={{ margin: 0, color: "#92400e", fontWeight: 700 }}>⏳ A payment for this subject is already under review.</p>
              <p style={{ margin: "4px 0 0", color: "#78350f", fontSize: ".85rem" }}>You can resubmit below if you need to correct any details.</p>
            </div>
          )}

          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--navy)", marginBottom: 14 }}>Payment method</h2>
          <div className="card" style={{ background: "#fff1f2", borderColor: "#be123c", borderWidth: 2, marginBottom: 20, padding: "28px 32px" }}>
            <h3 style={{ color: "#be123c", fontSize: "1.3rem", marginTop: 0, marginBottom: 18 }}>🏦 Bank Transfer</h3>
            <div className="grid grid-3" style={{ gap: 32 }}>
              {BANK_NAME && BANK_ACCOUNT_TITLE && BANK_IBAN ? (
                <>
                  <BigDetailRow label="Bank" value={BANK_NAME} />
                  <BigDetailRow label="Account title" value={BANK_ACCOUNT_TITLE} />
                  <BigDetailRow label="IBAN" value={BANK_IBAN} />
                </>
              ) : (
                <>
                  <BigPlaceholderRow label="Bank name" />
                  <BigPlaceholderRow label="Account title" />
                  <BigPlaceholderRow label="Account / IBAN" />
                </>
              )}
            </div>
          </div>

          {(JAZZCASH || EASYPAISA) && (
            <div className="card" style={{ marginBottom: 32, padding: "20px 24px", display: "flex", gap: 32, flexWrap: "wrap" }}>
              {JAZZCASH && <div><div style={{ color: "#6b7c93", fontSize: ".78rem", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>JazzCash</div><div style={{ fontWeight: 800, color: "var(--navy)", fontSize: "1.1rem" }}>{JAZZCASH}</div></div>}
              {EASYPAISA && <div><div style={{ color: "#6b7c93", fontSize: ".78rem", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Easypaisa</div><div style={{ fontWeight: 800, color: "var(--navy)", fontSize: "1.1rem" }}>{EASYPAISA}</div></div>}
            </div>
          )}

          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--navy)", marginBottom: 14 }}>Submit payment for verification</h2>
          <form className="form card" onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
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

            <button className="btn btn-primary" type="submit" disabled={submitting} style={{ background: "#be123c", borderColor: "#be123c" }}>
              {submitting ? "Submitting…" : "Submit Payment for Verification"}
            </button>
          </form>
        </>
      )}
    </>
  );
}

export default function ALevelUnlockPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        <Link href="/a-level/portal" style={{ color: "#6b7c93", fontSize: ".85rem", textDecoration: "none" }}>← Portal</Link>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "10px 0 6px" }}>Unlock Access</h1>
        <p style={{ color: "#6b7c93", marginBottom: 24 }}>Submit your payment details below — we&apos;ll verify and unlock your account, usually within a business day.</p>
        <Suspense fallback={<p style={{ textAlign: "center", color: "var(--muted)" }}>Loading…</p>}>
          <UnlockForm />
        </Suspense>
      </div>
    </section>
  );
}
