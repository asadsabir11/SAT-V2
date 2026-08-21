"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Student { studentName: string; country: string; packageType: string; studentEmail: string; grade?: string; createdAt: string; }

export default function AdminSatStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin")
      .then(r => r.json())
      .then(d => setStudents(d.students ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function deleteStudent(email: string, name: string) {
    if (!confirm(`Delete "${name}" (${email})? This removes their account and all data.`)) return;
    await fetch(`/api/admin/students/${encodeURIComponent(email)}`, { method: "DELETE" });
    setStudents(s => s.filter(x => x.studentEmail !== email));
  }

  return (
    <section className="section">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>SAT Registered Students</h1>
          <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>{students.length} registration{students.length === 1 ? "" : "s"}</p>
        </div>

        {loading ? (
          <div className="card"><p>Loading…</p></div>
        ) : students.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
            <p>No student registrations yet. Submit the registration form to see data here.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Country</th>
                    <th>Package</th>
                    <th>Email</th>
                    <th>Grade</th>
                    <th>Registered</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={i}>
                      <td>{s.studentName}</td>
                      <td>{s.country}</td>
                      <td>{s.packageType}</td>
                      <td>{s.studentEmail}</td>
                      <td>{s.grade ?? "—"}</td>
                      <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => deleteStudent(s.studentEmail, s.studentName)}
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
