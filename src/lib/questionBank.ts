import { sql } from "@/lib/db";


export type BankProgram = "sat" | "o-level";
export type BankSection = "math" | "reading_writing" | "mathematics" | "computer-science" | "english-language" | "islamiyat" | "pakistan-studies" | "physics";

export type BankQuestion = {
  id: string;
  program: BankProgram;
  section: BankSection;
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
  await sql`ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS program TEXT NOT NULL DEFAULT 'sat'`;
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
    INSERT INTO question_bank (id, program, section, topic, passage, text, options, correct, explanation, created_by)
    VALUES (${id}, ${q.program}, ${q.section}, ${q.topic}, ${q.passage ?? ""}, ${q.text}, ${JSON.stringify(q.options)}, ${q.correct}, ${q.explanation ?? ""}, ${q.created_by})
  `;
  return id;
}

export async function updateBankQuestion(id: string, q: Omit<BankQuestion, "id" | "created_by" | "created_at">) {
  await ensureTable();
  await sql`
    UPDATE question_bank
    SET program=${q.program}, section=${q.section}, topic=${q.topic}, passage=${q.passage ?? ""}, text=${q.text},
        options=${JSON.stringify(q.options)}, correct=${q.correct}, explanation=${q.explanation ?? ""}
    WHERE id=${id}
  `;
}

export async function deleteBankQuestion(id: string) {
  await ensureTable();
  await sql`DELETE FROM question_bank WHERE id = ${id}`;
}
