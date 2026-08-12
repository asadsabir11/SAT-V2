import Link from "next/link";
import type { Subject } from "@/lib/academy/types";

export function SubjectCard({ subject }: { subject: Subject }) {
  const liveCount = subject.classModel.filter((c) => c.type !== "office-hours").length;

  return (
    <article className="card" style={{ display: "flex", flexDirection: "column" }}>
      <h3 style={{ marginTop: 0 }}>{subject.name}</h3>
      {subject.syllabusRef && (
        <p style={{ marginTop: -6, marginBottom: 8, color: "var(--blue)", fontSize: ".82rem", fontWeight: 700 }}>
          {subject.syllabusRef}
        </p>
      )}
      <p style={{ flex: 1 }}>{subject.short}</p>
      <ul className="check-list" style={{ margin: "14px 0 20px" }}>
        <li>{liveCount} live {liveCount === 1 ? "session" : "sessions"} / week</li>
        <li>Open office hours</li>
        <li>Past-paper practice</li>
        <li>AI study support between classes</li>
      </ul>
      <Link href={`/o-level/${subject.slug}`} className="btn btn-secondary">
        Explore {subject.name}
      </Link>
    </article>
  );
}
