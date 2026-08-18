import { sql } from "@/lib/db";


let ready = false;
export async function ensureAnalyticsTables() {
  if (ready) return;

  await sql`
    CREATE TABLE IF NOT EXISTS skills (
      id          TEXT PRIMARY KEY,
      section     TEXT NOT NULL CHECK (section IN ('Math','RW')),
      label       TEXT NOT NULL,
      description TEXT,
      sort_order  INTEGER DEFAULT 0
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS assessments (
      id            TEXT PRIMARY KEY,
      student_id    TEXT NOT NULL,
      type          TEXT NOT NULL CHECK (type IN ('diagnostic','mock','quiz','lecture_quiz')),
      source_id     TEXT,
      taken_at      TIMESTAMPTZ DEFAULT NOW(),
      total_score   INTEGER,
      rw_score      INTEGER,
      math_score    INTEGER
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS question_results (
      id            TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
      skill_id      TEXT REFERENCES skills(id),
      is_correct    BOOLEAN NOT NULL,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS ai_tutor_sessions (
      id            TEXT PRIMARY KEY,
      student_id    TEXT NOT NULL,
      started_at    TIMESTAMPTZ DEFAULT NOW(),
      ended_at      TIMESTAMPTZ,
      message_count INTEGER DEFAULT 1
    )
  `;

  ready = true;
}

// ─── Skills ──────────────────────────────────────────────────────────────────

export const SAT_SKILLS = [
  { id: "sat_algebra",       section: "Math", label: "Algebra",                       description: "Linear equations, systems, inequalities", sort_order: 1 },
  { id: "sat_advanced_math", section: "Math", label: "Advanced Math / Functions",     description: "Quadratics, polynomials, functions",       sort_order: 2 },
  { id: "sat_data_analysis", section: "Math", label: "Data Analysis",                 description: "Statistics, probability, data tables",     sort_order: 3 },
  { id: "sat_geometry",      section: "Math", label: "Geometry & Trigonometry",       description: "Shapes, area, trig ratios",                sort_order: 4 },
  { id: "sat_vocabulary",    section: "RW",   label: "Vocabulary in Context",         description: "Word meaning from context",                sort_order: 5 },
  { id: "sat_inference",     section: "RW",   label: "Reading Comprehension",         description: "Inference, main idea, evidence",           sort_order: 6 },
  { id: "sat_grammar",       section: "RW",   label: "Grammar & Sentence Structure",  description: "Punctuation, agreement, parallelism",      sort_order: 7 },
  { id: "sat_transitions",   section: "RW",   label: "Transitions & Essay Logic",     description: "Connective words, rhetoric, essay flow",   sort_order: 8 },
] as const;

export type SkillId = typeof SAT_SKILLS[number]["id"];

export async function seedSkills() {
  await ensureAnalyticsTables();
  for (const s of SAT_SKILLS) {
    await sql`
      INSERT INTO skills (id, section, label, description, sort_order)
      VALUES (${s.id}, ${s.section}, ${s.label}, ${s.description}, ${s.sort_order})
      ON CONFLICT (id) DO UPDATE SET label = ${s.label}, description = ${s.description}
    `;
  }
}

export async function getSkills() {
  await ensureAnalyticsTables();
  return sql`SELECT * FROM skills ORDER BY sort_order`;
}

// Map topic text → skill_id (used when tagging existing quiz topics)
export function inferSkillFromTopic(topic: string): SkillId | null {
  const t = topic.toLowerCase();
  if (t.includes("algebra") || t.includes("linear") || t.includes("equation") || t.includes("inequality") || t.includes("system")) return "sat_algebra";
  if (t.includes("quadratic") || t.includes("polynomial") || t.includes("function") || t.includes("exponent") || t.includes("radical")) return "sat_advanced_math";
  if (t.includes("statistic") || t.includes("probabilit") || t.includes("data") || t.includes("chart") || t.includes("table")) return "sat_data_analysis";
  if (t.includes("geometry") || t.includes("area") || t.includes("trigon") || t.includes("angle") || t.includes("circle")) return "sat_geometry";
  if (t.includes("vocabular") || t.includes("word") || t.includes("meaning") || t.includes("context")) return "sat_vocabulary";
  if (t.includes("inference") || t.includes("comprehension") || t.includes("main idea") || t.includes("evidence") || t.includes("reading")) return "sat_inference";
  if (t.includes("grammar") || t.includes("punctuation") || t.includes("agreement") || t.includes("sentence")) return "sat_grammar";
  if (t.includes("transition") || t.includes("rhetoric") || t.includes("essay") || t.includes("logic")) return "sat_transitions";
  return null;
}

// ─── Assessments ─────────────────────────────────────────────────────────────

export async function saveAssessment(
  studentId: string,
  type: "diagnostic" | "mock" | "quiz" | "lecture_quiz",
  sourceId: string,
  totalScore: number,
  rwScore?: number,
  mathScore?: number
) {
  await ensureAnalyticsTables();
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO assessments (id, student_id, type, source_id, total_score, rw_score, math_score)
    VALUES (${id}, ${studentId}, ${type}, ${sourceId}, ${totalScore}, ${rwScore ?? null}, ${mathScore ?? null})
  `;
  return id;
}

export async function saveQuestionResults(
  assessmentId: string,
  results: { skillId: string | null; isCorrect: boolean }[]
) {
  await ensureAnalyticsTables();
  for (const r of results) {
    await sql`
      INSERT INTO question_results (id, assessment_id, skill_id, is_correct)
      VALUES (${crypto.randomUUID()}, ${assessmentId}, ${r.skillId ?? null}, ${r.isCorrect})
    `;
  }
}

export async function getLatestAssessment(studentId: string) {
  await ensureAnalyticsTables();
  const rows = await sql`
    SELECT * FROM assessments
    WHERE student_id = ${studentId} AND total_score IS NOT NULL
    ORDER BY taken_at DESC LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getAssessmentHistory(studentId: string) {
  await ensureAnalyticsTables();
  return sql`
    SELECT * FROM assessments
    WHERE student_id = ${studentId} AND total_score IS NOT NULL
    ORDER BY taken_at ASC
  `;
}

// ─── Strengths / Weaknesses ───────────────────────────────────────────────────

export interface SkillAccuracy {
  skillId: string;
  label: string;
  section: string;
  correct: number;
  total: number;
  accuracy: number; // 0-100
}

export async function getSkillAccuracy(studentId: string): Promise<SkillAccuracy[]> {
  await ensureAnalyticsTables();
  const rows = await sql`
    SELECT
      s.id AS skill_id, s.label, s.section,
      COUNT(qr.id) FILTER (WHERE qr.is_correct)::int AS correct,
      COUNT(qr.id)::int AS total
    FROM skills s
    LEFT JOIN (
      question_results qr
      JOIN assessments a ON a.id = qr.assessment_id AND a.student_id = ${studentId}
    ) ON qr.skill_id = s.id
    GROUP BY s.id, s.label, s.section, s.sort_order
    ORDER BY s.sort_order
  `;

  return (rows as { skill_id: string; label: string; section: string; correct: number; total: number }[]).map(r => ({
    skillId: r.skill_id,
    label: r.label,
    section: r.section,
    correct: r.correct ?? 0,
    total: r.total ?? 0,
    accuracy: r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0,
  }));
}

export async function getStrengthsAndFocus(studentId: string): Promise<{ strengths: string[]; focusAreas: string[] }> {
  const skills = await getSkillAccuracy(studentId);
  const withData = skills.filter(s => s.total >= 3); // need at least 3 attempts to be meaningful

  const sorted = [...withData].sort((a, b) => b.accuracy - a.accuracy);
  const strengths  = sorted.filter(s => s.accuracy >= 70).slice(0, 3).map(s => s.label);
  const focusAreas = sorted.filter(s => s.accuracy < 60).slice(-3).reverse().map(s => s.label);

  return { strengths, focusAreas };
}

// ─── AI Tutor Sessions ────────────────────────────────────────────────────────

export async function logAITutorSession(studentId: string): Promise<string> {
  await ensureAnalyticsTables();
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO ai_tutor_sessions (id, student_id, started_at)
    VALUES (${id}, ${studentId}, NOW())
  `;
  return id;
}

export async function endAITutorSession(sessionId: string, messageCount: number) {
  await ensureAnalyticsTables();
  await sql`
    UPDATE ai_tutor_sessions
    SET ended_at = NOW(), message_count = ${messageCount}
    WHERE id = ${sessionId}
  `;
}

export async function getAITutorUsage(studentId: string, since?: string) {
  await ensureAnalyticsTables();
  const rows = since
    ? await sql`
        SELECT COUNT(*)::int AS session_count,
               SUM(EXTRACT(EPOCH FROM (COALESCE(ended_at, NOW()) - started_at)) / 3600.0)::numeric(10,1) AS total_hours,
               SUM(message_count)::int AS total_messages
        FROM ai_tutor_sessions
        WHERE student_id = ${studentId} AND started_at >= ${since}
      `
    : await sql`
        SELECT COUNT(*)::int AS session_count,
               SUM(EXTRACT(EPOCH FROM (COALESCE(ended_at, NOW()) - started_at)) / 3600.0)::numeric(10,1) AS total_hours,
               SUM(message_count)::int AS total_messages
        FROM ai_tutor_sessions
        WHERE student_id = ${studentId}
      `;
  return rows[0] ?? { session_count: 0, total_hours: 0, total_messages: 0 };
}

// ─── AI Narrative Generation ──────────────────────────────────────────────────

export async function generateReportNarrative(metrics: {
  studentName: string;
  weekNo: number;
  attendanceStatus: string;
  homeworkDone: number;
  homeworkTotal: number;
  aiSessions: number;
  aiHours: number;
  latestScore: number | null;
  targetScore: number | null;
  scoreDelta: number | null;
  strengths: string[];
  focusAreas: string[];
  coachNote: string;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  // Fallback template (no AI key needed)
  function fallback(): string {
    const att = metrics.attendanceStatus === "present" ? "attended this week's class" : metrics.attendanceStatus === "late" ? "joined class late this week" : "was not recorded for this week's class";
    const hw  = metrics.homeworkTotal > 0 ? `completed ${metrics.homeworkDone} of ${metrics.homeworkTotal} homework assignments` : "had no assignments this week";
    const sc  = metrics.latestScore ? `latest mock score is ${metrics.latestScore}${metrics.scoreDelta !== null && metrics.scoreDelta !== 0 ? ` (${metrics.scoreDelta > 0 ? "+" : ""}${metrics.scoreDelta} since last)` : ""}` : null;
    const str = metrics.strengths.length ? `showing strength in ${metrics.strengths.slice(0, 2).join(" and ")}` : null;
    const foc = metrics.focusAreas.length ? `The main focus area this week is ${metrics.focusAreas[0]}.` : "";

    return [
      `${metrics.studentName} ${att} and ${hw}.`,
      sc ? `Their ${sc}${metrics.targetScore ? `, moving toward the ${metrics.targetScore} target` : ""}.` : null,
      str ? `${metrics.studentName} is ${str}.` : null,
      foc,
      metrics.aiSessions > 0 ? `They completed ${metrics.aiSessions} AI tutor session${metrics.aiSessions !== 1 ? "s" : ""} this week.` : null,
    ].filter(Boolean).join(" ");
  }

  if (!apiKey) return fallback();

  const prompt = `You write concise, warm parent progress reports for an SAT prep program.

Write a 2-3 sentence narrative for the weekly report using ONLY these real metrics. Do not invent numbers or guarantee outcomes.

Student: ${metrics.studentName}
Week: ${metrics.weekNo}
Attendance: ${metrics.attendanceStatus}
Homework: ${metrics.homeworkDone}/${metrics.homeworkTotal} done
AI tutor: ${metrics.aiSessions} sessions (${metrics.aiHours}h)
${metrics.latestScore ? `Latest score: ${metrics.latestScore}${metrics.scoreDelta !== null ? ` (${metrics.scoreDelta >= 0 ? "+" : ""}${metrics.scoreDelta})` : ""}` : "No score recorded yet"}
${metrics.targetScore ? `Target: ${metrics.targetScore}` : ""}
Strengths: ${metrics.strengths.length ? metrics.strengths.join(", ") : "none recorded yet"}
Focus areas: ${metrics.focusAreas.length ? metrics.focusAreas.join(", ") : "none recorded yet"}
${metrics.coachNote ? `Coach context: ${metrics.coachNote}` : ""}

Rules:
- 2-3 sentences only
- Mention effort/behavior before scores
- Name one strength and one focus area if available
- Encouraging but honest
- No score guarantees, no official claims
- Do not start with "Dear parent" or similar salutation`;

  try {
    const body = JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 200,
    });

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey.trim()}` },
      body,
      cache: "no-store",
    });

    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text || fallback();
  } catch {
    return fallback();
  }
}

export async function generateOLevelReportNarrative(metrics: {
  studentName: string;
  weekNo: number;
  attendanceStatus: string;
  subjects: { subjectLabel: string; attempts: number; avgPercent: number | null }[];
  strengths: string[];
  focusAreas: string[];
  coachNote: string;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  function fallback(): string {
    const att = metrics.attendanceStatus === "present" ? "attended this week's class" : metrics.attendanceStatus === "late" ? "joined class late this week" : "was not recorded for this week's class";
    const withAttempts = metrics.subjects.filter((s) => s.attempts > 0);
    const subj = withAttempts.length
      ? `completed ${withAttempts.length} quiz attempt${withAttempts.length !== 1 ? "s" : ""} across ${withAttempts.map((s) => s.subjectLabel).join(" and ")}`
      : "has not attempted a quiz yet this week";
    const str = metrics.strengths.length ? `showing strength in ${metrics.strengths.slice(0, 2).join(" and ")}` : null;
    const foc = metrics.focusAreas.length ? `The main focus area this week is ${metrics.focusAreas[0]}.` : "";

    return [
      `${metrics.studentName} ${att} and ${subj}.`,
      str ? `${metrics.studentName} is ${str}.` : null,
      foc,
    ].filter(Boolean).join(" ");
  }

  if (!apiKey) return fallback();

  const subjectLines = metrics.subjects
    .map((s) => `${s.subjectLabel}: ${s.attempts > 0 ? `${s.avgPercent}% average across ${s.attempts} quiz attempt${s.attempts !== 1 ? "s" : ""}` : "no quiz attempts yet"}`)
    .join("\n");

  const prompt = `You write concise, warm parent progress reports for a Cambridge O Level / IGCSE tuition program.

Write a 2-3 sentence narrative for the weekly report using ONLY these real metrics. Do not invent numbers or guarantee outcomes or exam grades.

Student: ${metrics.studentName}
Week: ${metrics.weekNo}
Attendance: ${metrics.attendanceStatus}
Subjects:
${subjectLines || "No subjects unlocked yet"}
Strengths: ${metrics.strengths.length ? metrics.strengths.join(", ") : "none recorded yet"}
Focus areas: ${metrics.focusAreas.length ? metrics.focusAreas.join(", ") : "none recorded yet"}
${metrics.coachNote ? `Coach context: ${metrics.coachNote}` : ""}

Rules:
- 2-3 sentences only
- Mention effort/behavior before quiz scores
- Name one strength and one focus area if available
- Encouraging but honest
- No grade guarantees, no official Cambridge claims
- Do not start with "Dear parent" or similar salutation`;

  try {
    const body = JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 200,
    });

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey.trim()}` },
      body,
      cache: "no-store",
    });

    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text || fallback();
  } catch {
    return fallback();
  }
}
