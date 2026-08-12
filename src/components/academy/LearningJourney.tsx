const DEFAULT_STEPS = [
  "Take Diagnostic",
  "Get Your Study Plan",
  "Attend Live Classes",
  "Practice During the Week",
  "Ask AI for Immediate Help",
  "Join Open Office Hours",
  "Complete Past-Paper Practice",
  "Take Monthly Assessments",
  "Parents Receive Progress Updates",
];

/** Reusable "How It Works" journey. Steps are configurable. */
export function LearningJourney({
  steps = DEFAULT_STEPS,
  title = "How it works",
}: {
  steps?: string[];
  title?: string;
}) {
  return (
    <div>
      <h2 className="title" style={{ textAlign: "center", margin: "0 auto 8px" }}>{title}</h2>
      <div className="grid grid-3" style={{ marginTop: 24 }}>
        {steps.map((step, i) => (
          <div className="card" key={step} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <span style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--blue)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".9rem", fontWeight: 900, flexShrink: 0 }}>
              {i + 1}
            </span>
            <span style={{ paddingTop: 6, color: "var(--navy)", fontWeight: 700, fontSize: ".92rem" }}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Compact horizontal model strip: Live Class → Homework → AI Help → … */
export function LearningModelStrip({
  items = ["Live Class", "Homework", "AI Help", "Office Hours", "Past Papers", "Progress Report"],
}: {
  items?: string[];
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 8 }}>
      {items.map((item, i) => (
        <span key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="badge" style={{ margin: 0 }}>{item}</span>
          {i < items.length - 1 && <span style={{ color: "#5eead4" }}>→</span>}
        </span>
      ))}
    </div>
  );
}
