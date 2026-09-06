import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPublishedAmnaShamimaLectures } from "@/lib/amnaShamimaLectures";

export const metadata: Metadata = { title: "Lectures", robots: { index: false, follow: false } };

export default async function AmnaShamimaLecturesPage() {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "amna-shamima") {
    redirect("/login?role=student&program=amna-shamima&next=/amna-shamima/portal/lectures");
  }

  const lectures = await getPublishedAmnaShamimaLectures();

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 780 }}>
        <Link href="/amna-shamima/portal" style={{ color: "#6b7c93", fontSize: ".85rem", textDecoration: "none" }}>← Portal</Link>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "10px 0 24px" }}>Lectures</h1>

        {lectures.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "#6b7c93" }}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>🎥</div>
            <p style={{ fontWeight: 700 }}>No lectures yet</p>
            <p style={{ fontSize: ".88rem" }}>Check back soon — lectures are added regularly.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            {lectures.map((lec) => (
              <Link key={lec.id} href={`/amna-shamima/portal/lectures/${lec.id}`} className="card" style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: 0, padding: 0, overflow: "hidden" }}>
                <div style={{ height: 120, background: "linear-gradient(135deg,#0c1629,#1e3a5f)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {lec.thumbnail_url
                    ? <img src={lec.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    : <span style={{ fontSize: "2rem" }}>🎬</span>}
                </div>
                <div style={{ padding: 16 }}>
                  <h3 style={{ margin: 0, color: "#071b33" }}>{lec.title}</h3>
                  {lec.description && <p style={{ margin: "4px 0 0", color: "#6b7c93", fontSize: ".85rem" }}>{lec.description}</p>}
                  <span style={{ marginTop: 10, display: "inline-block", fontWeight: 700, fontSize: ".85rem", color: "#7c3aed" }}>Watch →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
