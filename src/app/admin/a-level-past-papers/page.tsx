"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";

type PaperType = "question_paper" | "mark_scheme" | "examiner_report" | "other";
type Subject = "computer-science-vol1" | "computer-science-vol2";
const SUBJECT_LABELS: Record<Subject, string> = {
  "computer-science-vol1": "CS 9618 Vol 1",
  "computer-science-vol2": "CS 9618 Vol 2",
};

interface Paper {
  id: string;
  subject: Subject;
  title: string;
  description: string;
  session: string;
  paper_type: PaperType;
  file_url: string;
  file_name: string;
  is_published: boolean;
  created_at: string;
}

const TYPE_META: Record<PaperType, { label: string; icon: string }> = {
  question_paper: { label: "Question Paper", icon: "📄" },
  mark_scheme: { label: "Mark Scheme", icon: "✅" },
  examiner_report: { label: "Examiner Report", icon: "📊" },
  other: { label: "Other", icon: "📎" },
};

export default function AdminALevelPastPapers() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  const [subject, setSubject] = useState<Subject>("computer-science-vol1");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [examSession, setExamSession] = useState("");
  const [paperType, setPaperType] = useState<PaperType>("question_paper");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function loadPapers() {
    return fetch("/api/admin/a-level-past-papers").then((r) => r.json()).then((d) => setPapers(d.papers ?? []));
  }

  useEffect(() => {
    loadPapers().finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!title.trim() || !file) return;
    setUploading(true);
    setUploadError("");
    setUploadProgress(0);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/a-level-past-papers/upload",
        onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage)),
      }).catch((e) => { throw new Error(`Upload failed: ${e?.message ?? e}`); });

      const res = await fetch("/api/admin/a-level-past-papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject, title, description, session: examSession, paper_type: paperType,
          file_url: blob.url, file_name: file.name,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(`Save failed (${res.status}): ${errBody.error ?? "unknown error"}`);
      }
      await loadPapers();
      setTitle(""); setDescription(""); setExamSession(""); setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setUploadProgress(0);
    } catch (err) {
      setUploadError(`Failed — ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploading(false);
    }
  }

  async function togglePublish(p: Paper) {
    const action = p.is_published ? "unpublish" : "publish";
    await fetch(`/api/admin/a-level-past-papers/${p.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }),
    });
    setPapers((ps) => ps.map((x) => (x.id === p.id ? { ...x, is_published: !x.is_published } : x)));
  }

  async function deletePaper(id: string) {
    if (!confirm("Delete this past paper? This cannot be undone.")) return;
    await fetch(`/api/admin/a-level-past-papers/${id}`, { method: "DELETE" });
    setPapers((ps) => ps.filter((x) => x.id !== id));
  }

  return (
    <section className="section">
      <div className="container">
        <div style={{ marginBottom: 28 }}>
          <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>A Level — Past Papers</h1>
          <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>{papers.length} total</p>
        </div>

        <div className="card" style={{ marginBottom: 28, border: "2px solid #e8eef6" }}>
          <h3 style={{ margin: "0 0 18px", color: "#071b33", fontSize: "1rem" }}>Upload past paper</h3>
          <div className="form-grid" style={{ marginBottom: 14 }}>
            <div className="field">
              <label>Subject *</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value as Subject)}>
                <option value="computer-science-vol1">{SUBJECT_LABELS["computer-science-vol1"]}</option>
                <option value="computer-science-vol2">{SUBJECT_LABELS["computer-science-vol2"]}</option>
              </select>
            </div>
            <div className="field">
              <label>Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. May/June 2024 Paper 1" />
            </div>
          </div>
          <div className="form-grid" style={{ marginBottom: 14 }}>
            <div className="field">
              <label>Description</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
          <div className="form-grid" style={{ marginBottom: 14 }}>
            <div className="field">
              <label>Exam session</label>
              <input value={examSession} onChange={(e) => setExamSession(e.target.value)} placeholder="e.g. May/June 2024" />
            </div>
            <div className="field">
              <label>Paper type *</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(Object.keys(TYPE_META) as PaperType[]).map((t) => (
                  <button key={t} type="button" onClick={() => setPaperType(t)} style={{ padding: "8px 12px", borderRadius: 8, fontWeight: 700, fontSize: ".8rem", cursor: "pointer", border: paperType === t ? "2px solid #be123c" : "2px solid #e8eef6", background: paperType === t ? "#fff1f2" : "#f8fafc", color: paperType === t ? "#be123c" : "#6b7c93" }}>
                    {TYPE_META[t].icon} {TYPE_META[t].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="field" style={{ marginBottom: 16 }}>
            <label>File (PDF) *</label>
            <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${file ? "#10b981" : "#c8d5e3"}`, borderRadius: 10, padding: "16px 20px", textAlign: "center", cursor: "pointer", background: file ? "#f0fdf4" : "#f8fafc" }}>
              {file ? <p style={{ fontWeight: 700, color: "#065f46", margin: 0, fontSize: ".88rem" }}>📎 {file.name} · Click to change</p> : <p style={{ color: "#6b7c93", margin: 0, fontSize: ".88rem" }}>📎 Click to choose a PDF</p>}
            </div>
            <input ref={fileRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>

          {uploading && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: ".82rem", fontWeight: 700, color: "#344054" }}>
                <span>Uploading…</span><span>{uploadProgress}%</span>
              </div>
              <div style={{ height: 8, background: "#e8eef6", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${uploadProgress}%`, background: "linear-gradient(90deg,#be123c,#fb7185)", borderRadius: 99 }} />
              </div>
            </div>
          )}
          {uploadError && <p style={{ color: "#dc2626", fontSize: ".85rem", marginBottom: 12, fontWeight: 600 }}>⚠ {uploadError}</p>}

          <button className="btn btn-primary" onClick={handleCreate} disabled={uploading || !title.trim() || !file} style={{ minWidth: 180, background: "#be123c", borderColor: "#be123c" }}>
            {uploading ? "Uploading…" : "Upload paper"}
          </button>
        </div>

        {loading ? (
          <div className="card"><p>Loading papers…</p></div>
        ) : papers.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📄</div>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>No past papers yet</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {papers.map((p) => (
              <div key={p.id} className="card" style={{ padding: "16px 20px", display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: "#f1f5f9", color: "#475569" }}>
                      {SUBJECT_LABELS[p.subject] ?? p.subject}
                    </span>
                    <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: "#fff1f2", color: "#be123c" }}>
                      {TYPE_META[p.paper_type].icon} {TYPE_META[p.paper_type].label}
                    </span>
                    <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: p.is_published ? "#d1fae5" : "#f3f4f6", color: p.is_published ? "#065f46" : "#6b7c93" }}>
                      {p.is_published ? "● Published" : "○ Draft"}
                    </span>
                  </div>
                  <p style={{ fontWeight: 700, color: "#071b33", margin: "0 0 2px", fontSize: ".95rem" }}>{p.title}</p>
                  <p style={{ color: "#a0aec0", fontSize: ".75rem", margin: "6px 0 0" }}>{p.session || "—"} · Created {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <a href={p.file_url} target="_blank" rel="noreferrer" style={{ padding: "6px 12px", borderRadius: 8, background: "#f1f5f9", border: "none", color: "#344054", fontWeight: 700, fontSize: ".78rem", cursor: "pointer", textDecoration: "none" }}>
                    View
                  </a>
                  <button onClick={() => togglePublish(p)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: ".78rem", cursor: "pointer", background: p.is_published ? "#fef3c7" : "#d1fae5", color: p.is_published ? "#92400e" : "#065f46" }}>
                    {p.is_published ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => deletePaper(p.id)} style={{ padding: "6px 12px", borderRadius: 8, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
