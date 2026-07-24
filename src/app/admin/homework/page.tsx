"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Assignment { id: string; week_no: number; title: string; due_at: string | null; }
interface Student    { id: string; name: string; }
interface Submission { student_id: string; assignment_id: string; status: string; }

export default function AdminHomework() {
  const [week, setWeek]             = useState(1);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents]     = useState<Student[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading]       = useState(true);
  const [newTitle, setNewTitle]     = useState("");
  const [newDue, setNewDue]         = useState("");
  const [saving, setSaving]         = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const d = await fetch(`/api/admin/homework?week=${week}`).then(r => r.json());
    setAssignments(d.assignments ?? []);
    setStudents(d.students ?? []);
    setSubmissions(d.submissions ?? []);
    setLoading(false);
  }, [week]);

  useEffect(() => { load(); }, [load]);

  async function addAssignment() {
    if (!newTitle.trim()) return;
    setSaving(true);
    await fetch("/api/admin/homework", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", weekNo: week, title: newTitle.trim(), dueAt: newDue || undefined }),
    });
    setNewTitle(""); setNewDue("");
    await load();
    setSaving(false);
  }

  async function deleteAssignment(id: string) {
    if (!confirm("Delete this assignment?")) return;
    await fetch("/api/admin/homework", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
    setAssignments(a => a.filter(x => x.id !== id));
    setSubmissions(s => s.filter(x => x.assignment_id !== id));
  }

  async function mark(studentId: string, assignmentId: string, status: "assigned" | "done" | "missed") {
    await fetch("/api/admin/homework", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark", studentId, assignmentId, status }),
    });
    setSubmissions(s => {
      const existing = s.find(x => x.student_id === studentId && x.assignment_id === assignmentId);
      if (existing) return s.map(x => x.student_id === studentId && x.assignment_id === assignmentId ? { ...x, status } : x);
      return [...s, { student_id: studentId, assignment_id: assignmentId, status }];
    });
  }

  function getStatus(studentId: string, assignmentId: string) {
    return submissions.find(s => s.student_id === studentId && s.assignment_id === assignmentId)?.status ?? "assigned";
  }

  const STATUS_BTN = [
    { value: "done",     label: "✓ Done",   bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
    { value: "missed",   label: "✗ Missed", bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" },
    { value: "assigned", label: "Pending",  bg: "#f3f4f6", color: "#6b7c93", border: "#e8eef6" },
  ] as const;

  return (
    <section className="section"><div className="container">
      <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, margin: "8px 0 24px" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "0 0 4px" }}>Homework</h1>
          <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>Create assignments and track completion per student.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ fontWeight: 700, fontSize: ".88rem", color: "#344054" }}>Week:</label>
          <select value={week} onChange={e => setWeek(Number(e.target.value))} style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #d0dcea", fontWeight: 700 }}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(w => <option key={w} value={w}>Week {w}</option>)}
          </select>
        </div>
      </div>

      {/* Add assignment */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: ".95rem", color: "#071b33" }}>Add assignment — Week {week}</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Assignment title…" style={{ flex: 1, minWidth: 200, padding: "10px 14px", borderRadius: 10, border: "1.5px solid #d0dcea", fontSize: ".9rem" }} onKeyDown={e => e.key === "Enter" && addAssignment()} />
          <input type="date" value={newDue} onChange={e => setNewDue(e.target.value)} style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid #d0dcea", fontSize: ".9rem" }} />
          <button className="btn btn-primary" onClick={addAssignment} disabled={saving || !newTitle.trim()} style={{ padding: "10px 20px" }}>
            {saving ? "Adding…" : "+ Add"}
          </button>
        </div>
      </div>

      {loading ? <p style={{ color: "#6b7c93" }}>Loading…</p> : assignments.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7c93" }}>
          <div style={{ fontSize: "2rem", marginBottom: 10 }}>📚</div>
          <p style={{ fontWeight: 700 }}>No assignments for Week {week}</p>
          <p style={{ fontSize: ".88rem" }}>Add one above to start tracking.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 14, overflow: "hidden", border: "1.5px solid #e8eef6" }}>
            <thead>
              <tr style={{ background: "#fafcff" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 800, fontSize: ".78rem", color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".06em" }}>Assignment</th>
                {students.map(s => <th key={s.id} style={{ padding: "12px 14px", textAlign: "center", fontWeight: 800, fontSize: ".78rem", color: "#6b7c93", textTransform: "uppercase", letterSpacing: ".06em" }}>{s.name.split(" ")[0]}</th>)}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a.id} style={{ borderTop: "1.5px solid #e8eef6" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 700, color: "#071b33", fontSize: ".9rem" }}>{a.title}</div>
                    {a.due_at && <div style={{ fontSize: ".75rem", color: "#6b7c93" }}>Due {new Date(a.due_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div>}
                  </td>
                  {students.map(s => {
                    const status = getStatus(s.id, a.id) as "assigned" | "done" | "missed";
                    const meta = STATUS_BTN.find(x => x.value === status)!;
                    return (
                      <td key={s.id} style={{ padding: "12px 14px", textAlign: "center" }}>
                        <select
                          value={status}
                          onChange={e => mark(s.id, a.id, e.target.value as "assigned" | "done" | "missed")}
                          style={{ padding: "6px 10px", borderRadius: 8, border: `1.5px solid ${meta.border}`, background: meta.bg, color: meta.color, fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}
                        >
                          <option value="assigned">Pending</option>
                          <option value="done">✓ Done</option>
                          <option value="missed">✗ Missed</option>
                        </select>
                      </td>
                    );
                  })}
                  <td style={{ padding: "12px 14px" }}>
                    <button onClick={() => deleteAssignment(a.id)} style={{ padding: "5px 10px", borderRadius: 6, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".75rem", cursor: "pointer" }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div></section>
  );
}
