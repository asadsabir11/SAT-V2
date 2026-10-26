import { sql } from "@/lib/db";

// Mirrors punjab9thQuiz.ts/olevel-quiz.ts, but with no `subject` field at
// all — A-Level has exactly one subject (Computer Science), so a subject
// column would be redundant everywhere. Own tables, isolated from both.

export type ALevelQuizQuestion = {
  id: string;
  topic: string;
  passage?: string;
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation?: string;
};

export type ALevelQuiz = {
  id: string;
  title: string;
  description: string;
  is_published: boolean;
  time_limit_minutes: number;
  created_by: string;
  questions: ALevelQuizQuestion[];
  created_at: string;
  updated_at: string;
};

export type ALevelQuizAttempt = {
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
    CREATE TABLE IF NOT EXISTS a_level_quizzes (
      id TEXT PRIMARY KEY,
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
    CREATE TABLE IF NOT EXISTS a_level_quiz_attempts (
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

export async function getAllALevelQuizzes(): Promise<(Omit<ALevelQuiz, "questions"> & { question_count: number })[]> {
  await ensureTables();
  const rows = await sql`
    SELECT id, title, description, is_published, time_limit_minutes, created_by, created_at, updated_at,
           jsonb_array_length(questions) AS question_count
    FROM a_level_quizzes ORDER BY created_at DESC
  `;
  return rows as (Omit<ALevelQuiz, "questions"> & { question_count: number })[];
}

export async function getPublishedALevelQuizzes(): Promise<(Omit<ALevelQuiz, "questions"> & { question_count: number })[]> {
  await ensureTables();
  const rows = await sql`
    SELECT id, title, description, is_published, time_limit_minutes, created_by, created_at, updated_at,
           jsonb_array_length(questions) AS question_count
    FROM a_level_quizzes WHERE is_published = true ORDER BY created_at DESC
  `;
  return rows as (Omit<ALevelQuiz, "questions"> & { question_count: number })[];
}

export async function getALevelQuizById(id: string): Promise<ALevelQuiz | null> {
  await ensureTables();
  const rows = await sql`SELECT * FROM a_level_quizzes WHERE id = ${id} LIMIT 1`;
  if (!rows[0]) return null;
  return { ...rows[0], questions: rows[0].questions ?? [] } as ALevelQuiz;
}

export async function createALevelQuiz(title: string, description: string, createdBy: string): Promise<string> {
  await ensureTables();
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO a_level_quizzes (id, title, description, created_by)
    VALUES (${id}, ${title}, ${description}, ${createdBy})
  `;
  return id;
}

export async function updateALevelQuizMeta(id: string, title: string, description: string, timeLimitMinutes: number) {
  await ensureTables();
  await sql`UPDATE a_level_quizzes SET title=${title}, description=${description}, time_limit_minutes=${timeLimitMinutes}, updated_at=NOW() WHERE id=${id}`;
}

export async function setALevelQuizQuestions(id: string, questions: ALevelQuizQuestion[]) {
  await ensureTables();
  await sql`UPDATE a_level_quizzes SET questions=${JSON.stringify(questions)}, updated_at=NOW() WHERE id=${id}`;
}

export async function publishALevelQuiz(id: string) {
  await ensureTables();
  await sql`UPDATE a_level_quizzes SET is_published=true, updated_at=NOW() WHERE id=${id}`;
}

export async function unpublishALevelQuiz(id: string) {
  await ensureTables();
  await sql`UPDATE a_level_quizzes SET is_published=false, updated_at=NOW() WHERE id=${id}`;
}

export async function deleteALevelQuiz(id: string) {
  await ensureTables();
  await sql`DELETE FROM a_level_quiz_attempts WHERE quiz_id = ${id}`;
  await sql`DELETE FROM a_level_quizzes WHERE id = ${id}`;
}

export async function submitALevelAttempt(
  quizId: string,
  studentEmail: string,
  studentName: string,
  answers: Record<string, number>,
  questions: ALevelQuizQuestion[]
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
    INSERT INTO a_level_quiz_attempts (id, quiz_id, student_email, student_name, answers, score, total, weak_topics)
    VALUES (${id}, ${quizId}, ${studentEmail}, ${studentName}, ${JSON.stringify(answers)}, ${score}, ${total}, ${weakTopics})
  `;

  return { score, total, weakTopics, results };
}

export async function getALevelQuizResults(quizId: string): Promise<ALevelQuizAttempt[]> {
  await ensureTables();
  const rows = await sql`
    SELECT * FROM a_level_quiz_attempts WHERE quiz_id = ${quizId} ORDER BY completed_at DESC
  `;
  return rows as ALevelQuizAttempt[];
}

// Compares score/total (percentage), not raw score counts — a quiz's
// question count can change between attempts, so raw counts aren't
// comparable (same bug class fixed in olevel-quiz.ts's best-attempt logic).
export async function getALevelBestAttempt(quizId: string, studentEmail: string): Promise<{ score: number; total: number } | null> {
  await ensureTables();
  const rows = await sql`
    SELECT score, total FROM a_level_quiz_attempts
    WHERE quiz_id = ${quizId} AND student_email = ${studentEmail}
    ORDER BY (score::float / NULLIF(total, 0)) DESC NULLS LAST LIMIT 1
  `;
  return (rows[0] as { score: number; total: number } | undefined) ?? null;
}
