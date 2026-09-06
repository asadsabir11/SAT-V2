import { sql } from "@/lib/db";

// Mirrors olevel-quiz.ts exactly, but with subject typed as a plain string
// (matching this program's own subject list — English, Urdu, Maths,
// Physics, Chemistry, Biology/Computer Science, Islamiat, Tarjuma-tul-Quran
// or Ethics — instead of importing OLevelLectureCategory, which is a
// strict enum tied to O-Level content) and its own tables, so nothing
// about the O-Level quiz system is touched.

export type Punjab9thQuizQuestion = {
  id: string;
  topic: string;
  passage?: string;
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation?: string;
};

export type Punjab9thQuiz = {
  id: string;
  subject: string;
  title: string;
  description: string;
  is_published: boolean;
  time_limit_minutes: number;
  created_by: string;
  questions: Punjab9thQuizQuestion[];
  created_at: string;
  updated_at: string;
};

export type Punjab9thQuizAttempt = {
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
    CREATE TABLE IF NOT EXISTS punjab9th_quizzes (
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
    CREATE TABLE IF NOT EXISTS punjab9th_quiz_attempts (
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

export async function getAllPunjab9thQuizzes(): Promise<(Omit<Punjab9thQuiz, "questions"> & { question_count: number })[]> {
  await ensureTables();
  const rows = await sql`
    SELECT id, subject, title, description, is_published, time_limit_minutes, created_by, created_at, updated_at,
           jsonb_array_length(questions) AS question_count
    FROM punjab9th_quizzes ORDER BY created_at DESC
  `;
  return rows as (Omit<Punjab9thQuiz, "questions"> & { question_count: number })[];
}

export async function getPublishedPunjab9thQuizzesBySubject(subject: string): Promise<(Omit<Punjab9thQuiz, "questions"> & { question_count: number })[]> {
  await ensureTables();
  const rows = await sql`
    SELECT id, subject, title, description, is_published, time_limit_minutes, created_by, created_at, updated_at,
           jsonb_array_length(questions) AS question_count
    FROM punjab9th_quizzes WHERE is_published = true AND subject = ${subject} ORDER BY created_at DESC
  `;
  return rows as (Omit<Punjab9thQuiz, "questions"> & { question_count: number })[];
}

export async function getPunjab9thQuizById(id: string): Promise<Punjab9thQuiz | null> {
  await ensureTables();
  const rows = await sql`SELECT * FROM punjab9th_quizzes WHERE id = ${id} LIMIT 1`;
  if (!rows[0]) return null;
  return { ...rows[0], questions: rows[0].questions ?? [] } as Punjab9thQuiz;
}

export async function createPunjab9thQuiz(subject: string, title: string, description: string, createdBy: string): Promise<string> {
  await ensureTables();
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO punjab9th_quizzes (id, subject, title, description, created_by)
    VALUES (${id}, ${subject}, ${title}, ${description}, ${createdBy})
  `;
  return id;
}

export async function updatePunjab9thQuizMeta(id: string, title: string, description: string, timeLimitMinutes: number) {
  await ensureTables();
  await sql`UPDATE punjab9th_quizzes SET title=${title}, description=${description}, time_limit_minutes=${timeLimitMinutes}, updated_at=NOW() WHERE id=${id}`;
}

export async function setPunjab9thQuizQuestions(id: string, questions: Punjab9thQuizQuestion[]) {
  await ensureTables();
  await sql`UPDATE punjab9th_quizzes SET questions=${JSON.stringify(questions)}, updated_at=NOW() WHERE id=${id}`;
}

export async function publishPunjab9thQuiz(id: string) {
  await ensureTables();
  await sql`UPDATE punjab9th_quizzes SET is_published=true, updated_at=NOW() WHERE id=${id}`;
}

export async function unpublishPunjab9thQuiz(id: string) {
  await ensureTables();
  await sql`UPDATE punjab9th_quizzes SET is_published=false, updated_at=NOW() WHERE id=${id}`;
}

export async function deletePunjab9thQuiz(id: string) {
  await ensureTables();
  await sql`DELETE FROM punjab9th_quiz_attempts WHERE quiz_id = ${id}`;
  await sql`DELETE FROM punjab9th_quizzes WHERE id = ${id}`;
}

export async function submitPunjab9thAttempt(
  quizId: string,
  studentEmail: string,
  studentName: string,
  answers: Record<string, number>,
  questions: Punjab9thQuizQuestion[]
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
    INSERT INTO punjab9th_quiz_attempts (id, quiz_id, student_email, student_name, answers, score, total, weak_topics)
    VALUES (${id}, ${quizId}, ${studentEmail}, ${studentName}, ${JSON.stringify(answers)}, ${score}, ${total}, ${weakTopics})
  `;

  return { score, total, weakTopics, results };
}

export async function getPunjab9thQuizResults(quizId: string): Promise<Punjab9thQuizAttempt[]> {
  await ensureTables();
  const rows = await sql`
    SELECT * FROM punjab9th_quiz_attempts WHERE quiz_id = ${quizId} ORDER BY completed_at DESC
  `;
  return rows as Punjab9thQuizAttempt[];
}

export async function getPunjab9thBestAttempt(quizId: string, studentEmail: string): Promise<{ score: number; total: number } | null> {
  await ensureTables();
  const rows = await sql`
    SELECT score, total FROM punjab9th_quiz_attempts
    WHERE quiz_id = ${quizId} AND student_email = ${studentEmail}
    ORDER BY (score::float / NULLIF(total, 0)) DESC NULLS LAST LIMIT 1
  `;
  return (rows[0] as { score: number; total: number } | undefined) ?? null;
}
