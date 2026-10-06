"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Program = "sat" | "o-level" | "punjab-9th";
type Status = "open" | "full";

const PROGRAM_META: Record<Program, { label: string; icon: string }> = {
  sat: { label: "SAT® Preparation", icon: "🎓" },
  "o-level": { label: "Cambridge O Level / IGCSE", icon: "📘" },
  "punjab-9th": { label: "9th Class (Punjab Board)", icon: "📗" },
};
const PROGRAMS: Program[] = ["sat", "o-level", "punjab-9th"];

export default function AdminEnrollmentStatus() {
  const [statuses, setStatuses] = useState<Record<Program, Status>>({ sat: "open", "o-level": "open", "punjab-9th": "open" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Program | null>(null);

  useEffect(() => {
    fetch("/api/admin/enrollment-status").then((r) => r.json()).then((d) => {
      if (d.statuses) setStatuses(d.statuses);
    }).finally(() => setLoading(false));
  }, []);

  async function toggle(program: Program) {
    const next: Status = statuses[program] === "full" ? "open" : "full";
    setSaving(program);
    await fetch("/api/admin/enrollment-status", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ program, status: next }),
    });
    setStatuses((s) => ({ ...s, [program]: next }));
    setSaving(null);
  }

  return (
    <section className="section">
      <div className="container">
        <div style={{ marginBottom: 28 }}>
          <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>Enrollment Status</h1>
          <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0, maxWidth: 560 }}>
            Mark a program &ldquo;Fully Booked&rdquo; once you&apos;ve hit your headcount — a badge appears on its home page card. The Explore button and signup flow are unaffected; this is informational only.
          </p>
        </div>

        {loading ? (
          <div className="card"><p>Loading…</p></div>
        ) : (
          <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
            {PROGRAMS.map((p) => {
              const full = statuses[p] === "full";
              return (
                <div key={p} className="card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ fontSize: "1.5rem" }}>{PROGRAM_META[p].icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, color: "#071b33", margin: "0 0 4px", fontSize: ".95rem" }}>{PROGRAM_META[p].label}</p>
                    <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".75rem", fontWeight: 700, background: full ? "#fee2e2" : "#d1fae5", color: full ? "#991b1b" : "#065f46" }}>
                      {full ? "🔴 Fully Booked" : "🟢 Open"}
                    </span>
                  </div>
                  <button
                    onClick={() => toggle(p)}
                    disabled={saving === p}
                    style={{
                      padding: "9px 18px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: ".85rem", cursor: "pointer",
                      background: full ? "#d1fae5" : "#fee2e2", color: full ? "#065f46" : "#991b1b",
                    }}
                  >
                    {saving === p ? "Saving…" : full ? "Mark Open" : "Mark Fully Booked"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
