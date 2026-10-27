"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const PROGRAM_LABELS: Record<string, string> = { "o-level": "O Level", "punjab-9th": "9th Class", "a-level": "A Level" };

function RegisterForm() {
  const params = useSearchParams();
  const program = params.get("program") ?? "";
  const programLabel = PROGRAM_LABELS[program];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!programLabel) {
    return (
      <div className="card" style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: 40 }}>
        <p style={{ fontWeight: 800, color: "#071b33", marginBottom: 8 }}>Missing program</p>
        <p style={{ color: "var(--muted)", marginBottom: 20 }}>Please go back and choose which book you&apos;re registering for.</p>
        <Link href="/redeem" className="btn btn-primary">Back to Redeem →</Link>
      </div>
    );
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/redeem/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, program }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      // Full page reload so the Header re-fetches the session cookie, then
      // straight back to /redeem to actually use the code — that's the
      // entire point of this form.
      window.location.href = "/redeem";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 480, margin: "0 auto", padding: 40 }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <p style={{ fontWeight: 800, color: "#071b33", fontSize: "1.05rem" }}>Create your {programLabel} account</p>
        <p style={{ color: "var(--muted)", marginTop: 6 }}>Just the basics — you&apos;ll come straight back here to redeem your code.</p>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        <div>
          <label htmlFor="name" style={{ display: "block", fontWeight: 700, fontSize: ".85rem", marginBottom: 6 }}>Name</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #cbd7e5" }} />
        </div>
        <div>
          <label htmlFor="email" style={{ display: "block", fontWeight: 700, fontSize: ".85rem", marginBottom: 6 }}>Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #cbd7e5" }} />
        </div>
        <div>
          <label htmlFor="password" style={{ display: "block", fontWeight: 700, fontSize: ".85rem", marginBottom: 6 }}>Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #cbd7e5" }} />
        </div>
        {error && <p style={{ color: "#dc2626", fontWeight: 700, fontSize: ".85rem" }}>{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%" }}>
          {loading ? "Creating account…" : "Create account →"}
        </button>
      </form>
      <p style={{ marginTop: 20, textAlign: "center", color: "var(--muted)", fontSize: ".82rem" }}>
        Already have an account? <Link href={`/login?role=student&next=/redeem`} style={{ color: "var(--blue)", fontWeight: 700 }}>Log in →</Link>
      </p>
    </div>
  );
}

export default function BookRegisterPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="eyebrow" style={{ justifyContent: "center" }}>Printed Notes</div>
        <h1 className="title" style={{ textAlign: "center", marginBottom: 28 }}>Quick Registration</h1>
        <Suspense fallback={<p style={{ textAlign: "center", color: "var(--muted)" }}>Loading…</p>}>
          <RegisterForm />
        </Suspense>
      </div>
    </section>
  );
}
