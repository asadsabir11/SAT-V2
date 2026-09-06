import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAmnaShamimaLectureById } from "@/lib/amnaShamimaLectures";

export const metadata: Metadata = { title: "Lecture", robots: { index: false, follow: false } };

export default async function AmnaShamimaLecturePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "student" || session.program !== "amna-shamima") {
    redirect("/login?role=student&program=amna-shamima&next=/amna-shamima/portal/lectures");
  }

  const { id } = await params;
  const lecture = await getAmnaShamimaLectureById(id);
  if (!lecture || !lecture.is_published) {
    notFound();
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 820 }}>
        <Link href="/amna-shamima/portal/lectures" style={{ color: "#6b7c93", fontSize: ".85rem", textDecoration: "none" }}>← Lectures</Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#071b33", margin: "10px 0 16px" }}>{lecture.title}</h1>
        <div style={{ borderRadius: 14, overflow: "hidden", background: "#000", marginBottom: 16 }}>
          <video src={lecture.video_url} controls style={{ width: "100%", display: "block", maxHeight: "70vh" }} />
        </div>
        {lecture.description && <p style={{ color: "#344054", lineHeight: 1.7 }}>{lecture.description}</p>}
      </div>
    </section>
  );
}
