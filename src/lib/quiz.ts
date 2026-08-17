import { sql } from "@/lib/db";


export type QuizQuestion = {
  id: string;
  section: "math" | "reading_writing";
  topic: string;
  passage?: string;
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation?: string;
};

export type Quiz = {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  time_limit_minutes: number;
  created_by: string;
  questions: QuizQuestion[];
  created_at: string;
  updated_at: string;
};

export type QuizAttempt = {
  id: string;
  quiz_id: string;
  student_email: string;
  student_name: string;
  math_score: number;
  rw_score: number;
  total_score: number;
  weak_areas: string[];
  completed_at: string;
};

let tablesReady = false;
export async function ensureTables() {
  if (tablesReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      is_active BOOLEAN DEFAULT false,
      time_limit_minutes INTEGER DEFAULT 0,
      created_by TEXT NOT NULL,
      questions JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  // Migrate existing tables to add new column if missing
  await sql`ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS time_limit_minutes INTEGER DEFAULT 0`;
  await sql`
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL,
      student_email TEXT NOT NULL,
      student_name TEXT DEFAULT '',
      answers JSONB NOT NULL DEFAULT '{}',
      math_score INTEGER NOT NULL DEFAULT 0,
      rw_score INTEGER NOT NULL DEFAULT 0,
      total_score INTEGER NOT NULL DEFAULT 0,
      weak_areas TEXT[] NOT NULL DEFAULT '{}',
      completed_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  tablesReady = true;
}

export async function getAllQuizzes() {
  await ensureTables();
  const rows = await sql`
    SELECT id, title, description, is_active, created_by, created_at, updated_at,
           jsonb_array_length(questions) AS question_count
    FROM quizzes ORDER BY created_at DESC
  `;
  return rows;
}

export async function getQuizById(id: string): Promise<Quiz | null> {
  await ensureTables();
  const rows = await sql`SELECT * FROM quizzes WHERE id = ${id} LIMIT 1`;
  if (!rows[0]) return null;
  return { ...rows[0], questions: rows[0].questions ?? [] } as Quiz;
}

export async function getActiveQuiz(): Promise<Quiz | null> {
  await ensureTables();
  const rows = await sql`SELECT * FROM quizzes WHERE is_active = true ORDER BY updated_at DESC LIMIT 1`;
  if (!rows[0]) return null;
  return { ...rows[0], questions: rows[0].questions ?? [] } as Quiz;
}

export async function createQuiz(title: string, description: string, createdBy: string): Promise<string> {
  await ensureTables();
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO quizzes (id, title, description, created_by)
    VALUES (${id}, ${title}, ${description}, ${createdBy})
  `;
  return id;
}

export async function updateQuizMeta(id: string, title: string, description: string, timeLimitMinutes: number) {
  await ensureTables();
  await sql`UPDATE quizzes SET title=${title}, description=${description}, time_limit_minutes=${timeLimitMinutes}, updated_at=NOW() WHERE id=${id}`;
}

export async function setQuizQuestions(id: string, questions: QuizQuestion[]) {
  await ensureTables();
  await sql`UPDATE quizzes SET questions=${JSON.stringify(questions)}, updated_at=NOW() WHERE id=${id}`;
}

export async function activateQuiz(id: string) {
  await ensureTables();
  await sql`UPDATE quizzes SET is_active = false`;
  await sql`UPDATE quizzes SET is_active = true, updated_at=NOW() WHERE id=${id}`;
}

export async function deactivateQuiz(id: string) {
  await ensureTables();
  await sql`UPDATE quizzes SET is_active = false, updated_at=NOW() WHERE id=${id}`;
}

export async function deleteQuiz(id: string) {
  await ensureTables();
  await sql`DELETE FROM quiz_attempts WHERE quiz_id = ${id}`;
  await sql`DELETE FROM quizzes WHERE id = ${id}`;
}

export async function submitAttempt(
  quizId: string,
  studentEmail: string,
  studentName: string,
  answers: Record<string, number>,
  questions: QuizQuestion[]
): Promise<{ mathScore: number; rwScore: number; totalScore: number; weakAreas: string[] }> {
  await ensureTables();

  const mathQs = questions.filter((q) => q.section === "math");
  const rwQs = questions.filter((q) => q.section === "reading_writing");

  const mathCorrect = mathQs.filter((q) => answers[q.id] === q.correct).length;
  const rwCorrect = rwQs.filter((q) => answers[q.id] === q.correct).length;

  const scale = (correct: number, total: number) =>
    total > 0 ? Math.round(((correct / total) * 600 + 200) / 10) * 10 : 400;

  const mathScore = scale(mathCorrect, mathQs.length);
  const rwScore = scale(rwCorrect, rwQs.length);
  const totalScore = mathScore + rwScore;

  const weakAreas = [
    ...new Set(
      questions
        .filter((q) => answers[q.id] !== q.correct)
        .map((q) => q.topic)
        .filter(Boolean)
    ),
  ];

  const id = crypto.randomUUID();
  await sql`
    INSERT INTO quiz_attempts (id, quiz_id, student_email, student_name, answers, math_score, rw_score, total_score, weak_areas)
    VALUES (${id}, ${quizId}, ${studentEmail}, ${studentName}, ${JSON.stringify(answers)}, ${mathScore}, ${rwScore}, ${totalScore}, ${weakAreas})
  `;

  return { mathScore, rwScore, totalScore, weakAreas };
}

export async function getQuizResults(quizId: string): Promise<QuizAttempt[]> {
  await ensureTables();
  const rows = await sql`
    SELECT * FROM quiz_attempts WHERE quiz_id = ${quizId} ORDER BY completed_at DESC
  `;
  return rows as QuizAttempt[];
}
