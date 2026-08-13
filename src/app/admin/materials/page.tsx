"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";

interface Material {
  id: string;
  title: string;
  description: string;
  status: "in_preparation" | "available";
  url: string;
  pdf_url: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
}

type FormState = { title: string; description: string; status: "in_preparation" | "available"; url: string; pdf_url: string; order_index: number };
const blank: FormState = { title: "", description: "", status: "in_preparation", url: "", pdf_url: "", order_index: 0 };

async function uploadPdf(file: File, onProgress?: (p: number) => void): Promise<string> {
  const blob = await upload(file.name, file, {
    access: "public",
    handleUploadUrl: "/api/materials/upload",
    onUploadProgress: ({ percentage }) => onProgress?.(Math.round(percentage)),
  });
  return blob.url;
}

function PdfPicker({ file, pct, inputRef, onChange, currentUrl }: {
  file: File | null; pct: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (f: File | null) => void;
  currentUrl?: string;
}) {
  return (
    <div>
      <label style={lbl}>Attach PDF (optional)</label>
      <input ref={inputRef} type="file" accept="application/pdf" style={{ display: "none" }}
        onChange={e => onChange(e.target.files?.[0] ?? null)} />
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" onClick={() => inputRef.current?.click()}
          style={{ padding: "8px 14px", border: "1.5px solid #dce5ef", borderRadius: 9, background: "#fff", fontWeight: 700, fontSize: ".82rem", cursor: "pointer", color: "#344054" }}>
          {file ? "Change PDF" : currentUrl ? "Replace PDF" : "Choose PDF"}
        </button>
        {file && (
          <span style={{ fontSize: ".8rem", color: "#344054", fontWeight: 600 }}>
            {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
          </span>
        )}
        {!file && currentUrl && (
          <a href={currentUrl} target="_blank" rel="noreferrer" style={{ fontSize: ".8rem", color: "#155eef", fontWeight: 600 }}>
            📄 View current PDF
          </a>
        )}
      </div>
      {pct > 0 && (
        <div style={{ marginTop: 8, height: 6, background: "#e8eef6", borderRadius: 99 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "#155eef", borderRadius: 99, transition: "width .2s" }} />
        </div>
      )}
      {pct > 0 && <p style={{ margin: "4px 0 0", fontSize: ".75rem", color: "#6b7c93" }}>Uploading PDF… {pct}%</p>}
    </div>
  );
}

export default function AdminMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [form, setForm]           = useState<FormState>(blank);
  const [addPdfFile, setAddPdfFile]   = useState<File | null>(null);
  const [addPdfPct, setAddPdfPct]     = useState(0);
  const [saving, setSaving]       = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm]   = useState<FormState & { is_published: boolean }>({ ...blank, is_published: true });
  const [editPdfFile, setEditPdfFile] = useState<File | null>(null);
  const [editPdfPct, setEditPdfPct]   = useState(0);
  const [toast, setToast]         = useState("");

  const addPdfRef  = useRef<HTMLInputElement>(null);
  const editPdfRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  useEffect(() => {
    fetch("/api/admin/materials").then(r => r.json()).then(d => { setMaterials(d.materials ?? []); setLoading(false); });
  }, []);

  async function addMaterial() {
    if (!form.title.trim()) return;
    setSaving(true);
    let pdfUrl = form.pdf_url;
    if (addPdfFile) {
      setAddPdfPct(1);
      pdfUrl = await uploadPdf(addPdfFile, setAddPdfPct);
      setAddPdfPct(0);
    }
    const res = await fetch("/api/admin/materials", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, pdf_url: pdfUrl, order_index: materials.length }),
    });
    const d = await res.json();
    setMaterials(m => [...m, d.material]);
    setForm(blank);
    setAddPdfFile(null);
    setShowAdd(false);
    setSaving(false);
    showToast("Material added.");
  }

  async function saveEdit(id: string) {
    setSaving(true);
    let pdfUrl = editForm.pdf_url;
    if (editPdfFile) {
      setEditPdfPct(1);
      pdfUrl = await uploadPdf(editPdfFile, setEditPdfPct);
      setEditPdfPct(0);
    }
    const res = await fetch(`/api/admin/materials/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, pdf_url: pdfUrl }),
    });
    const d = await res.json();
    setMaterials(m => m.map(x => x.id === id ? d.material : x));
    setEditingId(null);
    setEditPdfFile(null);
    setSaving(false);
    showToast("Saved.");
  }

  async function deleteMaterial(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    await fetch(`/api/admin/materials/${id}`, { method: "DELETE" });
    setMaterials(m => m.filter(x => x.id !== id));
  }

  async function togglePublish(mat: Material) {
    const res = await fetch(`/api/admin/materials/${mat.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...mat, is_published: !mat.is_published }),
    });
    const d = await res.json();
    setMaterials(m => m.map(x => x.id === mat.id ? d.material : x));
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "32px 16px" }}>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, background: "#155eef", color: "#fff", padding: "10px 20px", borderRadius: 10, fontWeight: 700, fontSize: ".88rem", zIndex: 9999, boxShadow: "0 4px 16px rgba(21,94,239,.3)" }}>
          {toast}
        </div>
      )}
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <Link href="/admin" style={{ fontSize: ".82rem", color: "#6b7c93", textDecoration: "none", fontWeight: 600 }}>← Admin</Link>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "4px 0 2px", letterSpacing: "-.03em" }}>Study Materials</h1>
            <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: 0 }}>Manage the preparation library shown to students</p>
          </div>
          <button onClick={() => setShowAdd(true)} style={{ padding: "12px 22px", background: "#155eef", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, fontSize: ".9rem", cursor: "pointer" }}>
            + Add material
          </button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "2px solid #155eef", marginBottom: 20, boxShadow: "0 4px 20px rgba(7,27,51,.08)" }}>
            <h3 style={{ margin: "0 0 16px", fontWeight: 900, color: "#071b33" }}>New material</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={lbl}>Title *</label>
                <input style={inp} placeholder="e.g. Mock Test 1" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label style={lbl}>Description</label>
                <input style={inp} placeholder="Short description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={lbl}>Status</label>
                <select style={inp} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as "in_preparation" | "available" }))}>
                  <option value="in_preparation">In Preparation</option>
                  <option value="available">Available</option>
                </select>
              </div>
              <div>
                <label style={lbl}>External URL (optional)</label>
                <input style={inp} placeholder="https://…" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
              </div>
              <div>
                <label style={lbl}>Order</label>
                <input style={inp} type="number" min="0" value={form.order_index} onChange={e => setForm(f => ({ ...f, order_index: Number(e.target.value) }))} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <PdfPicker file={addPdfFile} pct={addPdfPct} inputRef={addPdfRef} onChange={setAddPdfFile} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setShowAdd(false); setForm(blank); setAddPdfFile(null); }} style={{ flex: 1, padding: "11px", border: "1.5px solid #dce5ef", borderRadius: 10, background: "#fff", fontWeight: 700, cursor: "pointer", color: "#344054" }}>Cancel</button>
              <button onClick={addMaterial} disabled={saving || !form.title.trim()} style={{ flex: 2, padding: "11px", background: "#155eef", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer", opacity: saving ? .6 : 1 }}>
                {saving ? (addPdfPct > 0 ? `Uploading PDF… ${addPdfPct}%` : "Adding…") : "Add material"}
              </button>
            </div>
          </div>
        )}

        {/* Materials list */}
        {loading ? (
          <div style={card}><p style={{ color: "#6b7c93" }}>Loading…</p></div>
        ) : materials.length === 0 ? (
          <div style={{ ...card, textAlign: "center", padding: "52px 24px" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📚</div>
            <p style={{ color: "#6b7c93", margin: 0 }}>No materials yet. Add your first one above.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {materials.map((mat, i) => (
              <div key={mat.id} style={{ ...card, border: editingId === mat.id ? "2px solid #155eef" : "1px solid #e8eef6" }}>
                {editingId === mat.id ? (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={lbl}>Title *</label>
                        <input style={inp} value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                      </div>
                      <div>
                        <label style={lbl}>Description</label>
                        <input style={inp} value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={lbl}>Status</label>
                        <select style={inp} value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value as "in_preparation" | "available" }))}>
                          <option value="in_preparation">In Preparation</option>
                          <option value="available">Available</option>
                        </select>
                      </div>
                      <div>
                        <label style={lbl}>External URL</label>
                        <input style={inp} placeholder="https://…" value={editForm.url} onChange={e => setEditForm(f => ({ ...f, url: e.target.value }))} />
                      </div>
                      <div>
                        <label style={lbl}>Order</label>
                        <input style={inp} type="number" min="0" value={editForm.order_index} onChange={e => setEditForm(f => ({ ...f, order_index: Number(e.target.value) }))} />
                      </div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <PdfPicker file={editPdfFile} pct={editPdfPct} inputRef={editPdfRef} onChange={setEditPdfFile} currentUrl={editForm.pdf_url} />
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => { setEditingId(null); setEditPdfFile(null); }} style={{ flex: 1, padding: "9px", border: "1.5px solid #dce5ef", borderRadius: 9, background: "#fff", fontWeight: 700, cursor: "pointer", color: "#344054" }}>Cancel</button>
                      <button onClick={() => saveEdit(mat.id)} disabled={saving} style={{ flex: 2, padding: "9px", background: "#155eef", color: "#fff", border: "none", borderRadius: 9, fontWeight: 800, cursor: "pointer", opacity: saving ? .6 : 1 }}>
                        {saving ? (editPdfPct > 0 ? `Uploading PDF… ${editPdfPct}%` : "Saving…") : "Save changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#155eef", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: ".8rem", flexShrink: 0 }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, fontSize: ".95rem", color: "#071b33" }}>{mat.title}</span>
                        <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: ".7rem", fontWeight: 800, background: mat.status === "available" ? "#dcfce7" : "#f1f5f9", color: mat.status === "available" ? "#15803d" : "#6b7c93" }}>
                          {mat.status === "available" ? "✓ Available" : "In Preparation"}
                        </span>
                        {!mat.is_published && <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: ".7rem", fontWeight: 800, background: "#fee2e2", color: "#991b1b" }}>Hidden</span>}
                        {mat.pdf_url && <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: ".7rem", fontWeight: 800, background: "#eff6ff", color: "#1d4ed8" }}>📄 PDF</span>}
                      </div>
                      {mat.description && <div style={{ fontSize: ".82rem", color: "#6b7c93" }}>{mat.description}</div>}
                      <div style={{ display: "flex", gap: 12, marginTop: 2, flexWrap: "wrap" }}>
                        {mat.url && <span style={{ fontSize: ".75rem", color: "#155eef" }}>🔗 Link attached</span>}
                        {mat.pdf_url && <a href={mat.pdf_url} target="_blank" rel="noreferrer" style={{ fontSize: ".75rem", color: "#1d4ed8", textDecoration: "none", fontWeight: 600 }}>📄 View PDF</a>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button onClick={() => {
                        setEditingId(mat.id);
                        setEditPdfFile(null);
                        setEditForm({ title: mat.title, description: mat.description, status: mat.status, url: mat.url, pdf_url: mat.pdf_url ?? "", order_index: mat.order_index, is_published: mat.is_published });
                      }} style={outlineBtn}>Edit</button>
                      <button onClick={() => togglePublish(mat)} style={{ ...outlineBtn, background: mat.is_published ? "#fef3c7" : "#dcfce7", color: mat.is_published ? "#92400e" : "#15803d", border: "none" }}>
                        {mat.is_published ? "Hide" : "Show"}
                      </button>
                      <button onClick={() => deleteMaterial(mat.id, mat.title)} style={{ ...outlineBtn, background: "#fee2e2", color: "#991b1b", border: "none" }}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const card: React.CSSProperties = { background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 8px rgba(7,27,51,.07)", border: "1px solid #e8eef6" };
const lbl: React.CSSProperties = { display: "block", fontWeight: 700, fontSize: ".8rem", color: "#344054", marginBottom: 5 };
const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid #dce5ef", fontSize: ".88rem", boxSizing: "border-box", outline: "none" };
const outlineBtn: React.CSSProperties = { padding: "7px 14px", border: "1.5px solid #dce5ef", borderRadius: 9, background: "#fff", fontWeight: 700, fontSize: ".8rem", cursor: "pointer", color: "#344054" };
