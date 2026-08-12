import Link from "next/link";
import type { Program } from "@/lib/academy/types";

export function ProgramCard({ program }: { program: Program }) {
  const isLive = program.status === "live";
  return (
    <article className="card" style={{ display: "flex", flexDirection: "column", opacity: isLive ? 1 : 0.85 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <h3 style={{ margin: 0 }}>{program.name}</h3>
        {!isLive && <span className="badge">Coming soon</span>}
      </div>
      <p style={{ marginTop: 6 }}>{program.tagline}</p>
      <ul className="check-list" style={{ flex: 1, margin: "14px 0 20px" }}>
        {program.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      {isLive ? (
        <Link href={program.href} className="btn btn-primary">
          Explore {program.short}
        </Link>
      ) : (
        <span className="btn btn-secondary" style={{ cursor: "default", opacity: 0.7 }}>
          Coming soon
        </span>
      )}
    </article>
  );
}
