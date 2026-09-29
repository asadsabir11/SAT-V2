"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import { getOLevelSubjects } from "@/lib/academy/data";

type Category = "mathematics" | "computer-science" | "english-language" | "islamiyat" | "pakistan-studies" | "physics";

interface Assignment {
  id: string;
  title: string;
  description: string;
  attachment_url: string;
  category: Category;
  due_at: string | null;
  max_marks: number | null;
  is_published: boolean;
  created_at: string;
}

const SUBJECT_ICON: Record<Category, string> = {
  mathematics: "📐", "computer-science": "💻", "english-language": "📖", islamiyat: "🕌", "pakistan-studies": "🌍", physics: "⚛️",
};
const SUBJECTS = getOLevelSubjects().map((s) => ({ slug: s.slug as Category, name: s.name }));

// due_at from the API is a UTC ISO string — a <input type="datetime-local">
// needs the equivalent LOCAL wall-clock time, or the edit form shows the
// UTC reading shifted by the browser's timezone offset instead of the
// actual scheduled time.
function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function fmtDue(d: string | null) {
  if (!d) return "No due date";
  return new Date(d).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
}

export default function AdminOLevelAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>(SUBJECTS[0].slug);
  const [dueAt, setDueAt] = useState("");
  const [maxMarks, setMaxMarks] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState<Category>(SUBJECTS[0].slug);
  const [editDueAt, setEditDueAt] = useState("");
  const [editMaxMarks, setEditMaxMarks] = useState("");

  const [filterSubject, setFilterSubject] = useState<"all" | Category>("all");

  function loadAssignments() {
    return fetch("/api/admin/o-level-assignments").then((r) => r.json()).then((d) => setAssignments(d.assignments ?? []));
  }

  useEffect(() => {
    loadAssignments().finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!title.trim()) return;
    setUploading(true);
    setUploadError("");
    setUploadProgress(0);
    try {
      let attachmentUrl = "";
      if (file) {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/o-level/assignments/upload",
          onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage)),
        }).catch((e) => { throw new Error(`Attachment upload failed: ${e?.message ?? e}`); });
        attachmentUrl = blob.url;
      }
      const res = await fetch("/api/admin/o-level-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, attachment_url: attachmentUrl, category,
          due_at: dueAt ? new Date(dueAt).toISOString() : null,
          max_marks: maxMarks ? Number(maxMarks) : null,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(`Save failed (${res.status}): ${errBody.error ?? "unknown error"}`);
      }
      await loadAssignments();
      setTitle("");
      setDescription("");
      setDueAt("");
      setMaxMarks("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setUploadProgress(0);
    } catch (err) {
      setUploadError(`Failed — ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploading(false);
    }
  }

  async function togglePublish(a: Assignment) {
    const action = a.is_published ? "unpublish" : "publish";
    await fetch(`/api/admin/o-level-assignments/${a.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }),
    });
    setAssignments((as) => as.map((x) => (x.id === a.id ? { ...x, is_published: !x.is_published } : x)));
  }

  async function deleteAssignment(id: string) {
    if (!confirm("Delete this assignment and all its submissions? This cannot be undone.")) return;
    await fetch(`/api/admin/o-level-assignments/${id}`, { method: "DELETE" });
    setAssignments((as) => as.filter((x) => x.id !== id));
  }

  async function saveEdit(id: string) {
    await fetch(`/api/admin/o-level-assignments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle, description: editDesc, category: editCategory,
        due_at: editDueAt ? new Date(editDueAt).toISOString() : null,
        max_marks: editMaxMarks ? Number(editMaxMarks) : null,
      }),
    });
    setAssignments((as) => as.map((x) => (x.id === id
      ? { ...x, title: editTitle, description: editDesc, category: editCategory, due_at: editDueAt ? new Date(editDueAt).toISOString() : null, max_marks: editMaxMarks ? Number(editMaxMarks) : null }
      : x)));
    setEditingId(null);
  }

  const published = assignments.filter((a) => a.is_published).length;
  const visible = filterSubject === "all" ? assignments : assignments.filter((a) => a.category === filterSubject);

  return (
    <section className="section">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <div>
            <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>O Level — Assignments</h1>
            <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>
              {assignments.length} total · {published} published · {assignments.length - published} draft
            </p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 28, border: "2px solid #e8eef6" }}>
          <h3 style={{ margin: "0 0 18px", color: "#071b33", fontSize: "1rem" }}>New assignment</h3>

          <div className="form-grid" style={{ marginBottom: 14 }}>
            <div className="field">
              <label>Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chapter 3 — Practice questions" />
            </div>
            <div className="field">
              <label>Instructions</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What students need to do…" />
            </div>
          </div>

          <div className="field" style={{ marginBottom: 14 }}>
            <label>Subject *</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {SUBJECTS.map(({ slug, name }) => (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setCategory(slug)}
                  style={{
                    padding: "8px 14px", borderRadius: 8, fontWeight: 700, fontSize: ".85rem", cursor: "pointer",
                    border: category === slug ? "2px solid #155eef" : "2px solid #e8eef6",
                    background: category === slug ? "#eff6ff" : "#f8fafc",
                    color: category === slug ? "#155eef" : "#6b7c93",
                  }}
                >
                  {SUBJECT_ICON[slug]} {name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-grid" style={{ marginBottom: 14 }}>
            <div className="field">
              <label>Due date (optional)</label>
              <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
            </div>
            <div className="field">
              <label>Max marks (optional)</label>
              <input type="number" min={1} value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} placeholder="e.g. 10" />
            </div>
          </div>

          <div className="field" style={{ marginBottom: 16 }}>
            <label>Attachment (optional — PDF, DOC/DOCX, JPG, PNG)</label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{ border: `2px dashed ${file ? "#10b981" : "#c8d5e3"}`, borderRadius: 10, padding: "16px 20px", textAlign: "center", cursor: "pointer", background: file ? "#f0fdf4" : "#f8fafc" }}
            >
              {file ? <p style={{ fontWeight: 700, color: "#065f46", margin: 0, fontSize: ".88rem" }}>📎 {file.name} · Click to change</p> : <p style={{ color: "#6b7c93", margin: 0, fontSize: ".88rem" }}>📎 Click to attach a file (optional)</p>}
            </div>
            <input ref={fileRef} type="file" accept="application/pdf,.doc,.docx,image/*" style={{ display: "none" }} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>

          {uploading && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: ".82rem", fontWeight: 700, color: "#344054" }}>
                <span>Saving…</span><span>{uploadProgress}%</span>
              </div>
              <div style={{ height: 8, background: "#e8eef6", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${uploadProgress}%`, background: "linear-gradient(90deg,#155eef,#18a999)", borderRadius: 99 }} />
              </div>
            </div>
          )}
          {uploadError && <p style={{ color: "#dc2626", fontSize: ".85rem", marginBottom: 12, fontWeight: 600 }}>⚠ {uploadError}</p>}

          <button className="btn btn-primary" onClick={handleCreate} disabled={uploading || !title.trim()} style={{ minWidth: 180 }}>
            {uploading ? "Saving…" : "Create assignment"}
          </button>
        </div>

        {!loading && assignments.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <button onClick={() => setFilterSubject("all")} style={{ padding: "7px 16px", borderRadius: 999, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", border: filterSubject === "all" ? "2px solid #155eef" : "2px solid #e8eef6", background: filterSubject === "all" ? "#eff6ff" : "#fff", color: filterSubject === "all" ? "#155eef" : "#6b7c93" }}>
              All
            </button>
            {SUBJECTS.map(({ slug, name }) => (
              <button key={slug} onClick={() => setFilterSubject(slug)} style={{ padding: "7px 16px", borderRadius: 999, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", border: filterSubject === slug ? "2px solid #155eef" : "2px solid #e8eef6", background: filterSubject === slug ? "#eff6ff" : "#fff", color: filterSubject === slug ? "#155eef" : "#6b7c93" }}>
                {SUBJECT_ICON[slug]} {name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="card"><p>Loading assignments…</p></div>
        ) : visible.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📋</div>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>No assignments yet</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {visible.map((a) => (
              <div key={a.id} className="card" style={{ padding: "16px 20px", border: editingId === a.id ? "2px solid #155eef" : "1px solid #e8eef6" }}>
                {editingId === a.id ? (
                  <div>
                    <div className="form-grid" style={{ marginBottom: 12 }}>
                      <div className="field"><label>Title *</label><input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} /></div>
                      <div className="field"><label>Instructions</label><input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} /></div>
                    </div>
                    <div className="field" style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: ".82rem", fontWeight: 700, color: "#344054", display: "block", marginBottom: 6 }}>Subject</label>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {SUBJECTS.map(({ slug, name }) => (
                          <button key={slug} type="button" onClick={() => setEditCategory(slug)} style={{ padding: "7px 14px", borderRadius: 8, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", border: editCategory === slug ? "2px solid #155eef" : "2px solid #e8eef6", background: editCategory === slug ? "#eff6ff" : "#f8fafc", color: editCategory === slug ? "#155eef" : "#6b7c93" }}>
                            {SUBJECT_ICON[slug]} {name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-grid" style={{ marginBottom: 12 }}>
                      <div className="field"><label>Due date</label><input type="datetime-local" value={editDueAt} onChange={(e) => setEditDueAt(e.target.value)} /></div>
                      <div className="field"><label>Max marks</label><input type="number" min={1} value={editMaxMarks} onChange={(e) => setEditMaxMarks(e.target.value)} /></div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-primary" onClick={() => saveEdit(a.id)} disabled={!editTitle.trim()} style={{ padding: "8px 18px", fontSize: ".85rem" }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ padding: "8px 16px", borderRadius: 8, background: "#f1f5f9", border: "none", fontWeight: 700, cursor: "pointer", color: "#6b7c93", fontSize: ".85rem" }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: "#eff6ff", color: "#155eef" }}>
                          {SUBJECT_ICON[a.category]} {SUBJECTS.find((s) => s.slug === a.category)?.name ?? a.category}
                        </span>
                        <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: a.is_published ? "#d1fae5" : "#f3f4f6", color: a.is_published ? "#065f46" : "#6b7c93" }}>
                          {a.is_published ? "● Published" : "○ Draft"}
                        </span>
                        {a.max_marks && <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>{a.max_marks} marks</span>}
                      </div>
                      <p style={{ fontWeight: 700, color: "#071b33", margin: "0 0 2px", fontSize: ".95rem" }}>{a.title}</p>
                      {a.description && <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: 0 }}>{a.description}</p>}
                      <p style={{ color: "#a0aec0", fontSize: ".75rem", margin: "6px 0 0" }}>Due: {fmtDue(a.due_at)}</p>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <Link href={`/admin/o-level-assignments/${a.id}`} style={{ padding: "6px 12px", borderRadius: 8, background: "#f0fdf4", border: "none", color: "#15803d", fontWeight: 700, fontSize: ".78rem", cursor: "pointer", textDecoration: "none" }}>
                        Submissions
                      </Link>
                      <button onClick={() => { setEditingId(a.id); setEditTitle(a.title); setEditDesc(a.description); setEditCategory(a.category); setEditDueAt(a.due_at ? toLocalInputValue(a.due_at) : ""); setEditMaxMarks(a.max_marks ? String(a.max_marks) : ""); }} style={{ padding: "6px 12px", borderRadius: 8, background: "#eff6ff", border: "none", color: "#155eef", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>
                        Edit
                      </button>
                      <button onClick={() => togglePublish(a)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: ".78rem", cursor: "pointer", background: a.is_published ? "#fef3c7" : "#d1fae5", color: a.is_published ? "#92400e" : "#065f46" }}>
                        {a.is_published ? "Unpublish" : "Publish"}
                      </button>
                      <button onClick={() => deleteAssignment(a.id)} style={{ padding: "6px 12px", borderRadius: 8, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
