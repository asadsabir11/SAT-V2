import { sql } from "@/lib/db";
import type { OLevelLectureCategory } from "@/lib/lectures";

export type OLevelQuizQuestion = {
  id: string;
  topic: string;
  passage?: string;
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation?: string;
};

export type OLevelQuiz = {
  id: string;
  subject: OLevelLectureCategory;
  title: string;
  description: string;
  is_published: boolean;
  time_limit_minutes: number;
  created_by: string;
  questions: OLevelQuizQuestion[];
  created_at: string;
  updated_at: string;
};

export type OLevelQuizAttempt = {
  id: string;
  quiz_id: string;
  student_email: string;
  student_name: string;
  score: number;
  total: number;
  weak_topics: string[];
  completed_at: string;
};

let tablesReady = false;
async function ensureTables() {
  if (tablesReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS olevel_quizzes (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      is_published BOOLEAN DEFAULT false,
      time_limit_minutes INTEGER DEFAULT 0,
      created_by TEXT NOT NULL,
      questions JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS olevel_quiz_attempts (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL,
      student_email TEXT NOT NULL,
      student_name TEXT DEFAULT '',
      answers JSONB NOT NULL DEFAULT '{}',
      score INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL DEFAULT 0,
      weak_topics TEXT[] NOT NULL DEFAULT '{}',
      completed_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  tablesReady = true;
}

export async function getAllQuizzes(): Promise<(Omit<OLevelQuiz, "questions"> & { question_count: number })[]> {
  await ensureTables();
  const rows = await sql`
    SELECT id, subject, title, description, is_published, time_limit_minutes, created_by, created_at, updated_at,
           jsonb_array_length(questions) AS question_count
    FROM olevel_quizzes ORDER BY created_at DESC
  `;
  return rows as (Omit<OLevelQuiz, "questions"> & { question_count: number })[];
}

export async function getPublishedQuizzesBySubject(subject: OLevelLectureCategory): Promise<(Omit<OLevelQuiz, "questions"> & { question_count: number })[]> {
  await ensureTables();
  const rows = await sql`
    SELECT id, subject, title, description, is_published, time_limit_minutes, created_by, created_at, updated_at,
           jsonb_array_length(questions) AS question_count
    FROM olevel_quizzes WHERE is_published = true AND subject = ${subject} ORDER BY created_at DESC
  `;
  return rows as (Omit<OLevelQuiz, "questions"> & { question_count: number })[];
}

export async function getQuizById(id: string): Promise<OLevelQuiz | null> {
  await ensureTables();
  const rows = await sql`SELECT * FROM olevel_quizzes WHERE id = ${id} LIMIT 1`;
  if (!rows[0]) return null;
  return { ...rows[0], questions: rows[0].questions ?? [] } as OLevelQuiz;
}

export async function createQuiz(subject: OLevelLectureCategory, title: string, description: string, createdBy: string): Promise<string> {
  await ensureTables();
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO olevel_quizzes (id, subject, title, description, created_by)
    VALUES (${id}, ${subject}, ${title}, ${description}, ${createdBy})
  `;
  return id;
}

export async function updateQuizMeta(id: string, title: string, description: string, timeLimitMinutes: number) {
  await ensureTables();
  await sql`UPDATE olevel_quizzes SET title=${title}, description=${description}, time_limit_minutes=${timeLimitMinutes}, updated_at=NOW() WHERE id=${id}`;
}

export async function setQuizQuestions(id: string, questions: OLevelQuizQuestion[]) {
  await ensureTables();
  await sql`UPDATE olevel_quizzes SET questions=${JSON.stringify(questions)}, updated_at=NOW() WHERE id=${id}`;
}

export async function publishQuiz(id: string) {
  await ensureTables();
  await sql`UPDATE olevel_quizzes SET is_published=true, updated_at=NOW() WHERE id=${id}`;
}

export async function unpublishQuiz(id: string) {
  await ensureTables();
  await sql`UPDATE olevel_quizzes SET is_published=false, updated_at=NOW() WHERE id=${id}`;
}

export async function deleteQuiz(id: string) {
  await ensureTables();
  await sql`DELETE FROM olevel_quiz_attempts WHERE quiz_id = ${id}`;
  await sql`DELETE FROM olevel_quizzes WHERE id = ${id}`;
}

export async function submitAttempt(
  quizId: string,
  studentEmail: string,
  studentName: string,
  answers: Record<string, number>,
  questions: OLevelQuizQuestion[]
): Promise<{ score: number; total: number; weakTopics: string[]; results: { id: string; correct: boolean; correctAnswer: number; userAnswer: number | null }[] }> {
  await ensureTables();

  const results = questions.map((q) => ({
    id: q.id,
    correct: answers[q.id] === q.correct,
    correctAnswer: q.correct,
    userAnswer: answers[q.id] ?? null,
  }));
  const score = results.filter((r) => r.correct).length;
  const total = questions.length;

  const weakTopics = [
    ...new Set(
      questions.filter((q) => answers[q.id] !== q.correct).map((q) => q.topic).filter(Boolean)
    ),
  ];

  const id = crypto.randomUUID();
  await sql`
    INSERT INTO olevel_quiz_attempts (id, quiz_id, student_email, student_name, answers, score, total, weak_topics)
    VALUES (${id}, ${quizId}, ${studentEmail}, ${studentName}, ${JSON.stringify(answers)}, ${score}, ${total}, ${weakTopics})
  `;

  return { score, total, weakTopics, results };
}

export async function getQuizResults(quizId: string): Promise<OLevelQuizAttempt[]> {
  await ensureTables();
  const rows = await sql`
    SELECT * FROM olevel_quiz_attempts WHERE quiz_id = ${quizId} ORDER BY completed_at DESC
  `;
  return rows as OLevelQuizAttempt[];
}

export async function getBestAttempt(quizId: string, studentEmail: string): Promise<{ score: number; total: number } | null> {
  await ensureTables();
  const rows = await sql`
    SELECT score, total FROM olevel_quiz_attempts
    WHERE quiz_id = ${quizId} AND student_email = ${studentEmail}
    ORDER BY (score::float / NULLIF(total, 0)) DESC NULLS LAST LIMIT 1
  `;
  return (rows[0] as { score: number; total: number } | undefined) ?? null;
}

// ─── Parent-report / analytics support ─────────────────────────────────────

export interface OLevelSubjectPerformance {
  subject: string;
  attempts: number;
  avgPercent: number | null;
  bestPercent: number | null;
  weakTopics: string[];
}

/** Per-subject quiz performance for a student, across all their attempts. */
export async function getSubjectPerformanceForStudent(studentEmail: string): Promise<OLevelSubjectPerformance[]> {
  await ensureTables();
  const email = studentEmail.toLowerCase().trim();

  const rows = await sql`
    SELECT q.subject,
           COUNT(a.id)::int AS attempts,
           AVG(CASE WHEN a.total > 0 THEN a.score::float / a.total * 100 END) AS avg_percent,
           MAX(CASE WHEN a.total > 0 THEN a.score::float / a.total * 100 END) AS best_percent
    FROM olevel_quiz_attempts a
    JOIN olevel_quizzes q ON q.id = a.quiz_id
    WHERE a.student_email = ${email}
    GROUP BY q.subject
  `;

  const topicRows = await sql`
    SELECT q.subject, a.weak_topics
    FROM olevel_quiz_attempts a
    JOIN olevel_quizzes q ON q.id = a.quiz_id
    WHERE a.student_email = ${email}
  `;
  const topicCountsBySubject: Record<string, Record<string, number>> = {};
  for (const r of topicRows as { subject: string; weak_topics: string[] }[]) {
    const counts = (topicCountsBySubject[r.subject] ??= {});
    for (const t of r.weak_topics ?? []) counts[t] = (counts[t] ?? 0) + 1;
  }

  return (rows as { subject: string; attempts: number; avg_percent: number | null; best_percent: number | null }[]).map((r) => ({
    subject: r.subject,
    attempts: r.attempts,
    avgPercent: r.avg_percent !== null ? Math.round(Number(r.avg_percent)) : null,
    bestPercent: r.best_percent !== null ? Math.round(Number(r.best_percent)) : null,
    weakTopics: Object.entries(topicCountsBySubject[r.subject] ?? {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic),
  }));
}

/** Recent quiz attempts for a student, most recent first — used for the parent-portal trend chart. */
export async function getRecentAttemptsForStudent(studentEmail: string, limit = 8) {
  await ensureTables();
  const rows = await sql`
    SELECT a.id, a.score, a.total, a.completed_at, q.subject, q.title
    FROM olevel_quiz_attempts a
    JOIN olevel_quizzes q ON q.id = a.quiz_id
    WHERE a.student_email = ${studentEmail.toLowerCase().trim()}
    ORDER BY a.completed_at DESC
    LIMIT ${limit}
  `;
  return rows;
}
