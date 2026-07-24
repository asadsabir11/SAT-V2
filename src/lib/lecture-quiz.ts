import { neon } from "@neondatabase/serverless";
import { fetch as undiciFetch } from "undici";

const sql = neon(process.env.POSTGRES_URL!);

export interface LectureQuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
}

let ready = false;
async function ensureTables() {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS lecture_progress (
      lecture_id    TEXT NOT NULL,
      student_email TEXT NOT NULL,
      completed     BOOLEAN DEFAULT false,
      completed_at  TIMESTAMPTZ,
      PRIMARY KEY (lecture_id, student_email)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS lecture_ai_quizzes (
      lecture_id   TEXT PRIMARY KEY,
      questions    JSONB NOT NULL,
      generated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS lecture_quiz_results (
      id            TEXT PRIMARY KEY,
      lecture_id    TEXT NOT NULL,
      student_email TEXT NOT NULL,
      score         INTEGER NOT NULL,
      total         INTEGER NOT NULL,
      submitted_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  ready = true;
}

export async function markLectureCompleted(lectureId: string, studentEmail: string) {
  await ensureTables();
  await sql`
    INSERT INTO lecture_progress (lecture_id, student_email, completed, completed_at)
    VALUES (${lectureId}, ${studentEmail}, true, NOW())
    ON CONFLICT (lecture_id, student_email)
    DO UPDATE SET completed = true, completed_at = COALESCE(lecture_progress.completed_at, NOW())
  `;
}

export async function hasCompletedLecture(lectureId: string, studentEmail: string): Promise<boolean> {
  await ensureTables();
  const rows = await sql`
    SELECT completed FROM lecture_progress
    WHERE lecture_id = ${lectureId} AND student_email = ${studentEmail}
  `;
  return (rows[0]?.completed as boolean) ?? false;
}

export async function getLectureQuiz(lectureId: string): Promise<LectureQuizQuestion[] | null> {
  await ensureTables();
  const rows = await sql`SELECT questions FROM lecture_ai_quizzes WHERE lecture_id = ${lectureId}`;
  return rows[0] ? (rows[0].questions as LectureQuizQuestion[]) : null;
}

export async function saveLectureQuiz(lectureId: string, questions: LectureQuizQuestion[]) {
  await ensureTables();
  await sql`
    INSERT INTO lecture_ai_quizzes (lecture_id, questions)
    VALUES (${lectureId}, ${JSON.stringify(questions)})
    ON CONFLICT (lecture_id)
    DO UPDATE SET questions = ${JSON.stringify(questions)}, generated_at = NOW()
  `;
}

export async function saveQuizResult(lectureId: string, studentEmail: string, score: number, total: number) {
  await ensureTables();
  await sql`
    INSERT INTO lecture_quiz_results (id, lecture_id, student_email, score, total)
    VALUES (${crypto.randomUUID()}, ${lectureId}, ${studentEmail}, ${score}, ${total})
  `;
}

export async function deleteLectureQuiz(lectureId: string) {
  await ensureTables();
  await sql`DELETE FROM lecture_ai_quizzes WHERE lecture_id = ${lectureId}`;
}

export async function getBestScore(lectureId: string, studentEmail: string): Promise<{ score: number; total: number } | null> {
  await ensureTables();
  const rows = await sql`
    SELECT score, total FROM lecture_quiz_results
    WHERE lecture_id = ${lectureId} AND student_email = ${studentEmail}
    ORDER BY score DESC LIMIT 1
  `;
  return rows[0] ? { score: rows[0].score as number, total: rows[0].total as number } : null;
}

export async function generateQuizWithAI(title: string, description: string): Promise<LectureQuizQuestion[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const prompt = `You are generating a quiz for an SAT preparation lecture.
Lecture title: "${title}"
${description ? `Description: "${description}"` : ""}

Generate exactly 5 multiple-choice questions that test understanding of the concepts in this lecture.
Rules:
- 4 answer options per question (A, B, C, D)
- One clearly correct answer per question
- Mix of easy and moderate difficulty
- Relevant to SAT preparation

Return ONLY a valid JSON array, no other text:
[
  {
    "id": "q1",
    "question": "Question text?",
    "options": ["A. Option one", "B. Option two", "C. Option three", "D. Option four"],
    "answer": "A"
  }
]`;

  const body = JSON.stringify({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const res = await undiciFetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body,
  });

  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content ?? "[]";

  // Strip markdown code fences if present
  const clean = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const questions = JSON.parse(clean) as LectureQuizQuestion[];

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Invalid quiz format from AI");
  }

  return questions.slice(0, 5);
}
