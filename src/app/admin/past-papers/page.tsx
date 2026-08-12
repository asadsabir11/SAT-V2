"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";

type OLevelSubject = "mathematics" | "computer-science" | "english-language" | "islamiyat" | "pakistan-studies";
type PaperType = "question_paper" | "mark_scheme" | "examiner_report" | "other";

interface PastPaper {
  id: string;
  subject: OLevelSubject;
  title: string;
  description: string;
  session: string;
  paper_type: PaperType;
  file_url: string;
  file_name: string;
  is_published: boolean;
  created_at: string;
}

const SUBJECTS: { value: OLevelSubject; label: string; icon: string }[] = [
  { value: "mathematics", label: "Mathematics", icon: "📐" },
  { value: "computer-science", label: "Computer Science", icon: "💻" },
  { value: "english-language", label: "English Language", icon: "📖" },
  { value: "islamiyat", label: "Islamiyat", icon: "🕌" },
  { value: "pakistan-studies", label: "Pakistan Studies", icon: "🌍" },
];
const subjectMeta = (s: string) => SUBJECTS.find((x) => x.value === s) ?? SUBJECTS[0];

const PAPER_TYPES: { value: PaperType; label: string }[] = [
  { value: "question_paper", label: "Question Paper" },
  { value: "mark_scheme", label: "Mark Scheme" },
  { value: "examiner_report", label: "Examiner Report" },
  { value: "other", label: "Other" },
];
const paperTypeLabel = (t: string) => PAPER_TYPES.find((x) => x.value === t)?.label ?? t;

export default function AdminPastPapers() {
  const [papers, setPapers] = useState<PastPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | OLevelSubject>("all");

  const [subject, setSubject] = useState<OLevelSubject>("mathematics");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [examSession, setExamSession] = useState("");
  const [paperType, setPaperType] = useState<PaperType>("question_paper");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/past-papers")
      .then((r) => r.json())
      .then((d) => setPapers(d.papers ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpload() {
    if (!title.trim() || !file) return;
    setUploading(true);
    setUploadError("");
    setUploadProgress(0);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/past-papers/upload",
        onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage)),
      }).catch((e) => { throw new Error(`Upload failed: ${e?.message ?? e}`); });

      const res = await fetch("/api/past-papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, title, description, session: examSession, paper_type: paperType, file_url: blob.url, file_name: file.name }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(`Save failed (${res.status}): ${errBody.error ?? "unknown error"}`);
      }
      const d = await res.json();

      const newPaper: PastPaper = {
        id: d.id, subject, title, description, session: examSession, paper_type: paperType,
        file_url: blob.url, file_name: file.name, is_published: false, created_at: new Date().toISOString(),
      };
      setPapers((ps) => [newPaper, ...ps]);
      setTitle(""); setDescription(""); setExamSession(""); setPaperType("question_paper"); setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setUploadProgress(0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError(`Upload failed — ${msg}.`);
    } finally {
      setUploading(false);
    }
  }

  async function togglePublish(p: PastPaper) {
    const action = p.is_published ? "unpublish" : "publish";
    await fetch(`/api/past-papers/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    setPapers((ps) => ps.map((x) => (x.id === p.id ? { ...x, is_published: !x.is_published } : x)));
  }

  async function deletePaper(id: string) {
    if (!confirm("Delete this past paper? This cannot be undone.")) return;
    await fetch(`/api/past-papers/${id}`, { method: "DELETE" });
    setPapers((ps) => ps.filter((x) => x.id !== id));
  }

  const published = papers.filter((p) => p.is_published).length;
  const visible = papers.filter((p) => filter === "all" || p.subject === filter);

  return (
    <section className="section">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <div>
            <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>O Level Past Papers</h1>
            <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>
              {papers.length} total · {published} published · {papers.length - published} draft
            </p>
          </div>
        </div>

        {/* Upload form */}
        <div className="card" style={{ marginBottom: 28, border: "2px solid #e8eef6" }}>
          <h3 style={{ margin: "0 0 18px", color: "#071b33", fontSize: "1rem" }}>Upload new paper</h3>

          <div className="field" style={{ marginBottom: 16 }}>
            <label>Subject *</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {SUBJECTS.map(({ value, label, icon }) => (
                <button key={value} type="button" onClick={() => setSubject(value)}
                  style={{ flex: 1, minWidth: 130, padding: "10px 16px", borderRadius: 10, fontWeight: 700, fontSize: ".88rem", cursor: "pointer", border: subject === value ? "2px solid #155eef" : "2px solid #e8eef6", background: subject === value ? "#eff6ff" : "#f8fafc", color: subject === value ? "#155eef" : "#6b7c93" }}>
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-grid" style={{ marginBottom: 14 }}>
            <div className="field">
              <label>Paper title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Paper 1 — Multiple Choice" />
            </div>
            <div className="field">
              <label>Exam session (optional)</label>
              <input value={examSession} onChange={(e) => setExamSession(e.target.value)} placeholder="e.g. May/June 2024" />
            </div>
          </div>

          <div className="form-grid" style={{ marginBottom: 16 }}>
            <div className="field">
              <label>Paper type *</label>
              <select value={paperType} onChange={(e) => setPaperType(e.target.value as PaperType)}>
                {PAPER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Description (optional)</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notes for students…" />
            </div>
          </div>

          <div className="field" style={{ marginBottom: 16 }}>
            <label>PDF file * (up to 50 MB)</label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{ border: `2px dashed ${file ? "#10b981" : "#c8d5e3"}`, borderRadius: 10, padding: "24px 20px", textAlign: "center", cursor: "pointer", background: file ? "#f0fdf4" : "#f8fafc" }}
            >
              {file ? (
                <div>
                  <div style={{ fontSize: "1.4rem", marginBottom: 6 }}>📄</div>
                  <p style={{ fontWeight: 700, color: "#065f46", margin: 0 }}>{file.name}</p>
                  <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: "4px 0 0" }}>{(file.size / (1024 * 1024)).toFixed(1)} MB · Click to change</p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>📁</div>
                  <p style={{ fontWeight: 700, color: "#344054", margin: 0 }}>Click to choose a PDF</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>

          {uploading && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: ".82rem", fontWeight: 700, color: "#344054" }}>
                <span>Uploading…</span><span>{uploadProgress}%</span>
              </div>
              <div style={{ height: 8, background: "#e8eef6", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${uploadProgress}%`, background: "linear-gradient(90deg,#155eef,#18a999)", borderRadius: 99 }} />
              </div>
            </div>
          )}
          {uploadError && <p style={{ color: "#dc2626", fontSize: ".85rem", marginBottom: 12, fontWeight: 600 }}>⚠ {uploadError}</p>}

          <button className="btn btn-primary" onClick={handleUpload} disabled={uploading || !title.trim() || !file} style={{ minWidth: 180 }}>
            {uploading ? `Uploading ${uploadProgress}%…` : "Upload paper"}
          </button>
        </div>

        {/* Filter */}
        {!loading && papers.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <button onClick={() => setFilter("all")} style={{ padding: "7px 16px", borderRadius: 999, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", border: filter === "all" ? "2px solid #155eef" : "2px solid #e8eef6", background: filter === "all" ? "#eff6ff" : "#fff", color: filter === "all" ? "#155eef" : "#6b7c93" }}>All</button>
            {SUBJECTS.map((s) => (
              <button key={s.value} onClick={() => setFilter(s.value)} style={{ padding: "7px 16px", borderRadius: 999, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", border: filter === s.value ? "2px solid #155eef" : "2px solid #e8eef6", background: filter === s.value ? "#eff6ff" : "#fff", color: filter === s.value ? "#155eef" : "#6b7c93" }}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="card"><p>Loading past papers…</p></div>
        ) : visible.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📄</div>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>No past papers yet</p>
            <p style={{ fontSize: ".88rem" }}>Upload your first paper above.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {visible.map((p) => (
              <div key={p.id} className="card" style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>📄</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>
                        {subjectMeta(p.subject).icon} {subjectMeta(p.subject).label}
                      </span>
                      <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: "#f1f5f9", color: "#475569" }}>{paperTypeLabel(p.paper_type)}</span>
                      <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: p.is_published ? "#d1fae5" : "#f3f4f6", color: p.is_published ? "#065f46" : "#6b7c93" }}>
                        {p.is_published ? "● Published" : "○ Draft"}
                      </span>
                    </div>
                    <p style={{ fontWeight: 700, color: "#071b33", margin: "0 0 2px", fontSize: ".95rem" }}>{p.title}</p>
                    {p.session && <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: "0 0 2px" }}>{p.session}</p>}
                    {p.description && <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: 0 }}>{p.description}</p>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <a href={p.file_url} target="_blank" rel="noreferrer" style={{ padding: "6px 12px", borderRadius: 8, background: "#f1f5f9", border: "none", fontWeight: 700, fontSize: ".78rem", color: "#344054", textDecoration: "none" }}>View</a>
                    <button onClick={() => togglePublish(p)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: ".78rem", cursor: "pointer", background: p.is_published ? "#fef3c7" : "#d1fae5", color: p.is_published ? "#92400e" : "#065f46" }}>
                      {p.is_published ? "Unpublish" : "Publish"}
                    </button>
                    <button onClick={() => deletePaper(p.id)} style={{ padding: "6px 12px", borderRadius: 8, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
