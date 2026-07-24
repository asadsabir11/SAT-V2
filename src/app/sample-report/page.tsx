import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sample Parent Progress Report",
  description: "See exactly what parents receive every week — attendance, homework, scores, strengths, focus areas, and one parent action.",
};

const STRENGTHS = ["Algebra", "Vocabulary in context"];
const FOCUS     = ["Transitions & essay logic", "Reading inference"];

const SKILLS = [
  { label: "Algebra",                   pct: 88, section: "Math" },
  { label: "Advanced math / functions", pct: 72, section: "Math" },
  { label: "Data analysis",             pct: 65, section: "Math" },
  { label: "Geometry & trig",           pct: 58, section: "Math" },
  { label: "Vocabulary in context",     pct: 84, section: "R&W"  },
  { label: "Reading inference",         pct: 52, section: "R&W"  },
  { label: "Grammar & sentence str.",   pct: 70, section: "R&W"  },
  { label: "Transitions & essay logic", pct: 44, section: "R&W"  },
];

function SkillBar({ label, pct, section }: { label: string; pct: number; section: string }) {
  const color = pct >= 75 ? "#15803d" : pct >= 60 ? "#b45309" : "#dc2626";
  const bg    = pct >= 75 ? "#dcfce7" : pct >= 60 ? "#fef3c7" : "#fee2e2";
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: ".75rem", padding: "2px 8px", borderRadius: 999, background: section === "Math" ? "#eff6ff" : "#f5f3ff", color: section === "Math" ? "#1d4ed8" : "#6d28d9", fontWeight: 700 }}>{section}</span>
          <span style={{ fontSize: ".88rem", fontWeight: 650, color: "#071b33" }}>{label}</span>
        </div>
        <span style={{ fontSize: ".82rem", fontWeight: 800, color, background: bg, padding: "2px 8px", borderRadius: 6 }}>{pct}%</span>
      </div>
      <div style={{ height: 7, borderRadius: 99, background: "#e8eef6", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: pct >= 75 ? "linear-gradient(90deg,#16a34a,#22c55e)" : pct >= 60 ? "linear-gradient(90deg,#d97706,#f59e0b)" : "linear-gradient(90deg,#dc2626,#ef4444)", borderRadius: 99, transition: "width .6s" }} />
      </div>
    </div>
  );
}

export default function SampleReport() {
  return (
    <>
      {/* Hero */}
      <section style={{ padding: "72px 0 0", background: "linear-gradient(150deg,#f0f6ff 0%,#f7fbff 50%,#edfdf9 100%)" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: 760 }}>
          <div className="eyebrow">Sample parent report</div>
          <h1 className="display" style={{ fontSize: "clamp(2rem,5vw,3.6rem)", margin: "12px auto 18px" }}>
            What parents receive<br />every week
          </h1>
          <p className="lead" style={{ margin: "0 auto 36px", fontSize: "1rem" }}>
            Every Friday, parents get a WhatsApp message + email with their child's
            real weekly progress. No jargon — just honest numbers, one clear action,
            and a direct line to the coach.
          </p>
          <div style={{ display: "inline-flex", gap: 10, padding: "8px 18px", borderRadius: 999, background: "#fffbeb", border: "1.5px solid #fde68a", color: "#92400e", fontSize: ".82rem", fontWeight: 700, marginBottom: 48 }}>
            ✦ This is a sample report — all data is illustrative
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>

            {/* Left — full web portal report */}
            <div>
              {/* Report header */}
              <div style={{ background: "linear-gradient(135deg,#071b33,#0f2d54)", borderRadius: 20, padding: "28px 30px", marginBottom: 20, color: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: ".72rem", fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "#5eead4", marginBottom: 6 }}>Weekly Progress Report</div>
                    <h2 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 900 }}>Ayesha Khan</h2>
                    <p style={{ margin: 0, color: "rgba(255,255,255,.6)", fontSize: ".88rem" }}>Week 4 of 8 · Core Plan · Karachi, Pakistan</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.5)", marginBottom: 4 }}>Report period</div>
                    <div style={{ fontWeight: 700, fontSize: ".9rem" }}>Jul 14 – Jul 20, 2026</div>
                  </div>
                </div>

                {/* Score bar */}
                <div style={{ marginTop: 24, padding: "18px 20px", background: "rgba(255,255,255,.06)", borderRadius: 14, border: "1px solid rgba(255,255,255,.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.5)", marginBottom: 2 }}>Latest mock score</div>
                      <div style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-.04em" }}>1150 <span style={{ fontSize: ".9rem", color: "#4ade80", fontWeight: 700 }}>▲ +40</span></div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.5)", marginBottom: 2 }}>Target score</div>
                      <div style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-.04em", color: "#5eead4" }}>1350</div>
                    </div>
                  </div>
                  <div style={{ position: "relative", height: 10, borderRadius: 99, background: "rgba(255,255,255,.12)", overflow: "hidden" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "57.5%", background: "linear-gradient(90deg,#155eef,#18a999)", borderRadius: 99 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: ".72rem", color: "rgba(255,255,255,.4)" }}>
                    <span>Baseline: 900</span>
                    <span>200 points to go</span>
                    <span>Target: 1350</span>
                  </div>
                </div>
              </div>

              {/* 4 metric cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 20 }}>
                {[
                  { icon: "✅", label: "Attendance", value: "Present", sub: "On time · Class on Wed 15 Jul", color: "#15803d", bg: "#f0fdf4", border: "#86efac" },
                  { icon: "📚", label: "Homework", value: "4 / 5", sub: "1 assignment pending", color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
                  { icon: "🤖", label: "AI Tutor sessions", value: "6 sessions", sub: "3.5 hours of practice", color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
                  { icon: "📈", label: "Score improvement", value: "+40 pts", sub: "Since last mock (1110 → 1150)", color: "#15803d", bg: "#f0fdf4", border: "#86efac" },
                ].map(m => (
                  <div key={m.label} style={{ background: m.bg, border: `1.5px solid ${m.border}`, borderRadius: 16, padding: "18px 20px" }}>
                    <div style={{ fontSize: "1.4rem", marginBottom: 8 }}>{m.icon}</div>
                    <div style={{ fontSize: ".72rem", fontWeight: 800, color: m.color, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#071b33", marginBottom: 2 }}>{m.value}</div>
                    <div style={{ fontSize: ".78rem", color: "#6b7c93" }}>{m.sub}</div>
                  </div>
                ))}
              </div>

              {/* Strengths & Focus */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 16, padding: "20px 22px" }}>
                  <div style={{ fontSize: ".72rem", fontWeight: 800, color: "#15803d", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>✦ Strengths this week</div>
                  {STRENGTHS.map(s => (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".8rem" }}>✓</div>
                      <span style={{ fontSize: ".88rem", fontWeight: 700, color: "#065f46" }}>{s}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#fff7ed", border: "1.5px solid #fdba74", borderRadius: 16, padding: "20px 22px" }}>
                  <div style={{ fontSize: ".72rem", fontWeight: 800, color: "#c2410c", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>⚡ Focus areas</div>
                  {FOCUS.map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".8rem" }}>→</div>
                      <span style={{ fontSize: ".88rem", fontWeight: 700, color: "#9a3412" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill breakdown */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ fontSize: ".72rem", fontWeight: 800, color: "#6b7c93", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 18 }}>Skill-by-skill accuracy</div>
                {SKILLS.map(s => <SkillBar key={s.label} {...s} />)}
              </div>

              {/* Coach note + Parent action */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 16, padding: "20px 22px" }}>
                  <div style={{ fontSize: ".72rem", fontWeight: 800, color: "#1d4ed8", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10 }}>💬 Coach note</div>
                  <p style={{ margin: 0, fontSize: ".88rem", color: "#1e3a5f", lineHeight: 1.7, fontStyle: "italic" }}>
                    "Ayesha's algebra is clicking — she solved 3 multi-step problems
                    independently this week. The gap now is transitions in Reading &amp;
                    Writing. We're drilling this Thursday."
                  </p>
                  <div style={{ marginTop: 12, fontSize: ".78rem", color: "#6b7c93", fontWeight: 700 }}>— Ibrahim Malick, Founder &amp; Coach</div>
                </div>
                <div style={{ background: "linear-gradient(135deg,#155eef,#18a999)", borderRadius: 16, padding: "20px 22px", color: "#fff" }}>
                  <div style={{ fontSize: ".72rem", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10, color: "rgba(255,255,255,.7)" }}>⭐ Your action this week</div>
                  <p style={{ margin: "0 0 14px", fontSize: ".95rem", fontWeight: 800, lineHeight: 1.5 }}>
                    Ask Ayesha to explain one "transition word" question to you before Friday.
                  </p>
                  <p style={{ margin: 0, fontSize: ".78rem", color: "rgba(255,255,255,.7)", lineHeight: 1.6 }}>
                    Students who explain concepts aloud retain them 2× better. You don't need to understand SAT — just listen.
                  </p>
                </div>
              </div>

              {/* Disclaimer */}
              <div style={{ padding: "14px 18px", borderRadius: 12, background: "#fffbeb", border: "1px solid #fde68a", fontSize: ".78rem", color: "#92400e", lineHeight: 1.6 }}>
                <strong>SAT® Disclaimer:</strong> SAT® is a registered trademark of College Board. The Digital Tutor is an independent preparation service with no affiliation, endorsement, or score guarantee. All reports reflect actual logged activity and practice data only — no scores or outcomes are guaranteed.
              </div>
            </div>

            {/* Right — WhatsApp preview + CTA */}
            <div style={{ position: "sticky", top: 24 }}>

              {/* WhatsApp card */}
              <div style={{ background: "#e5ddd5", borderRadius: 20, overflow: "hidden", marginBottom: 20, boxShadow: "0 8px 32px rgba(7,27,51,.14)" }}>
                <div style={{ background: "#075e54", padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#155eef,#18a999)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: ".85rem" }}>DT</div>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: ".9rem" }}>The Digital Tutor</div>
                    <div style={{ color: "rgba(255,255,255,.65)", fontSize: ".72rem" }}>Weekly update for Ayesha's parent</div>
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ background: "#fff", borderRadius: "0 12px 12px 12px", padding: "14px 16px", fontSize: ".82rem", lineHeight: 1.75, color: "#1a1a1a", boxShadow: "0 1px 2px rgba(0,0,0,.1)" }}>
                    <p style={{ margin: "0 0 8px", fontWeight: 800, color: "#075e54" }}>📊 Week 4 Report — Ayesha Khan</p>
                    <p style={{ margin: "0 0 6px" }}>✅ <strong>Attendance:</strong> Present</p>
                    <p style={{ margin: "0 0 6px" }}>📚 <strong>Homework:</strong> 4/5 done</p>
                    <p style={{ margin: "0 0 6px" }}>🤖 <strong>AI practice:</strong> 6 sessions (3.5 hrs)</p>
                    <p style={{ margin: "0 0 6px" }}>📈 <strong>Mock score:</strong> 1150 (+40 ▲)</p>
                    <p style={{ margin: "0 0 6px" }}>💪 <strong>Strong:</strong> Algebra, Vocabulary</p>
                    <p style={{ margin: "0 0 10px" }}>⚡ <strong>Focus:</strong> Transitions, Inference</p>
                    <p style={{ margin: "0 0 10px", padding: "8px 10px", background: "#f0fdf4", borderRadius: 8, fontStyle: "italic" }}>
                      Coach: "Algebra is clicking. Drilling transitions Thursday."
                    </p>
                    <p style={{ margin: "0 0 10px", padding: "8px 10px", background: "#eff6ff", borderRadius: 8, fontWeight: 700 }}>
                      ⭐ Your action: Ask Ayesha to explain one transition question this week.
                    </p>
                    <p style={{ margin: 0, color: "#6b7c93", fontSize: ".75rem" }}>
                      Full report → digital-tutor-sat-prep.vercel.app/parent<br />
                      Questions? Reply here or WhatsApp the coach.
                    </p>
                  </div>
                  <div style={{ textAlign: "right", fontSize: ".68rem", color: "#6b7c93", marginTop: 4 }}>Delivered Friday 8:00 PM · ✓✓</div>
                </div>
              </div>

              {/* What parents say */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ fontSize: ".72rem", fontWeight: 800, color: "#6b7c93", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 14 }}>Why parents love this</div>
                {[
                  { quote: "I finally know what my daughter is actually doing each week, not just whether she studied.", name: "Parent · Lagos" },
                  { quote: "The one action tip is brilliant — I'm part of her progress now, not just paying for it.", name: "Parent · Dhaka" },
                  { quote: "WhatsApp delivery means I see it instantly. No app to install, no login needed.", name: "Parent · Karachi" },
                ].map((t, i) => (
                  <div key={i} style={{ marginBottom: i < 2 ? 14 : 0, paddingBottom: i < 2 ? 14 : 0, borderBottom: i < 2 ? "1px solid #e8eef6" : "none" }}>
                    <p style={{ margin: "0 0 6px", fontSize: ".85rem", color: "#344054", lineHeight: 1.6, fontStyle: "italic" }}>"{t.quote}"</p>
                    <div style={{ fontSize: ".75rem", fontWeight: 700, color: "#6b7c93" }}>— {t.name}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{ background: "linear-gradient(135deg,#071b33,#0f2d54)", borderRadius: 18, padding: "24px 22px", textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,.7)", fontSize: ".82rem", margin: "0 0 8px" }}>Ready for real reports?</p>
                <h3 style={{ color: "#fff", margin: "0 0 16px", fontSize: "1.1rem", fontWeight: 900, lineHeight: 1.3 }}>Enroll your child and get weekly updates starting Week 1</h3>
                <Link href="/founder-cohort" className="btn btn-teal" style={{ width: "100%", marginBottom: 10, display: "block" }}>
                  Join the cohort →
                </Link>
                <Link href="/parent-webinar" style={{ color: "rgba(255,255,255,.55)", fontSize: ".78rem", fontWeight: 700 }}>
                  Attend the free parent webinar first
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works strip */}
      <section className="section soft" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div className="eyebrow">How it works</div>
            <h2 className="title" style={{ margin: "10px auto 0", maxWidth: 560 }}>Reports in 3 steps</h2>
          </div>
          <div className="grid grid-3">
            {[
              { n: "01", title: "We track everything", body: "Attendance, homework, AI tutor sessions, and quiz scores are logged automatically every week." },
              { n: "02", title: "Coach reviews & adds note", body: "The founder writes a personal coach note and selects one parent action — reviewed every Friday before sending." },
              { n: "03", title: "You receive it on WhatsApp", body: "A WhatsApp message arrives Friday evening with the summary + a link to the full portal for deeper detail." },
            ].map(s => (
              <div key={s.n} className="card" style={{ textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#155eef,#18a999)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: ".85rem", margin: "0 auto 16px" }}>{s.n}</div>
                <h3 style={{ marginTop: 0 }}>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
