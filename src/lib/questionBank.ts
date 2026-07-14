import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.POSTGRES_URL!);

export type BankQuestion = {
  id: string;
  section: "math" | "reading_writing";
  topic: string;
  passage?: string;
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation?: string;
  created_by: string;
  created_at: string;
};

let ready = false;
async function ensureTable() {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS question_bank (
      id TEXT PRIMARY KEY,
      section TEXT NOT NULL,
      topic TEXT NOT NULL,
      passage TEXT DEFAULT '',
      text TEXT NOT NULL,
      options JSONB NOT NULL,
      correct INTEGER NOT NULL,
      explanation TEXT DEFAULT '',
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  ready = true;
}

export async function getBankQuestions(): Promise<BankQuestion[]> {
  await ensureTable();
  const rows = await sql`SELECT * FROM question_bank ORDER BY created_at DESC`;
  return rows as BankQuestion[];
}

export async function addBankQuestion(q: Omit<BankQuestion, "id" | "created_at">): Promise<string> {
  await ensureTable();
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO question_bank (id, section, topic, passage, text, options, correct, explanation, created_by)
    VALUES (${id}, ${q.section}, ${q.topic}, ${q.passage ?? ""}, ${q.text}, ${JSON.stringify(q.options)}, ${q.correct}, ${q.explanation ?? ""}, ${q.created_by})
  `;
  return id;
}

export async function deleteBankQuestion(id: string) {
  await ensureTable();
  await sql`DELETE FROM question_bank WHERE id = ${id}`;
}
