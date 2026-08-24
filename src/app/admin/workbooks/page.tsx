"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";

interface Workbook {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  createdAt: string;
  downloadCount?: number;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminWorkbooks() {
  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/workbooks")
      .then((r) => r.json())
      .then((d) => setWorkbooks(d.workbooks ?? []))
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
        handleUploadUrl: "/api/workbooks/upload",
        onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage)),
      }).catch((e) => { throw new Error(`Upload failed: ${e?.message ?? e}`); });

      const res = await fetch("/api/workbooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), fileUrl: blob.url, fileName: file.name }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(`Save failed (${res.status}): ${errBody.error ?? "unknown error"}`);
      }
      const d = await res.json();

      setWorkbooks((ws) => [...ws, { id: d.id, title: title.trim(), fileUrl: blob.url, fileName: file.name, createdAt: new Date().toISOString() }]);
      setTitle("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setUploadProgress(0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError(`Upload failed — ${msg}.`);
    } finally {
      setUploading(false);
    }
  }

  async function deleteWorkbook(id: string) {
    if (!confirm("Delete this workbook? It will disappear from the O Level page immediately.")) return;
    await fetch(`/api/workbooks/${id}`, { method: "DELETE" });
    setWorkbooks((ws) => ws.filter((w) => w.id !== id));
  }

  return (
    <section className="section">
      <div className="container">
        <div style={{ marginBottom: 28 }}>
          <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "6px 0 4px", letterSpacing: "-.03em" }}>O Level Workbooks</h1>
          <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>
            Public downloads shown on the O Level page — no sign-in required. {workbooks.length} uploaded.
          </p>
        </div>

        {/* Upload form */}
        <div className="card" style={{ marginBottom: 28, border: "2px solid #e8eef6" }}>
          <h3 style={{ margin: "0 0 18px", color: "#071b33", fontSize: "1rem" }}>Upload new workbook</h3>

          <div className="field" style={{ marginBottom: 16 }}>
            <label>Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. English Language Workbook" />
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
            {uploading ? `Uploading ${uploadProgress}%…` : "Upload workbook"}
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="card"><p>Loading workbooks…</p></div>
        ) : workbooks.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📄</div>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>No workbooks yet</p>
            <p style={{ fontSize: ".88rem" }}>Upload your first one above — it&apos;ll appear on the O Level page immediately.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {workbooks.map((w) => (
              <div key={w.id} className="card" style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>📘</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: "#071b33", margin: "0 0 2px", fontSize: ".95rem" }}>{w.title}</p>
                    <p style={{ color: "#6b7c93", fontSize: ".82rem", margin: 0 }}>{w.fileName} · Uploaded {fmtDate(w.createdAt)}</p>
                  </div>
                  <div style={{ textAlign: "center", flexShrink: 0, padding: "0 8px" }}>
                    <div style={{ fontWeight: 900, color: "#155eef", fontSize: "1.1rem" }}>{w.downloadCount ?? 0}</div>
                    <div style={{ color: "#a0aec0", fontSize: ".68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>Downloads</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <a href={w.fileUrl} target="_blank" rel="noreferrer" style={{ padding: "6px 12px", borderRadius: 8, background: "#f1f5f9", border: "none", fontWeight: 700, fontSize: ".78rem", color: "#344054", textDecoration: "none" }}>View</a>
                    <button onClick={() => deleteWorkbook(w.id)} style={{ padding: "6px 12px", borderRadius: 8, background: "#fee2e2", border: "none", color: "#991b1b", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>Delete</button>
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
