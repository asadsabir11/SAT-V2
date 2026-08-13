import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { addBankQuestion, type BankProgram, type BankSection } from "@/lib/questionBank";

interface ImportRow {
  program?: string;
  section: string;
  topic: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
  passage?: string;
}

const SAT_SECTION_MAP: Record<string, BankSection> = {
  math: "math", "reading_writing": "reading_writing",
  "reading & writing": "reading_writing", "reading and writing": "reading_writing",
  "r&w": "reading_writing", rw: "reading_writing",
};
const OLEVEL_SECTION_MAP: Record<string, BankSection> = {
  mathematics: "mathematics", maths: "mathematics",
  "computer science": "computer-science", "computer-science": "computer-science", cs: "computer-science",
  "english language": "english-language", "english-language": "english-language", english: "english-language",
  islamiyat: "islamiyat",
  "pakistan studies": "pakistan-studies", "pakistan-studies": "pakistan-studies",
};
const CORRECT_MAP: Record<string, 0 | 1 | 2 | 3> = { a: 0, b: 1, c: 2, d: 3 };

function resolveProgram(raw: string | undefined): BankProgram {
  const p = (raw ?? "").trim().toLowerCase();
  return p === "o-level" || p === "olevel" || p === "o level" ? "o-level" : "sat";
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = (await req.json()) as { rows: ImportRow[] };
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }

  let created = 0;
  const errors: { row: number; reason: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const rowNum = i + 2; // +2: 1-indexed + header row

    const program = resolveProgram(r.program);
    const sectionMap = program === "o-level" ? OLEVEL_SECTION_MAP : SAT_SECTION_MAP;
    const sectionKey = (r.section ?? "").trim().toLowerCase();
    const section = sectionMap[sectionKey];
    if (!section) {
      errors.push({
        row: rowNum,
        reason: program === "o-level"
          ? `Invalid subject "${r.section}" for O Level`
          : `Invalid section "${r.section}" — use "math" or "reading_writing"`,
      });
      continue;
    }

    const topic = (r.topic ?? "").trim();
    if (!topic) { errors.push({ row: rowNum, reason: "Topic is required" }); continue; }

    const text = (r.question ?? "").trim();
    if (!text) { errors.push({ row: rowNum, reason: "Question text is required" }); continue; }

    const options: [string, string, string, string] = [
      (r.option_a ?? "").trim(),
      (r.option_b ?? "").trim(),
      (r.option_c ?? "").trim(),
      (r.option_d ?? "").trim(),
    ];
    if (options.some(o => !o)) {
      errors.push({ row: rowNum, reason: "All four options (A, B, C, D) are required" });
      continue;
    }

    const correctKey = (r.correct_answer ?? "").trim().toLowerCase();
    const correct = CORRECT_MAP[correctKey];
    if (correct === undefined) {
      errors.push({ row: rowNum, reason: `Invalid correct_answer "${r.correct_answer}" — use A, B, C, or D` });
      continue;
    }

    await addBankQuestion({
      program,
      section,
      topic,
      passage: (r.passage ?? "").trim(),
      text,
      options,
      correct,
      explanation: (r.explanation ?? "").trim(),
      created_by: session.email,
    });
    created++;
  }

  return NextResponse.json({ created, errors, total: rows.length });
}
