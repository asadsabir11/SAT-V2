"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";

type LectureCategory = "introduction" | "math" | "english";

interface Lecture {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  category: LectureCategory;
  is_free_preview: boolean;
  order_index: number;
  is_published: boolean;
  created_at: string;
}

export default function AdminLectures() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<LectureCategory>("math");
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState<LectureCategory>("math");

  useEffect(() => {
    fetch("/api/lectures")
      .then(r => r.json())
      .then(d => setLectures(d.lectures ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpload() {
    if (!title.trim() || !file) return;
    setUploading(true);
    setUploadError("");
    setUploadProgress(0);

    try {
      // 1. Upload thumbnail
      let thumbnailUrl = "";
      if (thumbnail) {
        setUploadError("");
        const thumbBlob = await upload(thumbnail.name, thumbnail, {
          access: "public",
          handleUploadUrl: "/api/lectures/upload",
        }).catch(e => { throw new Error(`Cover image upload failed: ${e?.message ?? e}`); });
        thumbnailUrl = thumbBlob.url;
      }

      // 2. Upload video
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/lectures/upload",
        onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage)),
      }).catch(e => { throw new Error(`Video upload failed: ${e?.message ?? e}`); });

      // 3. Save lecture metadata
      const res = await fetch("/api/lectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, video_url: blob.url, thumbnail_url: thumbnailUrl, category }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(`Save failed (${res.status}): ${errBody.error ?? "unknown error"}`);
      }
      const d = await res.json();

      const newLecture: Lecture = {
        id: d.id,
        title,
        description,
        video_url: blob.url,
        thumbnail_url: thumbnailUrl,
        category,
        is_free_preview: false,
        order_index: lectures.length + 1,
        is_published: false,
        created_at: new Date().toISOString(),
      };
      setLectures(ls => [...ls, newLecture]);
      setTitle("");
      setDescription("");
      setCategory("math");
      setFile(null);
      setThumbnail(null);
      setThumbnailPreview("");
      if (fileRef.current) fileRef.current.value = "";
      if (thumbRef.current) thumbRef.current.value = "";
      setUploadProgress(0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError(`Upload failed — ${msg}. Check your internet connection and try again.`);
      console.error("Lecture upload error:", err);
    } finally {
      setUploading(false);
    }
  }

  async function togglePublish(lec: Lecture) {
    const action = lec.is_published ? "unpublish" : "publish";
    await fetch(`/api/lectures/${lec.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLectures(ls => ls.map(l => l.id === lec.id ? { ...l, is_published: !l.is_published } : l));
  }

  async function togglePreview(lec: Lecture) {
    const next = !lec.is_free_preview;
    await fetch(`/api/lectures/${lec.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "togglePreview", value: next }),
    });
    setLectures(ls => ls.map(l => l.id === lec.id ? { ...l, is_free_preview: next } : l));
  }

  async function deleteLecture(id: string) {
    if (!confirm("Delete this lecture? This cannot be undone.")) return;
    await fetch(`/api/lectures/${id}`, { method: "DELETE" });
    setLectures(ls => ls.filter(l => l.id !== id));
  }

  async function saveEdit(id: string) {
    await fetch(`/api/lectures/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, description: editDesc, category: editCategory }),
    });
    setLectures(ls => ls.map(l => l.id === id ? { ...l, title: editTitle, description: editDesc, category: editCategory } : l));
    setEditingId(null);
  }

  const published = lectures.filter(l => l.is_published).length;

  return (
    <section className="section">
      <div className="container">

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <div>
            <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>Lectures</h1>
            <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>
              {lectures.length} total · {published} published · {lectures.length - published} draft
            </p>
          </div>
        </div>

        {/* Upload form */}
        <div className="card" style={{ marginBottom: 28, border: "2px solid #e8eef6" }}>
          <h3 style={{ margin: "0 0 18px", color: "#071b33", fontSize: "1rem" }}>Upload new lecture</h3>

          <div className="form-grid" style={{ marginBottom: 14 }}>
            <div className="field">
              <label>Lecture title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Week 1 — Linear Equations" />
            </div>
            <div className="field">
              <label>Description (optional)</label>
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="What this lecture covers…" />
            </div>
          </div>

          {/* Category selector */}
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Category *</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {([
                ["introduction", "📝 Introduction", "#15803d", "#dcfce7"],
                ["math",         "📐 Math",         "#155eef", "#eff6ff"],
                ["english",      "📖 English",      "#7c3aed", "#f5f3ff"],
              ] as [LectureCategory, string, string, string][]).map(([val, label, activeColor, activeBg]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCategory(val)}
                  style={{
                    flex: 1, padding: "10px 16px", borderRadius: 10, fontWeight: 700, fontSize: ".88rem", cursor: "pointer", transition: ".15s",
                    border: category === val ? `2px solid ${activeColor}` : "2px solid #e8eef6",
                    background: category === val ? activeBg : "#f8fafc",
                    color: category === val ? activeColor : "#6b7c93",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {category === "introduction" && (
              <p style={{ color: "#15803d", fontSize: ".78rem", fontWeight: 600, margin: "8px 0 0" }}>
                ✓ Introduction videos are free for all students — no lock, no payment required.
              </p>
            )}
          </div>

          {/* File picker */}
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Video file * (MP4, WebM — up to 1 GB)</label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${file ? "#10b981" : "#c8d5e3"}`,
                borderRadius: 10,
                padding: "28px 20px",
                textAlign: "center",
                cursor: "pointer",
                background: file ? "#f0fdf4" : "#f8fafc",
                transition: "all .15s",
              }}
            >
              {file ? (
                <div>
                  <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>🎬</div>
                  <p style={{ fontWeight: 700, color: "#065f46", margin: 0 }}>{file.name}</p>
                  <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: "4px 0 0" }}>
                    {(file.size / (1024 * 1024)).toFixed(1)} MB · Click to change
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: "2rem", marginBottom: 8 }}>📁</div>
                  <p style={{ fontWeight: 700, color: "#344054", margin: 0 }}>Click to choose a video file</p>
                  <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: "4px 0 0" }}>MP4, WebM, MOV — up to 1 GB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="video/*" style={{ display: "none" }} onChange={e => setFile(e.target.files?.[0] ?? null)} />
          </div>

          {/* Thumbnail picker */}
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Cover image (optional — JPG, PNG, WebP)</label>
            <div
              onClick={() => thumbRef.current?.click()}
              style={{
                border: `2px dashed ${thumbnail ? "#10b981" : "#c8d5e3"}`,
                borderRadius: 10,
                overflow: "hidden",
                cursor: "pointer",
                background: thumbnail ? "#f0fdf4" : "#f8fafc",
                transition: "all .15s",
                minHeight: 80,
              }}
            >
              {thumbnailPreview ? (
                <div style={{ position: "relative" }}>
                  <img src={thumbnailPreview} alt="Cover preview" style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", bottom: 8, left: 12, padding: "3px 10px", borderRadius: 8, background: "rgba(0,0,0,.55)", color: "#fff", fontSize: ".75rem", fontWeight: 700 }}>
                    Click to change
                  </div>
                </div>
              ) : (
                <div style={{ padding: "24px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: "1.6rem", marginBottom: 6 }}>🖼️</div>
                  <p style={{ fontWeight: 700, color: "#344054", margin: 0, fontSize: ".9rem" }}>Click to choose a cover image</p>
                  <p style={{ color: "#6b7c93", fontSize: ".78rem", margin: "4px 0 0" }}>JPG, PNG, WebP — shows on the lecture card</p>
                </div>
              )}
            </div>
            <input
              ref={thumbRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={e => {
                const f = e.target.files?.[0] ?? null;
                setThumbnail(f);
                if (f) setThumbnailPreview(URL.createObjectURL(f));
                else setThumbnailPreview("");
              }}
            />
          </div>

          {/* Progress bar */}
          {uploading && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: ".82rem", fontWeight: 700, color: "#344054" }}>
                <span>Uploading video…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ height: 8, background: "#e8eef6", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${uploadProgress}%`, background: "linear-gradient(90deg,#155eef,#18a999)", borderRadius: 99, transition: "width .3s" }} />
              </div>
            </div>
          )}

          {uploadError && (
            <p style={{ color: "#dc2626", fontSize: ".85rem", marginBottom: 12, fontWeight: 600 }}>⚠ {uploadError}</p>
          )}

          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={uploading || !title.trim() || !file}
            style={{ minWidth: 180 }}
          >
            {uploading ? `Uploading ${uploadProgress}%…` : "Upload lecture"}
          </button>
        </div>

        {/* Lecture list */}
        {loading ? (
          <div className="card"><p>Loading lectures…</p></div>
        ) : lectures.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🎬</div>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>No lectures yet</p>
            <p style={{ fontSize: ".88rem" }}>Upload your first lecture above to get started.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {lectures.map((lec, i) => (
              <div key={lec.id} className="card" style={{ padding: "16px 20px", border: editingId === lec.id ? "2px solid #155eef" : "1px solid #e8eef6" }}>
                {editingId === lec.id ? (
                  /* Edit mode */
                  <div>
                    <div className="form-grid" style={{ marginBottom: 12 }}>
                      <div className="field">
                        <label>Title *</label>
                        <input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                      </div>
                      <div className="field">
                        <label>Description</label>
                        <input value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                      </div>
                    </div>
                    <div className="field" style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: ".82rem", fontWeight: 700, color: "#344054", display: "block", marginBottom: 6 }}>Category</label>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {([
                          ["introduction", "📝 Introduction", "#15803d", "#dcfce7"],
                          ["math",         "📐 Math",         "#155eef", "#eff6ff"],
                          ["english",      "📖 English",      "#7c3aed", "#f5f3ff"],
                        ] as [LectureCategory, string, string, string][]).map(([val, label, activeColor, activeBg]) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setEditCategory(val)}
                            style={{
                              padding: "7px 14px", borderRadius: 8, fontWeight: 700, fontSize: ".82rem", cursor: "pointer",
                              border: editCategory === val ? `2px solid ${activeColor}` : "2px solid #e8eef6",
                              background: editCategory === val ? activeBg : "#f8fafc",
                              color: editCategory === val ? activeColor : "#6b7c93",
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-primary" onClick={() => saveEdit(lec.id)} disabled={!editTitle.trim()} style={{ padding: "8px 18px", fontSize: ".85rem" }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ padding: "8px 16px", borderRadius: 8, background: "#f1f5f9", border: "none", fontWeight: 700, cursor: "pointer", color: "#6b7c93", fontSize: ".85rem" }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    {/* Thumbnail */}
                    <div style={{ width: 100, height: 64, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg,#0c1629,#1e3a5f)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {lec.thumbnail_url
                        ? <img src={lec.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        : <span style={{ fontSize: "1.5rem" }}>🎬</span>
                      }
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, color: "#6b7c93", fontSize: ".75rem" }}>#{i + 1}</span>
                        <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700,
                          background: lec.category === "english" ? "#ede9fe" : lec.category === "introduction" ? "#dcfce7" : "#dbeafe",
                          color:      lec.category === "english" ? "#7c3aed" : lec.category === "introduction" ? "#15803d" : "#1d4ed8" }}>
                          {lec.category === "english" ? "📖 English" : lec.category === "introduction" ? "📝 Introduction" : "📐 Math"}
                        </span>
                        <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: lec.is_published ? "#d1fae5" : "#f3f4f6", color: lec.is_published ? "#065f46" : "#6b7c93" }}>
                          {lec.is_published ? "● Published" : "○ Draft"}
                        </span>
                        {lec.is_free_preview && (
                          <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 700, background: "#dcfce7", color: "#15803d" }}>
                            ✓ Free Preview
                          </span>
                        )}
                      </div>
                      <p style={{ fontWeight: 700, color: "#071b33", margin: "0 0 2px", fontSize: ".95rem" }}>{lec.title}</p>
                      {lec.description && <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: 0 }}>{lec.description}</p>}
                      <p style={{ color: "#a0aec0", fontSize: ".75rem", margin: "6px 0 0" }}>
                        Uploaded {new Date(lec.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <a href={lec.video_url} target="_blank" rel="noreferrer" style={{ padding: "6px 12px", borderRadius: 8, background: "#f1f5f9", border: "none", fontWeight: 700, fontSize: ".78rem", color: "#344054", textDecoration: "none" }}>
                        Preview
                      </a>
                      <button
                        onClick={() => { setEditingId(lec.id); setEditTitle(lec.title); setEditDesc(lec.description); setEditCategory(lec.category); }}
                        style={{ padding: "6px 12px", borderRadius: 8, background: "#eff6ff", border: "none", color: "#155eef", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>
                        Edit
                      </button>
                      <Link href={`/admin/lectures/${lec.id}/quiz`} style={{ padding: "6px 12px", borderRadius: 8, background: "#f0fdf4", border: "none", color: "#15803d", fontWeight: 700, fontSize: ".78rem", cursor: "pointer", textDecoration: "none" }}>
                        Quiz
                      </Link>
                      <button
                        onClick={() => togglePreview(lec)}
                        style={{ padding: "6px 12px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: ".78rem", cursor: "pointer", background: lec.is_free_preview ? "#dcfce7" : "#f3f4f6", color: lec.is_free_preview ? "#15803d" : "#6b7c93" }}>
                        {lec.is_free_preview ? "✓ Free Preview" : "Set Free Preview"}
                      </button>
                      <button
                        onClick={() => togglePublish(lec)}
                        style={{ padding: "6px 12px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: ".78rem", cursor: "pointer", background: lec.is_published ? "#fef3c7" : "#d1fae5", color: lec.is_published ? "#92400e" : "#065f46" }}>
                        {lec.is_published ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => deleteLecture(lec.id)}
                        style={{ padding: "6px 12px", borderRadius: 8, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>
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
