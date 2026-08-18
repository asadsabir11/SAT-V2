"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Role = "student" | "founder" | "parent" | "teacher";
type Program = "sat" | "o-level";
const ROLE_LABELS: Record<Role, string> = { student: "Student", parent: "Parent", founder: "Founder", teacher: "Teacher" };

function LoginForm() {
  const params = useSearchParams();
  const nextPath = params.get("next");

  const [role, setRole] = useState<Role>((params.get("role") as Role) ?? "student");
  const [program, setProgram] = useState<Program>((params.get("program") as Program) ?? "sat");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const r = params.get("role") as Role;
    if (r === "student" || r === "founder" || r === "parent" || r === "teacher") setRole(r);
    const p = params.get("program") as Program;
    if (p === "sat" || p === "o-level") setProgram(p);
  }, [params]);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!email.trim() || !password) { setError("Please enter your email and password."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, role, program: role === "student" || role === "parent" ? program : undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Login failed. Please try again."); return; }
      // Full page reload so the Header re-fetches the session cookie
      window.location.href = nextPath ?? ((data.role === "founder" || data.role === "teacher") ? "/admin" : data.role === "parent" ? "/parent" : "/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px", background: "linear-gradient(160deg,#f0f5ff 0%,#f8fafc 60%,#f0fdf9 100%)" }}>

      {/* Logo */}
      <Link href="/" style={{ fontWeight: 900, fontSize: "1.15rem", letterSpacing: "-.04em", color: "#071b33", textDecoration: "none", marginBottom: 32 }}>
        <span style={{ color: "#155eef" }}>The Digital</span> Tutor
      </Link>

      <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 20, boxShadow: "0 4px 32px rgba(7,27,51,.10), 0 1px 4px rgba(7,27,51,.06)", padding: "40px 36px" }}>

        <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#071b33", margin: "0 0 6px", letterSpacing: "-.03em" }}>Sign in</h1>
        <p style={{ color: "#6b7c93", fontSize: ".9rem", margin: "0 0 28px" }}>
          Welcome back — choose your account type below.
        </p>

        {/* Role tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, background: "#f1f5f9", borderRadius: 12, padding: 4 }}>
          {([["student", "🎓", "Student"], ["parent", "👨‍👩‍👧", "Parent"], ["teacher", "👨‍🏫", "Teacher"], ["founder", "🛡️", "Founder"]] as const).map(([r, icon, label]) => (
            <button
              key={r}
              type="button"
              aria-pressed={role === r}
              onClick={() => { setRole(r); setError(""); }}
              style={{
                flex: 1, padding: "10px 8px", borderRadius: 9, border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: ".84rem", transition: ".15s",
                background: role === r ? "#fff" : "transparent",
                color: role === r ? "#155eef" : "#6b7c93",
                boxShadow: role === r ? "0 1px 6px rgba(7,27,51,.10)" : "none",
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {(role === "student" || role === "parent") && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontWeight: 700, fontSize: ".85rem", color: "#344054", marginBottom: 6 }}>
              Program
            </label>
            <div style={{ display: "flex", gap: 8, background: "#f1f5f9", borderRadius: 10, padding: 4 }}>
              {([["sat", "SAT Prep"], ["o-level", "O Level"]] as const).map(([p, label]) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={program === p}
                  onClick={() => { setProgram(p); setError(""); }}
                  style={{
                    flex: 1, padding: "8px 8px", borderRadius: 7, border: "none", cursor: "pointer",
                    fontWeight: 700, fontSize: ".8rem", transition: ".15s",
                    background: program === p ? "#fff" : "transparent",
                    color: program === p ? "#155eef" : "#6b7c93",
                    boxShadow: program === p ? "0 1px 6px rgba(7,27,51,.10)" : "none",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <p style={{ margin: "6px 0 0", fontSize: ".76rem", color: "#a0aec0" }}>
              {role === "parent"
                ? "Have a child in both programs? Pick which child's account to view."
                : "Registered for both? Pick the one you want to sign into."}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="login-email" style={{ display: "block", fontWeight: 700, fontSize: ".85rem", color: "#344054", marginBottom: 6 }}>
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={role === "founder" ? "founder@email.com" : role === "teacher" ? "teacher@email.com" : role === "parent" ? "parent@gmail.com" : "student@gmail.com"}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #dce5ef", fontSize: ".95rem", boxSizing: "border-box", outline: "none" }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label htmlFor="login-password" style={{ display: "block", fontWeight: 700, fontSize: ".85rem", color: "#344054" }}>
                Password
              </label>
              {role === "student" && (
                <Link href="/forgot-password" style={{ color: "#155eef", fontWeight: 600, textDecoration: "none", fontSize: ".8rem" }}>
                  Forgot password?
                </Link>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <input
                id="login-password"
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: "100%", padding: "11px 44px 11px 14px", borderRadius: 10, border: "1.5px solid #dce5ef", fontSize: ".95rem", boxSizing: "border-box", outline: "none" }}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6b7c93", fontSize: ".8rem", fontWeight: 600 }}
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: "#fff2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: "#c62828", fontSize: ".85rem", fontWeight: 600 }}>
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", minHeight: 46, fontSize: "1rem", borderRadius: 12 }}
          >
            {loading ? "Signing in…" : `Sign in as ${ROLE_LABELS[role]} →`}
          </button>
        </form>

        {role === "parent" && (
          <p style={{ textAlign: "center", marginTop: 20, fontSize: ".85rem", color: "#6b7c93" }}>
            Your login is set up by the tutor. Contact Ibrahim if you need access.
          </p>
        )}
        {role === "teacher" && (
          <p style={{ textAlign: "center", marginTop: 20, fontSize: ".85rem", color: "#6b7c93" }}>
            Teacher accounts are created by the founder. Contact Ibrahim if you need access.
          </p>
        )}
        {role === "student" && (
          <p style={{ textAlign: "center", marginTop: 20, fontSize: ".85rem", color: "#6b7c93" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "#155eef", fontWeight: 700, textDecoration: "none" }}>
              Register now →
            </Link>
          </p>
        )}
      </div>

      <p style={{ marginTop: 24, fontSize: ".78rem", color: "#a0aec0" }}>
        © 2026 The Digital Tutor · Independent SAT preparation
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
