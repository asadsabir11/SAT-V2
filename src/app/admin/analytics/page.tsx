"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Skill { id: string; label: string; section: string; sort_order: number; }
interface SkillAccuracy { skillId: string; label: string; section: string; correct: number; total: number; accuracy: number; }
interface Student { id: string; name: string; email: string; program: string; }
interface OLevelSubjectPerf { subject: string; subjectLabel: string; attempts: number; avgPercent: number | null; bestPercent: number | null; weakTopics: string[]; }
interface OLevelAttempt { id: string; score: number; total: number; completed_at: string; subject: string; title: string; }

function SkillBar({ s }: { s: SkillAccuracy }) {
  const color = s.total === 0 ? "#e5e7eb" : s.accuracy >= 70 ? "#22c55e" : s.accuracy >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: ".85rem", fontWeight: 600, color: "#344054" }}>{s.label}</span>
        <span style={{ fontSize: ".82rem", fontWeight: 800, color: s.total === 0 ? "#9ca3af" : color }}>
          {s.total === 0 ? "No data" : `${s.accuracy}% (${s.correct}/${s.total})`}
        </span>
      </div>
      <div style={{ height: 8, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
        {s.total > 0 && <div style={{ height: "100%", borderRadius: 99, width: `${s.accuracy}%`, background: color }} />}
      </div>
    </div>
  );
}

function SubjectBar({ s }: { s: OLevelSubjectPerf }) {
  const color = s.attempts === 0 ? "#e5e7eb" : (s.avgPercent ?? 0) >= 70 ? "#22c55e" : (s.avgPercent ?? 0) >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: ".85rem", fontWeight: 600, color: "#344054" }}>{s.subjectLabel}</span>
        <span style={{ fontSize: ".82rem", fontWeight: 800, color: s.attempts === 0 ? "#9ca3af" : color }}>
          {s.attempts === 0 ? "No data" : `${s.avgPercent}% avg · ${s.attempts} attempt${s.attempts !== 1 ? "s" : ""} · best ${s.bestPercent}%`}
        </span>
      </div>
      <div style={{ height: 8, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
        {s.attempts > 0 && <div style={{ height: "100%", borderRadius: 99, width: `${s.avgPercent}%`, background: color }} />}
      </div>
      {s.weakTopics.length > 0 && (
        <p style={{ margin: "6px 0 0", fontSize: ".76rem", color: "#c2410c" }}>⚡ Needs work: {s.weakTopics.join(", ")}</p>
      )}
    </div>
  );
}

export default function AdminAnalytics() {
  const [skills, setSkills]     = useState<Skill[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("sat");
  const [accuracy, setAccuracy] = useState<SkillAccuracy[]>([]);
  const [oLevelSubjects, setOLevelSubjects] = useState<OLevelSubjectPerf[]>([]);
  const [oLevelAttempts, setOLevelAttempts] = useState<OLevelAttempt[]>([]);
  const [seeding, setSeeding]   = useState(false);
  const [loadingAcc, setLoadingAcc] = useState(false);

  const loadSkills = useCallback(async () => {
    const d = await fetch("/api/admin/skills").then(r => r.json());
    setSkills(d.skills ?? []);
  }, []);

  useEffect(() => {
    loadSkills();
    fetch("/api/admin/reports")
      .then(r => r.json())
      .then(d => setStudents(d.students ?? []));
  }, [loadSkills]);

  async function seedSkills() {
    setSeeding(true);
    await fetch("/api/admin/skills", { method: "POST" });
    await loadSkills();
    setSeeding(false);
  }

  async function loadAccuracy(studentId: string) {
    setSelected(studentId);
    setLoadingAcc(true);
    const d = await fetch(`/api/admin/analytics?studentId=${studentId}`).then(r => r.json());
    setSelectedProgram(d.program ?? "sat");
    setAccuracy(d.skills ?? []);
    setOLevelSubjects(d.subjects ?? []);
    setOLevelAttempts(d.recentAttempts ?? []);
    setLoadingAcc(false);
  }

  return (
    <section className="section"><div className="container">
      <Link href="/admin" style={{ color: "#6b7c93", fontSize: ".82rem", textDecoration: "none" }}>← Admin</Link>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#071b33", margin: "8px 0 4px" }}>Analytics</h1>
      <p style={{ color: "#6b7c93", fontSize: ".88rem", margin: "0 0 28px" }}>Skill accuracy per student. Populated from quiz and lecture quiz attempts.</p>

      {/* Skills table */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: ".95rem", color: "#071b33" }}>SAT Skills ({skills.length}/8)</h3>
          <button className="btn btn-primary" onClick={seedSkills} disabled={seeding} style={{ padding: "8px 18px", fontSize: ".82rem" }}>
            {seeding ? "Seeding…" : skills.length === 0 ? "Seed 8 skills →" : "Re-seed skills"}
          </button>
        </div>
        {skills.length === 0 ? (
          <p style={{ color: "#6b7c93", fontSize: ".88rem" }}>No skills in DB yet. Click “Seed 8 skills” to populate.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
            {(["Math", "RW"] as const).map(sec => (
              <div key={sec}>
                <div style={{ fontSize: ".75rem", fontWeight: 800, color: "#344054", marginBottom: 8 }}>{sec === "Math" ? "Math" : "Reading & Writing"}</div>
                {skills.filter(s => s.section === sec).map(s => (
                  <div key={s.id} style={{ padding: "8px 12px", borderRadius: 8, background: "#f8fafc", border: "1px solid #e8eef6", marginBottom: 6, fontSize: ".82rem", color: "#344054" }}>
                    {s.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Per-student accuracy */}
      <div className="card">
        <h3 style={{ margin: "0 0 16px", fontSize: ".95rem", color: "#071b33" }}>Student skill accuracy</h3>
        <div className="field" style={{ marginBottom: 20 }}>
          <label>Select student</label>
          <select value={selected} onChange={e => loadAccuracy(e.target.value)}>
            <option value="">— Select a student —</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} {s.program === "o-level" ? "(O Level)" : "(SAT)"}</option>)}
          </select>
        </div>

        {loadingAcc && <p style={{ color: "#6b7c93" }}>Loading…</p>}

        {!loadingAcc && selected && selectedProgram === "o-level" && (
          oLevelSubjects.length > 0 ? (
            <div>
              {oLevelSubjects.map(s => <SubjectBar key={s.subject} s={s} />)}

              {oLevelAttempts.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: ".78rem", fontWeight: 800, color: "#344054", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>
                    Recent attempts
                  </div>
                  {oLevelAttempts.map(a => (
                    <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: ".82rem" }}>
                      <span style={{ color: "#344054" }}>{a.title}</span>
                      <span style={{ color: "#6b7c93" }}>{a.total > 0 ? `${Math.round((a.score / a.total) * 100)}%` : "—"} · {new Date(a.completed_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                    </div>
                  ))}
                </div>
              )}

              <p style={{ margin: "16px 0 0", fontSize: ".72rem", color: "#9ca3af" }}>
                Subject performance is based on unlocked O-Level quiz attempts only.
              </p>
            </div>
          ) : (
            <p style={{ color: "#6b7c93", fontSize: ".88rem" }}>No quiz data yet for this student. Data populates as they complete O-Level quizzes.</p>
          )
        )}

        {!loadingAcc && selected && selectedProgram !== "o-level" && accuracy.length > 0 && (
          <div>
            {(["Math", "RW"] as const).map(sec => {
              const sSkills = accuracy.filter(s => s.section === sec);
              return (
                <div key={sec} style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: ".78rem", fontWeight: 800, color: "#344054", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>
                    {sec === "Math" ? "Math" : "Reading & Writing"}
                  </div>
                  {sSkills.map(s => <SkillBar key={s.skillId} s={s} />)}
                </div>
              );
            })}
            <p style={{ margin: 0, fontSize: ".72rem", color: "#9ca3af" }}>
              Skill tags are inferred from question topics. Tag more questions for better coverage.
            </p>
          </div>
        )}

        {!loadingAcc && selected && selectedProgram !== "o-level" && accuracy.every(s => s.total === 0) && (
          <p style={{ color: "#6b7c93", fontSize: ".88rem" }}>No quiz data yet for this student. Data populates as they complete quizzes.</p>
        )}
      </div>
    </div></section>
  );
}
