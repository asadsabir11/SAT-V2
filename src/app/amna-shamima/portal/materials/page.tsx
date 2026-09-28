import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPublishedAmnaShamimaMaterials } from "@/lib/amnaShamimaMaterials";

export const metadata: Metadata = { title: "Study Material", robots: { index: false, follow: false } };

function fileIcon(url: string) {
  return url.toLowerCase().endsWith(".pdf") ? "📄" : "🖼️";
}

export default async function AmnaShamimaMaterialsPage() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "amna-shamima") {
    redirect("/login?role=student&program=amna-shamima&next=/amna-shamima/portal/materials");
  }

  const materials = await getPublishedAmnaShamimaMaterials();

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 780 }}>
        <Link href="/amna-shamima/portal" style={{ color: "#6b7c93", fontSize: ".85rem", textDecoration: "none" }}>← Portal</Link>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "10px 0 24px" }}>Study Material</h1>

        {materials.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>📄</div>
            <p style={{ fontWeight: 700 }}>No files yet</p>
            <p style={{ fontSize: ".88rem" }}>Check back soon — study material is added regularly.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            {materials.map((m) => (
              <div key={m.id} className="card" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: "1.8rem" }}>{fileIcon(m.file_url)}</div>
                <h3 style={{ margin: 0, color: "#071b33" }}>{m.title}</h3>
                {m.description && <p style={{ margin: 0, color: "#6b7c93", fontSize: ".85rem" }}>{m.description}</p>}
                <div style={{ marginTop: "auto", display: "flex", gap: 10, paddingTop: 8 }}>
                  <a href={m.file_url} target="_blank" rel="noreferrer" style={{ fontWeight: 700, fontSize: ".85rem", color: "#7c3aed", textDecoration: "none" }}>
                    View →
                  </a>
                  <a href={m.file_url} download style={{ fontWeight: 700, fontSize: ".85rem", color: "#155eef", textDecoration: "none" }}>
                    Download ↓
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
