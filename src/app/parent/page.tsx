"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface SkillAccuracy {
  skillId: string; label: string; section: string;
  correct: number; total: number; accuracy: number;
}

interface Metrics {
  student: string; week: number;
  attendance: { status: string; sessionTitle?: string };
  homework: { done: number; assigned: number };
  practice: { aiSessions: number };
  score: { latestMock: number | null; target: number | null; deltaSinceLast: number | null };
  strengths: string[];
  focusAreas: string[];
}

interface Report {
  id: string; week_no: number; period_start: string; period_end: string;
  metrics_json: Metrics; coach_note: string; parent_action: string; status: string;
}

interface HWItem {
  id: string; week_no: number; title: string; due_at: string | null; status: string;
}

interface AttItem {
  status: string; marked_at: string; title: string; scheduled_at: string;
}

function fmt(d: string) { return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }); }

export default function ParentPortal() {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [student, setStudent] = useState<{ id: string; name: string; email: string } | null>(null);
  const [report, setReport]   = useState<Report | null>(null);
  const [homework, setHomework] = useState<HWItem[]>([]);
  const [attendance, setAttendance] = useState<AttItem[]>([]);
  const [skills, setSkills]   = useState<SkillAccuracy[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/parent/me").then(r => r.json()),
      fetch("/api/parent/skills").then(r => r.json()).catch(() => ({ skills: [] })),
    ]).then(([d, s]) => {
      if (d.error) { setError(d.error); return; }
      setStudent(d.student);
      setReport(d.latestReport ?? null);
      setHomework(d.homework ?? []);
      setAttendance(d.attendance ?? []);
      setSkills(s.skills ?? []);
    }).catch(() => setError("Failed to load data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <section className="section"><div className="container">
      <div className="card" style={{ maxWidth: 400 }}><p>Loading your report…</p></div>
    </div></section>
  );

  if (error) return (
    <section className="section"><div className="container">
      <div className="card" style={{ maxWidth: 480, textAlign: "center", padding: "40px 32px" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>🔒</div>
        <h2 style={{ color: "#071b33", marginBottom: 10 }}>No student linked yet</h2>
        <p style={{ color: "#6b7c93", lineHeight: 1.7 }}>{error}</p>
      </div>
    </div></section>
  );

  const m = report?.metrics_json;

  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="container" style={{ maxWidth: 820 }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#071b33,#0f2d54)", borderRadius: 20, padding: "28px 30px", marginBottom: 24, color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: ".72rem", fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "#5eead4", marginBottom: 6 }}>Parent Portal</div>
              <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 900 }}>{student?.name}</h1>
              <p style={{ margin: 0, color: "rgba(255,255,255,.6)", fontSize: ".88rem" }}>{student?.email}</p>
            </div>
            {report && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.5)", marginBottom: 4 }}>Latest report</div>
                <div style={{ fontWeight: 700 }}>Week {report.week_no}</div>
                <div style={{ fontSize: ".78rem", color: "rgba(255,255,255,.5)" }}>{fmt(report.period_start)} – {fmt(report.period_end)}</div>
              </div>
            )}
          </div>

          {m?.score?.latestMock && (
            <div style={{ marginTop: 20, padding: "16px 18px", background: "rgba(255,255,255,.07)", borderRadius: 12, border: "1px solid rgba(255,255,255,.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.5)", marginBottom: 2 }}>Latest score</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 900 }}>
                    {m.score.latestMock}
                    {m.score.deltaSinceLast !== null && (
                      <span style={{ fontSize: ".85rem", fontWeight: 700, color: m.score.deltaSinceLast >= 0 ? "#4ade80" : "#f87171", marginLeft: 8 }}>
                        {m.score.deltaSinceLast >= 0 ? "▲" : "▼"} {Math.abs(m.score.deltaSinceLast)}
                      </span>
                    )}
                  </div>
                </div>
                {m.score.target && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.5)", marginBottom: 2 }}>Target</div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#5eead4" }}>{m.score.target}</div>
                  </div>
                )}
              </div>
              {m.score.target && (
                <div style={{ height: 8, background: "rgba(255,255,255,.12)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "linear-gradient(90deg,#155eef,#18a999)", borderRadius: 99, width: `${Math.min(100, ((m.score.latestMock - 800) / (m.score.target - 800)) * 100)}%` }} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current week stats */}
        {m && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
            {[
              {
                icon: m.attendance.status === "present" ? "✅" : m.attendance.status === "late" ? "🕐" : m.attendance.status === "not recorded" ? "—" : "❌",
                label: "Attendance",
                value: m.attendance.status === "present" ? "Present" : m.attendance.status === "late" ? "Late" : m.attendance.status === "not recorded" ? "Not recorded" : "Absent",
                bg: m.attendance.status === "present" ? "#f0fdf4" : "#fff7ed",
                border: m.attendance.status === "present" ? "#86efac" : "#fdba74",
                color: m.attendance.status === "present" ? "#15803d" : "#92400e",
              },
              {
                icon: "📚",
                label: "Homework",
                value: `${m.homework.done} / ${m.homework.assigned}`,
                sub: "assignments done",
                bg: m.homework.done === m.homework.assigned && m.homework.assigned > 0 ? "#f0fdf4" : "#fffbeb",
                border: m.homework.done === m.homework.assigned && m.homework.assigned > 0 ? "#86efac" : "#fde68a",
                color: "#344054",
              },
              {
                icon: "🤖",
                label: "AI Practice",
                value: `${m.practice.aiSessions} sessions`,
                bg: "#eff6ff",
                border: "#bfdbfe",
                color: "#344054",
              },
            ].map(c => (
              <div key={c.label} style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 16, padding: "18px 20px" }}>
                <div style={{ fontSize: "1.4rem", marginBottom: 8 }}>{c.icon}</div>
                <div style={{ fontSize: ".72rem", fontWeight: 800, color: "#6b7c93", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#071b33" }}>{c.value}</div>
                {"sub" in c && c.sub && <div style={{ fontSize: ".75rem", color: "#6b7c93", marginTop: 2 }}>{c.sub}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Strengths & Focus */}
        {m && (m.strengths.length > 0 || m.focusAreas.length > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
            {m.strengths.length > 0 && (
              <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 16, padding: "20px 22px" }}>
                <div style={{ fontSize: ".72rem", fontWeight: 800, color: "#15803d", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>✦ Strengths</div>
                {m.strengths.map(s => <div key={s} style={{ fontSize: ".88rem", fontWeight: 700, color: "#065f46", marginBottom: 8 }}>✓ {s}</div>)}
              </div>
            )}
            {m.focusAreas.length > 0 && (
              <div style={{ background: "#fff7ed", border: "1.5px solid #fdba74", borderRadius: 16, padding: "20px 22px" }}>
                <div style={{ fontSize: ".72rem", fontWeight: 800, color: "#c2410c", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>⚡ Focus areas</div>
                {m.focusAreas.map(f => <div key={f} style={{ fontSize: ".88rem", fontWeight: 700, color: "#9a3412", marginBottom: 8 }}>→ {f}</div>)}
              </div>
            )}
          </div>
        )}

        {/* Coach note & parent action */}
        {report?.coach_note && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
            <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 16, padding: "20px 22px" }}>
              <div style={{ fontSize: ".72rem", fontWeight: 800, color: "#1d4ed8", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10 }}>💬 Coach note</div>
              <p style={{ margin: 0, fontSize: ".88rem", color: "#1e3a5f", lineHeight: 1.7, fontStyle: "italic" }}>"{report.coach_note}"</p>
              <div style={{ marginTop: 10, fontSize: ".75rem", color: "#6b7c93", fontWeight: 700 }}>— Ibrahim Malick</div>
            </div>
            {report.parent_action && (
              <div style={{ background: "linear-gradient(135deg,#155eef,#18a999)", borderRadius: 16, padding: "20px 22px", color: "#fff" }}>
                <div style={{ fontSize: ".72rem", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10, color: "rgba(255,255,255,.7)" }}>⭐ Your action</div>
                <p style={{ margin: 0, fontSize: ".92rem", fontWeight: 800, lineHeight: 1.5 }}>{report.parent_action}</p>
              </div>
            )}
          </div>
        )}

        {!report && (
          <div className="card" style={{ textAlign: "center", padding: "40px 32px", marginBottom: 24 }}>
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>📋</div>
            <p style={{ fontWeight: 800, color: "#071b33", marginBottom: 6 }}>No report yet</p>
            <p style={{ color: "#6b7c93", fontSize: ".88rem" }}>Your first weekly report will appear here after the first class session.</p>
          </div>
        )}

        {/* Skill accuracy bars */}
        {skills.some(s => s.total > 0) && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: ".72rem", fontWeight: 800, color: "#6b7c93", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 16 }}>📊 Skill breakdown</div>
            {(["Math", "RW"] as const).map(section => {
              const sectionSkills = skills.filter(s => s.section === section);
              if (!sectionSkills.some(s => s.total > 0)) return null;
              return (
                <div key={section} style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: ".75rem", fontWeight: 800, color: "#344054", marginBottom: 10 }}>{section === "Math" ? "Math" : "Reading & Writing"}</div>
                  {sectionSkills.map(s => (
                    <div key={s.skillId} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: ".82rem", fontWeight: 600, color: "#344054" }}>{s.label}</span>
                        <span style={{ fontSize: ".78rem", fontWeight: 800, color: s.total === 0 ? "#9ca3af" : s.accuracy >= 70 ? "#15803d" : s.accuracy >= 50 ? "#d97706" : "#dc2626" }}>
                          {s.total === 0 ? "—" : `${s.accuracy}%`}
                        </span>
                      </div>
                      <div style={{ height: 7, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
                        {s.total > 0 && (
                          <div style={{ height: "100%", borderRadius: 99, width: `${s.accuracy}%`, background: s.accuracy >= 70 ? "#22c55e" : s.accuracy >= 50 ? "#f59e0b" : "#ef4444", transition: "width .4s ease" }} />
                        )}
                      </div>
                      {s.total > 0 && <div style={{ fontSize: ".7rem", color: "#9ca3af", marginTop: 2 }}>{s.correct} / {s.total} correct</div>}
                    </div>
                  ))}
                </div>
              );
            })}
            <p style={{ margin: "8px 0 0", fontSize: ".72rem", color: "#9ca3af" }}>Based on all quiz and practice attempts. Updates after each session.</p>
          </div>
        )}

        {/* Homework history */}
        {homework.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: ".72rem", fontWeight: 800, color: "#6b7c93", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 16 }}>📚 Homework history</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {homework.slice(0, 10).map(hw => (
                <div key={hw.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: hw.status === "done" ? "#f0fdf4" : hw.status === "missed" ? "#fef2f2" : "#f8fafc", border: `1.5px solid ${hw.status === "done" ? "#86efac" : hw.status === "missed" ? "#fca5a5" : "#e8eef6"}` }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: ".88rem", color: "#071b33" }}>{hw.title}</div>
                    <div style={{ fontSize: ".75rem", color: "#6b7c93" }}>Week {hw.week_no}{hw.due_at ? ` · Due ${fmt(hw.due_at)}` : ""}</div>
                  </div>
                  <span style={{ fontSize: ".78rem", fontWeight: 800, padding: "4px 10px", borderRadius: 6, background: hw.status === "done" ? "#dcfce7" : hw.status === "missed" ? "#fee2e2" : "#f3f4f6", color: hw.status === "done" ? "#15803d" : hw.status === "missed" ? "#dc2626" : "#6b7c93" }}>
                    {hw.status === "done" ? "✓ Done" : hw.status === "missed" ? "✗ Missed" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendance history */}
        {attendance.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: ".72rem", fontWeight: 800, color: "#6b7c93", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 16 }}>📅 Attendance history</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {attendance.slice(0, 8).map((a, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: "#f8fafc", border: "1.5px solid #e8eef6" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: ".88rem", color: "#071b33" }}>{a.title}</div>
                    <div style={{ fontSize: ".75rem", color: "#6b7c93" }}>{fmt(a.scheduled_at)}</div>
                  </div>
                  <span style={{ fontSize: ".78rem", fontWeight: 800, padding: "4px 10px", borderRadius: 6, background: a.status === "present" ? "#dcfce7" : a.status === "late" ? "#fef3c7" : "#fee2e2", color: a.status === "present" ? "#15803d" : a.status === "late" ? "#92400e" : "#dc2626" }}>
                    {a.status === "present" ? "✓ Present" : a.status === "late" ? "🕐 Late" : "✗ Absent"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: "14px 18px", borderRadius: 12, background: "#fffbeb", border: "1px solid #fde68a", fontSize: ".75rem", color: "#92400e" }}>
          SAT® is a registered trademark of College Board. The Digital Tutor is an independent preparation service with no affiliation or score guarantee.
        </div>
      </div>
    </section>
  );
}
