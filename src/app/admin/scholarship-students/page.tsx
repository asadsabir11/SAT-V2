"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Application {
  id: string;
  program: "sat" | "o-level";
  student_user_id: string | null;
  student_name: string;
  student_email: string | null;
  parent_email: string;
  scholarship_percentage: number | null;
  updated_at: string;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminScholarshipStudents() {
  const [students, setStudents] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [programFilter, setProgramFilter] = useState<"all" | "sat" | "o-level">("all");

  useEffect(() => {
    fetch("/api/admin/scholarships")
      .then(r => r.json())
      .then(d => setStudents((d.applications ?? []).filter((a: Application) => a.student_user_id)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = programFilter === "all" ? students : students.filter(s => s.program === programFilter);
  const satCount = students.filter(s => s.program === "sat").length;
  const oLevelCount = students.filter(s => s.program === "o-level").length;

  return (
    <section className="section">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>Scholarship Students</h1>
          <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>
            {students.length} scholarship student{students.length === 1 ? "" : "s"} with an active account. Manage
            applications and approvals in <Link href="/admin/scholarships" style={{ color: "#155eef", fontWeight: 700 }}>Scholarship applications →</Link>
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {([["all", `All (${students.length})`], ["sat", `SAT (${satCount})`], ["o-level", `O Level (${oLevelCount})`]] as const).map(([value, label]) => {
            const active = programFilter === value;
            return (
              <button key={value} onClick={() => setProgramFilter(value)} style={{ padding: "7px 16px", borderRadius: 999, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", border: active ? "2px solid #b45309" : "2px solid #e8eef6", background: active ? "#fffbeb" : "#fff", color: active ? "#92400e" : "#6b7c93" }}>
                {label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="card"><p>Loading…</p></div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>🎓</div>
            <p>No scholarship students yet. Accounts appear here once created from an approved application.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Program</th>
                    <th>Account email</th>
                    <th>Scholarship</th>
                    <th>Account created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700, color: "#071b33" }}>{s.student_name}</td>
                      <td style={{ fontSize: ".83rem" }}>{s.program === "o-level" ? "O Level" : "SAT"}</td>
                      <td style={{ fontSize: ".83rem" }}>{s.student_email || s.parent_email}</td>
                      <td style={{ fontSize: ".83rem" }}>{s.scholarship_percentage != null ? `${s.scholarship_percentage}%` : "—"}</td>
                      <td style={{ fontSize: ".83rem", whiteSpace: "nowrap" }}>{fmtDate(s.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
