import { sql } from "@/lib/db";

let tablesReady = false;
export async function ensureSatQuizTables() {
  if (tablesReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS quiz_sets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      subject TEXT DEFAULT 'general',
      category TEXT DEFAULT 'math',
      time_limit_minutes INTEGER,
      is_published BOOLEAN DEFAULT FALSE,
      created_by UUID,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS quiz_set_questions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      quiz_id UUID REFERENCES quiz_sets(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      options JSONB NOT NULL,
      correct_answer TEXT NOT NULL,
      explanation TEXT DEFAULT '',
      order_index INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS quiz_set_attempts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      quiz_id UUID REFERENCES quiz_sets(id),
      student_id UUID,
      student_name TEXT DEFAULT '',
      score INTEGER,
      total INTEGER,
      answers JSONB DEFAULT '{}',
      completed_at TIMESTAMPTZ,
      started_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  tablesReady = true;
}
