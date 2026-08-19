"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Link_ { id: string; parent_id: string; parent_name: string; parent_email: string; student_id: string; student_name: string; student_email: string; created_at: string; }
interface Student { id: string; name: string; email: string; parentName?: string; parentEmail?: string; }
interface UnlinkedParent { id: string; name: string; email: string; created_at: string; }

export function AdminParentsPanel({ program, title, description }: { program: "sat" | "o-level"; title: string; description: string }) {
  const [links, setLinks]       = useState<Link_[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [unlinkedParents, setUnlinkedParents] = useState<UnlinkedParent[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const [studentId, setStudentId]   = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentName, setParentName]   = useState("");

  const [searchEmail, setSearchEmail]     = useState("");
  const [searching, setSearching]         = useState(false);
  const [searchResults, setSearchResults] = useState<Student[] | null>(null);
  const [searchError, setSearchError]     = useState("");

  useEffect(() => { load(); }, []);

  async function searchByParentEmail() {
    if (!searchEmail.trim()) return;
    setSearching(true); setSearchError(""); setSearchResults(null);
    try {
      const r = await fetch(`/api/admin/parents/search?parentEmail=${encodeURIComponent(searchEmail.trim())}&program=${program}`);
      const d = await r.json();
      if (!r.ok) { setSearchError(d.error ?? "Search failed"); return; }
      setSearchResults(d.students ?? []);
      if ((d.students ?? []).length === 1) {
        selectFoundStudent(d.students[0]);
      }
    } catch {
      setSearchError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  function selectFoundStudent(s: Student) {
    setStudentId(s.id);
    setParentEmail(searchEmail.trim());
    setParentName(s.parentName ?? "");
    setSuccess(""); setError("");
  }

  function selectStudentFromDropdown(id: string) {
    setStudentId(id);
    const s = students.find(x => x.id === id);
    setParentName(s?.parentName ?? "");
    setParentEmail(s?.parentEmail ?? "");
    setSuccess(""); setError("");
  }

  async function load() {
    const d = await fetch(`/api/admin/parents?program=${program}`).then(r => r.json());
    setLinks(d.links ?? []);
    setStudents(d.students ?? []);
    setUnlinkedParents(d.unlinkedParents ?? []);
    setLoading(false);
  }

  function linkExistingParent(p: UnlinkedParent) {
    setParentName(p.name);
    setParentEmail(p.email);
    setStudentId("");
    setSuccess(""); setError("");
  }

  async function createLink() {
    if (!studentId || !parentEmail || !parentName) { setError("All fields required."); return; }
    setSaving(true); setError(""); setSuccess("");
    const r = await fetch("/api/admin/parents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, parentEmail, parentName }),
    });
    const d = await r.json();
    if (!r.ok) { setError(d.error ?? "Failed"); setSaving(false); return; }
    setSuccess(d.emailed ? "Parent account created and linked — they've been emailed a set-password link." : "Existing parent account linked to this student.");
    setStudentId(""); setParentEmail(""); setParentName("");
    setSearchEmail(""); setSearchResults(null);
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
      <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "8px 0 4px" }}>{title}</h1>
      <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: "0 0 28px" }}>{description}</p>

      {/* Search by parent email — auto-finds the student from their registration form */}
      <div className="card" style={{ marginBottom: 20, background: "#f8fafc", border: "2px dashed #cbd5e1" }}>
        <h3 style={{ margin: "0 0 6px", color: "#071b33", fontSize: "1rem" }}>Find student by parent email</h3>
        <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: "0 0 14px" }}>
          Looks up the parent email the student entered on their registration form and matches it to their account —
          faster than hunting through the dropdown below.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div className="field" style={{ flex: "1 1 240px" }}>
            <input
              type="email"
              value={searchEmail}
              onChange={e => setSearchEmail(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); searchByParentEmail(); } }}
              placeholder="parent@gmail.com"
            />
          </div>
          <button className="btn btn-secondary" onClick={searchByParentEmail} disabled={searching || !searchEmail.trim()} style={{ padding: "0 22px", minHeight: 48 }}>
            {searching ? "Searching…" : "Search →"}
          </button>
        </div>
        {searchError && <p style={{ color: "#dc2626", fontWeight: 600, fontSize: ".85rem", margin: "10px 0 0" }}>⚠ {searchError}</p>}
        {searchResults && searchResults.length === 0 && (
          <p style={{ color: "#92400e", fontSize: ".85rem", margin: "10px 0 0" }}>
            No student found with this parent email on file. They may not have registered yet, or used a different email — you can still search the dropdown below.
          </p>
        )}
        {searchResults && searchResults.length > 0 && (
          <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
            {searchResults.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => selectFoundStudent(s)}
                style={{
                  textAlign: "left", padding: "10px 14px", borderRadius: 9, cursor: "pointer",
                  border: studentId === s.id ? "2px solid #15803d" : "1.5px solid #dce5ef",
                  background: studentId === s.id ? "#f0fdf4" : "#fff",
                }}
              >
                <span style={{ fontWeight: 700, color: "#071b33" }}>{studentId === s.id ? "✓ " : ""}{s.name}</span>
                <span style={{ color: "#6b7c93", fontSize: ".85rem" }}> · {s.email}</span>
              </button>
            ))}
            {searchResults.length > 1 && (
              <p style={{ color: "#6b7c93", fontSize: ".78rem", margin: 0 }}>
                {searchResults.length} students share this parent email — pick the right one above.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Create form */}
      <div className="card" style={{ marginBottom: 28, border: "2px solid #e8eef6" }}>
        <h3 style={{ margin: "0 0 18px", color: "#071b33", fontSize: "1rem" }}>Link a new parent</h3>
        <div className="form-grid" style={{ marginBottom: 14 }}>
          <div className="field">
            <label>Student * <span style={{ color: "#6b7c93", fontWeight: 400 }}>(or use the search above)</span></label>
            <select value={studentId} onChange={e => selectStudentFromDropdown(e.target.value)}>
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
        </div>
        <p style={{ color: "#6b7c93", fontSize: ".78rem", margin: "0 0 14px" }}>
          A parent with a child in both programs can be linked here separately from the {program === "sat" ? "O Level" : "SAT"}
          {" "}module using the same email — each gets its own login scoped to that child.
        </p>
        {error   && <p style={{ color: "#dc2626", fontWeight: 600, fontSize: ".85rem", marginBottom: 10 }}>⚠ {error}</p>}
        {success && <p style={{ color: "#15803d", fontWeight: 600, fontSize: ".85rem", marginBottom: 10 }}>✓ {success}</p>}
        <button className="btn btn-primary" onClick={createLink} disabled={saving} style={{ padding: "10px 24px" }}>
          {saving ? "Creating…" : "Create parent account →"}
        </button>
      </div>

      {/* Unlinked parent accounts — created but never linked to a student, so
          they'd otherwise be invisible below (that list only shows links). */}
      {!loading && unlinkedParents.length > 0 && (
        <div className="card" style={{ marginBottom: 28, background: "#fffbeb", border: "1.5px solid #fde68a" }}>
          <h3 style={{ margin: "0 0 4px", color: "#92400e", fontSize: "1rem" }}>⚠ Unlinked parent accounts</h3>
          <p style={{ color: "#78350f", fontSize: ".82rem", margin: "0 0 14px" }}>
            These accounts exist but aren&apos;t linked to any student yet — they can sign in, but the portal will
            say &quot;no student linked.&quot;
          </p>
          <div style={{ display: "grid", gap: 8 }}>
            {unlinkedParents.map(p => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, padding: "10px 14px", borderRadius: 9, background: "#fff", border: "1.5px solid #fde68a" }}>
                <div>
                  <div style={{ fontWeight: 800, color: "#071b33" }}>{p.name}</div>
                  <div style={{ fontSize: ".82rem", color: "#6b7c93" }}>{p.email}</div>
                </div>
                <button
                  onClick={() => linkExistingParent(p)}
                  style={{ padding: "6px 14px", borderRadius: 8, background: "#fef3c7", border: "none", color: "#92400e", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}
                >
                  Link to a student →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
