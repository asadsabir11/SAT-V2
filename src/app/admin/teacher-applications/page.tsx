"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface TeacherApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string;
  createdAt: string;
}

export default function AdminTeacherApplications() {
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/teacher-applications")
      .then((r) => r.json())
      .then((d) => setApplications(d.applications ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function deleteApplication(id: string, name: string) {
    if (!confirm(`Delete the application from "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/teacher-applications/${id}`, { method: "DELETE" });
    setApplications((a) => a.filter((x) => x.id !== id));
  }

  return (
    <section className="section">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>Teacher Applications</h1>
          <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>
            {applications.length} application{applications.length === 1 ? "" : "s"} — review resumes and contact
            candidates by phone.
          </p>
        </div>

        {loading ? (
          <div className="card"><p>Loading…</p></div>
        ) : applications.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>👨‍🏫</div>
            <p>No applications yet.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Resume</th>
                    <th>Applied</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 700, color: "#071b33" }}>{a.name}</td>
                      <td style={{ fontSize: ".85rem" }}>{a.email}</td>
                      <td style={{ fontSize: ".85rem" }}>{a.phone}</td>
                      <td>
                        <a href={a.resumeUrl} target="_blank" rel="noreferrer" style={{ color: "#155eef", fontWeight: 700, fontSize: ".85rem" }}>
                          View →
                        </a>
                      </td>
                      <td style={{ fontSize: ".83rem", whiteSpace: "nowrap" }}>{new Date(a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                      <td>
                        <button onClick={() => deleteApplication(a.id, a.name)}
                          style={{ padding: "4px 10px", borderRadius: 6, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".75rem", cursor: "pointer" }}>
                          Delete
                        </button>
                      </td>
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
