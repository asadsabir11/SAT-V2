"use client";
import { PageHero } from "@/components/site";
import { useEffect, useState } from "react";

interface Material {
  id: string;
  title: string;
  description: string;
  status: "in_preparation" | "available";
  url: string;
  pdf_url: string;
  order_index: number;
  is_completed: boolean;
}

function MaterialCard({ material, index }: { material: Material; index: number }) {
  const [email, setEmail]       = useState("");
  const [notified, setNotified] = useState(false);
  const [opened, setOpened]     = useState(false);
  const [completed, setCompleted] = useState(material.is_completed);
  const [marking, setMarking]   = useState(false);

  const isAvailable = material.status === "available";

  async function handleView() {
    setOpened(true);
    if (material.url) window.open(material.url, "_blank", "noopener");
  }

  async function markComplete() {
    setMarking(true);
    await fetch(`/api/materials/${material.id}/complete`, { method: "POST" });
    setCompleted(true);
    setMarking(false);
    setOpened(false);
  }

  async function markIncomplete() {
    await fetch(`/api/materials/${material.id}/complete`, { method: "DELETE" });
    setCompleted(false);
  }

  async function submitNotify(e: { preventDefault(): void }) {
    e.preventDefault();
    await fetch("/api/leads/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, material: material.title }),
    });
    setNotified(true);
  }

  return (
    <article className="card" style={{ display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      {/* Completed ribbon */}
      {completed && (
        <div style={{ position: "absolute", top: 0, right: 0, background: "#15803d", color: "#fff", fontSize: ".65rem", fontWeight: 900, padding: "4px 14px", borderBottomLeftRadius: 10, letterSpacing: ".06em" }}>
          ✓ COMPLETED
        </div>
      )}

      <div className="icon" style={{ background: completed ? "#15803d" : undefined }}>
        {completed ? "✓" : String(index + 1).padStart(2, "0")}
      </div>
      <h3 style={{ margin: "10px 0 6px" }}>{material.title}</h3>
      {material.description && (
        <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: "0 0 10px", lineHeight: 1.5 }}>{material.description}</p>
      )}

      <div style={{ marginTop: "auto" }}>
        {isAvailable ? (
          completed ? (
            /* ── Completed state ── */
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: ".75rem", fontWeight: 800, background: "#dcfce7", color: "#15803d" }}>
                  ✓ Completed
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {material.url && (
                  <a href={material.url} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: "center", padding: "9px 12px", background: "#f1f5f9", color: "#344054", borderRadius: 9, fontWeight: 700, fontSize: ".82rem", textDecoration: "none" }}>
                    View again →
                  </a>
                )}
                {material.pdf_url && (
                  <a href={material.pdf_url} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: "center", padding: "9px 12px", background: "#eff6ff", color: "#1d4ed8", borderRadius: 9, fontWeight: 700, fontSize: ".82rem", textDecoration: "none" }}>
                    📄 PDF
                  </a>
                )}
                <button onClick={markIncomplete} style={{ padding: "9px 12px", border: "1px solid #e8eef6", borderRadius: 9, background: "#fff", color: "#9ca3af", fontWeight: 600, fontSize: ".75rem", cursor: "pointer" }}>
                  Undo
                </button>
              </div>
            </div>
          ) : opened ? (
            /* ── After clicking View — prompt to mark complete ── */
            <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "12px 14px", border: "1.5px solid #86efac" }}>
              <p style={{ margin: "0 0 10px", fontSize: ".85rem", color: "#166534", fontWeight: 700 }}>
                Done viewing? Mark it as complete.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={markComplete} disabled={marking} style={{ flex: 2, padding: "9px", background: "#15803d", color: "#fff", border: "none", borderRadius: 9, fontWeight: 800, fontSize: ".85rem", cursor: "pointer", opacity: marking ? .7 : 1 }}>
                  {marking ? "Saving…" : "✓ Mark as complete"}
                </button>
                <button onClick={() => setOpened(false)} style={{ flex: 1, padding: "9px", border: "1px solid #e8eef6", borderRadius: 9, background: "#fff", fontWeight: 600, fontSize: ".82rem", cursor: "pointer", color: "#6b7c93" }}>
                  Not yet
                </button>
              </div>
            </div>
          ) : (
            /* ── Default available state ── */
            <div>
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: ".72rem", fontWeight: 800, background: "#dcfce7", color: "#15803d", marginBottom: 10 }}>
                ✓ Available
              </span>
              {material.url || material.pdf_url ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {material.url && (
                    <button onClick={handleView} style={{ display: "block", width: "100%", textAlign: "center", padding: "11px 16px", background: "#155eef", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: ".9rem", cursor: "pointer" }}>
                      View / Download →
                    </button>
                  )}
                  {material.pdf_url && (
                    <a href={material.pdf_url} target="_blank" rel="noreferrer" style={{ display: "block", width: "100%", textAlign: "center", padding: "11px 16px", background: "#eff6ff", color: "#1d4ed8", borderRadius: 10, fontWeight: 800, fontSize: ".9rem", textDecoration: "none", border: "1.5px solid #bfdbfe", boxSizing: "border-box" }}>
                      📄 Download PDF
                    </a>
                  )}
                </div>
              ) : (
                <p style={{ color: "#6b7c93", fontSize: ".85rem", margin: 0 }}>Coming soon — check back shortly.</p>
              )}
            </div>
          )
        ) : (
          /* ── In preparation state ── */
          <div>
            <p style={{ color: "#6b7c93", fontSize: ".85rem", margin: "0 0 10px" }}>
              In preparation — enter your email and we&apos;ll notify you when it&apos;s ready.
            </p>
            {notified ? (
              <p style={{ color: "#065f46", fontWeight: 700, fontSize: ".88rem", margin: 0 }}>✓ We&apos;ll let you know!</p>
            ) : (
              <form onSubmit={submitNotify} style={{ display: "flex", gap: 8 }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  aria-label={`Notify me about ${material.title}`}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1.5px solid #d0d7e3", fontSize: ".85rem" }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: "8px 14px", fontSize: ".82rem", whiteSpace: "nowrap" }}>
                  Notify me
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default function Materials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch("/api/materials")
      .then(r => r.json())
      .then(d => setMaterials(d.materials ?? []))
      .finally(() => setLoading(false));
  }, []);

  const completedCount = materials.filter(m => m.is_completed).length;
  const availableCount = materials.filter(m => m.status === "available").length;

  return (
    <>
      <PageHero eyebrow="Preparation library" title="Simple materials. Used consistently." backHref="/dashboard" backLabel="Dashboard">
        Original resources will be released in stages for diagnostic, weekly practice, mock testing, parent support, and cohort delivery.
      </PageHero>
      <section className="section soft">
        <div className="container">
          {/* Progress summary */}
          {!loading && availableCount > 0 && (
            <div style={{ maxWidth: 520, margin: "0 auto 28px", background: "#fff", borderRadius: 14, padding: "16px 20px", border: "1px solid #e8eef6", boxShadow: "0 1px 8px rgba(7,27,51,.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: "#344054", fontSize: ".88rem" }}>Your progress</span>
                <span style={{ fontWeight: 900, color: "#155eef", fontSize: ".88rem" }}>{completedCount} / {availableCount} completed</span>
              </div>
              <div style={{ height: 8, background: "#e8eef6", borderRadius: 99 }}>
                <div style={{ height: "100%", width: `${availableCount > 0 ? Math.round((completedCount / availableCount) * 100) : 0}%`, background: completedCount === availableCount && availableCount > 0 ? "#15803d" : "#155eef", borderRadius: 99, transition: "width .4s" }} />
              </div>
              {completedCount === availableCount && availableCount > 0 && (
                <p style={{ margin: "8px 0 0", fontSize: ".82rem", color: "#15803d", fontWeight: 700 }}>🎉 All materials completed!</p>
              )}
            </div>
          )}

          {loading ? (
            <p style={{ color: "#6b7c93", textAlign: "center", paddingTop: 40 }}>Loading materials…</p>
          ) : materials.length === 0 ? (
            <p style={{ color: "#6b7c93", textAlign: "center", paddingTop: 40 }}>No materials available yet. Check back soon!</p>
          ) : (
            <div className="grid grid-3">
              {materials.map((m, i) => <MaterialCard key={m.id} material={m} index={i} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
