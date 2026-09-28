"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";

interface Material {
  id: string;
  title: string;
  description: string;
  file_url: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
}

function fileIcon(url: string) {
  return url.toLowerCase().endsWith(".pdf") ? "📄" : "🖼️";
}

export default function AdminAmnaShamimaMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  function loadMaterials() {
    return fetch("/api/admin/amna-shamima-materials").then((r) => r.json()).then((d) => setMaterials(d.materials ?? []));
  }

  useEffect(() => {
    loadMaterials().finally(() => setLoading(false));
  }, []);

  async function handleUpload() {
    if (!title.trim() || !file) return;
    setUploading(true);
    setUploadError("");
    setUploadProgress(0);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/amna-shamima/materials/upload",
        onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage)),
      }).catch((e) => { throw new Error(`File upload failed: ${e?.message ?? e}`); });

      const res = await fetch("/api/admin/amna-shamima-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, file_url: blob.url }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(`Save failed (${res.status}): ${errBody.error ?? "unknown error"}`);
      }
      await loadMaterials();
      setTitle("");
      setDescription("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setUploadProgress(0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError(`Upload failed — ${msg}. Check your internet connection and try again.`);
    } finally {
      setUploading(false);
    }
  }

  async function togglePublish(m: Material) {
    const action = m.is_published ? "unpublish" : "publish";
    await fetch(`/api/admin/amna-shamima-materials/${m.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }),
    });
    setMaterials((ms) => ms.map((x) => (x.id === m.id ? { ...x, is_published: !x.is_published } : x)));
  }

  async function deleteMaterial(id: string) {
    if (!confirm("Delete this file? This cannot be undone.")) return;
    await fetch(`/api/admin/amna-shamima-materials/${id}`, { method: "DELETE" });
    setMaterials((ms) => ms.filter((x) => x.id !== id));
  }

  async function saveEdit(id: string) {
    await fetch(`/api/admin/amna-shamima-materials/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: editTitle, description: editDesc }),
    });
    setMaterials((ms) => ms.map((x) => (x.id === id ? { ...x, title: editTitle, description: editDesc } : x)));
    setEditingId(null);
  }

  const published = materials.filter((m) => m.is_published).length;

  return (
    <section className="section">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <div>
            <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>Amna Shamima — Study Material</h1>
            <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>
              {materials.length} total · {published} published · {materials.length - published} draft
            </p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 28, border: "2px solid #e8eef6" }}>
          <h3 style={{ margin: "0 0 18px", color: "#071b33", fontSize: "1rem" }}>Upload new file</h3>

          <div className="form-grid" style={{ marginBottom: 14 }}>
            <div className="field">
              <label>Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Week 1 slides" />
            </div>
            <div className="field">
              <label>Description (optional)</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this file covers…" />
            </div>
          </div>

          <div className="field" style={{ marginBottom: 16 }}>
            <label>File * (PDF, JPG, PNG, WebP — up to 50 MB)</label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{ border: `2px dashed ${file ? "#10b981" : "#c8d5e3"}`, borderRadius: 10, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: file ? "#f0fdf4" : "#f8fafc" }}
            >
              {file ? (
                <div>
                  <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>{fileIcon(file.name)}</div>
                  <p style={{ fontWeight: 700, color: "#065f46", margin: 0 }}>{file.name}</p>
                  <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: "4px 0 0" }}>{(file.size / (1024 * 1024)).toFixed(1)} MB · Click to change</p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: "2rem", marginBottom: 8 }}>📁</div>
                  <p style={{ fontWeight: 700, color: "#344054", margin: 0 }}>Click to choose a file</p>
                  <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: "4px 0 0" }}>PDF, JPG, PNG, WebP — up to 50 MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="application/pdf,image/*" style={{ display: "none" }} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
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
            {uploading ? `Uploading ${uploadProgress}%…` : "Upload file"}
          </button>
        </div>

        {loading ? (
          <div className="card"><p>Loading files…</p></div>
        ) : materials.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📄</div>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>No files yet</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {materials.map((m, i) => (
              <div key={m.id} className="card" style={{ padding: "16px 20px", border: editingId === m.id ? "2px solid #155eef" : "1px solid #e8eef6" }}>
                {editingId === m.id ? (
                  <div>
                    <div className="form-grid" style={{ marginBottom: 12 }}>
                      <div className="field"><label>Title *</label><input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} /></div>
                      <div className="field"><label>Description</label><input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} /></div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-primary" onClick={() => saveEdit(m.id)} disabled={!editTitle.trim()} style={{ padding: "8px 18px", fontSize: ".85rem" }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ padding: "8px 16px", borderRadius: 8, background: "#f1f5f9", border: "none", fontWeight: 700, cursor: "pointer", color: "#6b7c93", fontSize: ".85rem" }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 8, flexShrink: 0, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
                      {fileIcon(m.file_url)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, color: "#6b7c93", fontSize: ".75rem" }}>#{i + 1}</span>
                        <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: m.is_published ? "#d1fae5" : "#f3f4f6", color: m.is_published ? "#065f46" : "#6b7c93" }}>
                          {m.is_published ? "● Published" : "○ Draft"}
                        </span>
                      </div>
                      <p style={{ fontWeight: 700, color: "#071b33", margin: "0 0 2px", fontSize: ".95rem" }}>{m.title}</p>
                      {m.description && <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: 0 }}>{m.description}</p>}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <a href={m.file_url} target="_blank" rel="noreferrer" style={{ padding: "6px 12px", borderRadius: 8, background: "#f1f5f9", border: "none", fontWeight: 700, fontSize: ".78rem", color: "#344054", textDecoration: "none" }}>View</a>
                      <button onClick={() => { setEditingId(m.id); setEditTitle(m.title); setEditDesc(m.description); }} style={{ padding: "6px 12px", borderRadius: 8, background: "#eff6ff", border: "none", color: "#155eef", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>Edit</button>
                      <button onClick={() => togglePublish(m)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: ".78rem", cursor: "pointer", background: m.is_published ? "#fef3c7" : "#d1fae5", color: m.is_published ? "#92400e" : "#065f46" }}>
                        {m.is_published ? "Unpublish" : "Publish"}
                      </button>
                      <button onClick={() => deleteMaterial(m.id)} style={{ padding: "6px 12px", borderRadius: 8, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>Delete</button>
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
