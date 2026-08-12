import type { Instructor } from "@/lib/academy/types";

export function InstructorProfile({ instructor }: { instructor: Instructor }) {
  const initials = instructor.name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <div className="card" style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
      <span style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#155eef,#18a999)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", fontWeight: 900, flexShrink: 0 }}>
        {initials}
      </span>
      <div style={{ flex: 1, minWidth: 240 }}>
        <h3 style={{ margin: 0 }}>{instructor.name}</h3>
        <p style={{ marginTop: 4, marginBottom: 0, color: "var(--blue)", fontSize: ".92rem", fontWeight: 700 }}>{instructor.title}</p>
        <p style={{ marginTop: 12 }}>{instructor.bio}</p>
        <div style={{ display: "flex", flexWrap: "wrap", marginTop: 4 }}>
          {instructor.teaches.map((t) => (
            <span className="badge" key={t}>{t}</span>
          ))}
        </div>
        <ul className="check-list" style={{ marginTop: 16 }}>
          {instructor.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
