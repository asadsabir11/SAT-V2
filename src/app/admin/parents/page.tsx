"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Link_ { id: string; parent_id: string; parent_name: string; parent_email: string; student_id: string; student_name: string; student_email: string; created_at: string; }
interface Student { id: string; name: string; email: string; }

export default function AdminParents() {
  const [links, setLinks]       = useState<Link_[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const [studentId, setStudentId]   = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentName, setParentName]   = useState("");
  const [password, setPassword]       = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const d = await fetch("/api/admin/parents").then(r => r.json());
    setLinks(d.links ?? []);
    setStudents(d.students ?? []);
    setLoading(false);
  }

  async function createLink() {
    if (!studentId || !parentEmail || !parentName || !password) { setError("All fields required."); return; }
    setSaving(true); setError(""); setSuccess("");
    const r = await fetch("/api/admin/parents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, parentEmail, parentName, password }),
    });
    const d = await r.json();
    if (!r.ok) { setError(d.error ?? "Failed"); setSaving(false); return; }
    setSuccess("Parent account created and linked.");
    setStudentId(""); setParentEmail(""); setParentName(""); setPassword("");
    await load();
    setSaving(false);
  }

  async function removeLink(id: string) {
    if (!confirm("Remove this parent link?")) return;
    await fetch("/api/admin/parents", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setLinks(l => l.filter(x => x.id !== id));
  }

  return (
    <section className="section"><div className="container">
      <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "8px 0 4px" }}>Parent Accounts</h1>
      <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: "0 0 28px" }}>Create parent logins and link them to students. Parents can only see their own child's data.</p>

      {/* Create form */}
      <div className="card" style={{ marginBottom: 28, border: "2px solid #e8eef6" }}>
        <h3 style={{ margin: "0 0 18px", color: "#071b33", fontSize: "1rem" }}>Link a new parent</h3>
        <div className="form-grid" style={{ marginBottom: 14 }}>
          <div className="field">
            <label>Student *</label>
            <select value={studentId} onChange={e => setStudentId(e.target.value)}>
              <option value="">— Select student —</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
            </select>
          </div>
          <div className="field">
            <label>Parent name *</label>
            <input value={parentName} onChange={e => setParentName(e.target.value)} placeholder="e.g. Ahmed Khan" />
          </div>
          <div className="field">
            <label>Parent email *</label>
            <input type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="parent@gmail.com" />
          </div>
          <div className="field">
            <label>Temporary password *</label>
            <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Share this with the parent" />
          </div>
        </div>
        {error   && <p style={{ color: "#dc2626", fontWeight: 600, fontSize: ".85rem", marginBottom: 10 }}>⚠ {error}</p>}
        {success && <p style={{ color: "#15803d", fontWeight: 600, fontSize: ".85rem", marginBottom: 10 }}>✓ {success}</p>}
        <button className="btn btn-primary" onClick={createLink} disabled={saving} style={{ padding: "10px 24px" }}>
          {saving ? "Creating…" : "Create parent account →"}
        </button>
      </div>

      {/* Existing links */}
      {loading ? <p>Loading…</p> : links.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>
          <div style={{ fontSize: "2rem", marginBottom: 10 }}>👨‍👩‍👧</div>
          <p style={{ fontWeight: 700 }}>No parent accounts yet</p>
          <p style={{ fontSize: ".88rem" }}>Create one above to get started.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {links.map(l => (
            <div key={l.id} className="card" style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px" }}>
                <div>
                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", marginBottom: 2 }}>PARENT</div>
                  <div style={{ fontWeight: 800, color: "#071b33" }}>{l.parent_name}</div>
                  <div style={{ fontSize: ".82rem", color: "#6b7c93" }}>{l.parent_email}</div>
                </div>
                <div>
                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#6b7c93", marginBottom: 2 }}>STUDENT</div>
                  <div style={{ fontWeight: 800, color: "#071b33" }}>{l.student_name}</div>
                  <div style={{ fontSize: ".82rem", color: "#6b7c93" }}>{l.student_email}</div>
                </div>
              </div>
              <button onClick={() => removeLink(l.id)} style={{ padding: "7px 14px", borderRadius: 8, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div></section>
  );
}
