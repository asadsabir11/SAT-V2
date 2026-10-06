"use client";
import { useEffect, useState } from "react";

type Program = "sat" | "o-level" | "punjab-9th";

// Tiny client-side island so the home page itself can stay fully static
// (prerendered, served from cache) while this one badge still reflects an
// admin toggle without needing a redeploy. Renders nothing until the fetch
// resolves, and nothing at all when the program isn't marked full — no
// layout shift either way since there's no placeholder to swap out.
export function EnrollmentBadge({ program }: { program: Program }) {
  const [full, setFull] = useState(false);

  useEffect(() => {
    fetch("/api/enrollment-status")
      .then((r) => r.json())
      .then((d) => setFull(d.statuses?.[program] === "full"))
      .catch(() => {});
  }, [program]);

  if (!full) return null;

  return (
    <span style={{ display: "inline-block", alignSelf: "flex-start", padding: "3px 10px", borderRadius: 999, fontSize: ".72rem", fontWeight: 800, background: "#fee2e2", color: "#991b1b", marginBottom: 10 }}>
      🔴 Fully Booked
    </span>
  );
}
