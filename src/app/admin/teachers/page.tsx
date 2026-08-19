"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Teacher { id: string; name: string; email: string; created_at: string; }

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const d = await fetch("/api/admin/teachers").then(r => r.json());
    setTeachers(d.teachers ?? []);
    setLoading(false);
  }

  async function createTeacher() {
    if (!name || !email) { setError("All fields required."); return; }
    setSaving(true); setError(""); setSuccess("");
    const r = await fetch("/api/admin/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const d = await r.json();
    if (!r.ok) { setError(d.error ?? "Failed"); setSaving(false); return; }
    setSuccess("Teacher account created — they've been emailed a link to set their password.");
    setName(""); setEmail("");
    await load();
    setSaving(false);
  }

  async function removeTeacher(id: string, teacherName: string) {
    if (!confirm(`Delete teacher account for "${teacherName}"? This cannot be undone.`)) return;
    await fetch("/api/admin/teachers", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setTeachers(t => t.filter(x => x.id !== id));
  }

  return (
    <section className="section"><div className="container">
      <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "8px 0 4px" }}>Teacher Accounts</h1>
      <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: "0 0 28px" }}>
        Create teacher logins. Teachers get the same admin dashboard as you, except they can&apos;t manage access requests,
        payment verification, parent accounts, other teacher accounts, or the diagnostic quiz.
      </p>

      {/* Create form */}
      <div className="card" style={{ marginBottom: 28, border: "2px solid #e8eef6" }}>
        <h3 style={{ margin: "0 0 18px", color: "#071b33", fontSize: "1rem" }}>Add a new teacher</h3>
        <div className="form-grid" style={{ marginBottom: 14 }}>
          <div className="field">
            <label>Full name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sara Ahmed" />
          </div>
          <div className="field">
            <label>Email *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="teacher@gmail.com" />
          </div>
        </div>
        <p style={{ color: "#a0aec0", fontSize: ".8rem", margin: "-6px 0 14px" }}>
          They&apos;ll be emailed a link to set their own password — no need to share one manually.
        </p>
        {error   && <p style={{ color: "#dc2626", fontWeight: 600, fontSize: ".85rem", marginBottom: 10 }}>⚠ {error}</p>}
        {success && <p style={{ color: "#15803d", fontWeight: 600, fontSize: ".85rem", marginBottom: 10 }}>✓ {success}</p>}
        <button className="btn btn-primary" onClick={createTeacher} disabled={saving} style={{ padding: "10px 24px" }}>
          {saving ? "Creating…" : "Create teacher account →"}
        </button>
      </div>

      {/* Existing teachers */}
      {loading ? <p>Loading…</p> : teachers.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>
          <div style={{ fontSize: "2rem", marginBottom: 10 }}>👨‍🏫</div>
          <p style={{ fontWeight: 700 }}>No teacher accounts yet</p>
          <p style={{ fontSize: ".88rem" }}>Create one above to get started.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {teachers.map(t => (
            <div key={t.id} className="card" style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800, color: "#071b33" }}>{t.name}</div>
                <div style={{ fontSize: ".82rem", color: "#6b7c93" }}>{t.email}</div>
                <div style={{ fontSize: ".75rem", color: "#a0aec0", marginTop: 2 }}>Created {new Date(t.created_at).toLocaleDateString()}</div>
              </div>
              <button onClick={() => removeTeacher(t.id, t.name)} style={{ padding: "7px 14px", borderRadius: 8, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div></section>
  );
}
