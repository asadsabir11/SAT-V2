"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type AuthUser = { name: string; role: string; program?: string } | null;

const REDEEMABLE_PROGRAMS = ["o-level", "punjab-9th", "a-level"];

const PORTAL_LINKS: Record<string, { label: string; href: string }> = {
  "o-level": { label: "Go to my O Level lectures", href: "/o-level/lectures" },
  "punjab-9th": { label: "Go to my portal", href: "/punjab-board-9th-class/portal" },
  "a-level": { label: "Go to my portal", href: "/a-level/portal" },
};

const SUBJECT_LABELS: Record<string, string> = {
  "computer-science": "Computer Science",
  mathematics: "Mathematics",
  "english-language": "English Language",
  islamiyat: "Islamiyat",
  "pakistan-studies": "Pakistan Studies",
  physics: "Physics",
};

function RedeemForm() {
  const params = useSearchParams();
  const [user, setUser] = useState<AuthUser>(undefined as unknown as AuthUser);
  const [code, setCode] = useState(params.get("code") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ program: string; subject: string | null } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user ?? null)).catch(() => setUser(null));
  }, []);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!code.trim()) { setError("Please enter the code printed in your book."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong. Please try again."); return; }
      setResult({ program: data.program, subject: data.subject ?? null });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Still checking the session.
  if (user === undefined) {
    return <p style={{ textAlign: "center", color: "var(--muted)" }}>Loading…</p>;
  }

  if (result) {
    const portal = PORTAL_LINKS[result.program];
    const subjectLabel = result.subject ? SUBJECT_LABELS[result.subject] ?? result.subject : null;
    return (
      <div className="card" style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: 40, background: "linear-gradient(135deg,#f0fdf4,#eaf4ff)" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🎉</div>
        <p style={{ fontWeight: 800, color: "#15803d", marginBottom: 8, fontSize: "1.1rem" }}>Unlocked!</p>
        <p style={{ color: "#344054", lineHeight: 1.65, margin: "0 auto 20px" }}>
          {subjectLabel ? `${subjectLabel} is now fully unlocked` : "Your program is now fully unlocked"} — lectures, quizzes, past papers and assignments are all available.
        </p>
        {portal && <Link href={portal.href} className="btn btn-primary">{portal.label} →</Link>}
      </div>
    );
  }

  if (!user || user.role !== "student") {
    return (
      <div className="card" style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>🔒</div>
        <p style={{ fontWeight: 800, color: "#071b33", marginBottom: 8, fontSize: "1.05rem" }}>Log in to redeem your code</p>
        <p style={{ color: "var(--muted)", lineHeight: 1.65, margin: "0 auto 24px" }}>
          The code unlocks access on your own account, so please log in (or register for free) first.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 260, margin: "0 auto" }}>
          <Link href={`/login?role=student&next=/redeem${code ? `?code=${encodeURIComponent(code)}` : ""}`} className="btn btn-primary">Log in</Link>
          {/* .btn-ghost is white-on-transparent, meant for dark "band"
              sections — invisible on this card's white background, so
              these use an explicit light-background style instead. */}
          <Link href="/o-level?next=redeem#apply" className="btn" style={{ background: "#fff", color: "var(--blue)", border: "1.5px solid #cbd7e5" }}>Register for O Level</Link>
          <Link href="/punjab-board-9th-class#apply" className="btn" style={{ background: "#fff", color: "var(--blue)", border: "1.5px solid #cbd7e5" }}>Register for 9th Class</Link>
          <Link href="/a-level#apply" className="btn" style={{ background: "#fff", color: "var(--blue)", border: "1.5px solid #cbd7e5" }}>Register for A Level</Link>
        </div>
      </div>
    );
  }

  if (!user.program || !REDEEMABLE_PROGRAMS.includes(user.program)) {
    return (
      <div className="card" style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: 40 }}>
        <p style={{ fontWeight: 800, color: "#071b33", marginBottom: 8 }}>Book codes aren&apos;t available for your account yet</p>
        <p style={{ color: "var(--muted)", lineHeight: 1.65 }}>Printed-book redemption currently covers O Level, 9th Class and A Level accounts.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 480, margin: "0 auto", padding: 40 }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: "2.2rem", marginBottom: 10 }}>📘</div>
        <p style={{ fontWeight: 800, color: "#071b33", fontSize: "1.05rem" }}>Redeem your book code</p>
        <p style={{ color: "var(--muted)", marginTop: 6 }}>Enter the code printed inside your copy of the notes.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="DT-XXXXXXXX"
          style={{ width: "100%", padding: "14px 16px", borderRadius: 10, border: "1.5px solid #cbd7e5", fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.05em", textAlign: "center", textTransform: "uppercase" }}
        />
        {error && <p style={{ color: "#dc2626", fontWeight: 700, fontSize: ".88rem", marginTop: 10, textAlign: "center" }}>{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", marginTop: 16 }}>
          {loading ? "Checking…" : "Unlock →"}
        </button>
      </form>
    </div>
  );
}

export default function RedeemPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="eyebrow" style={{ justifyContent: "center" }}>Printed Notes</div>
        <h1 className="title" style={{ textAlign: "center", marginBottom: 28 }}>Redeem Your Book Code</h1>
        <Suspense fallback={<p style={{ textAlign: "center", color: "var(--muted)" }}>Loading…</p>}>
          <RedeemForm />
        </Suspense>
      </div>
    </section>
  );
}
