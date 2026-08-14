// Pure constants/types — no server-only imports (safe to import from client components).
// Kept separate from olevelApplications.ts, which pulls in the DB client.

export type SubjectOption =
  | "english-language"
  | "mathematics"
  | "english-language+mathematics"
  | "computer-science-waitlist"
  | "islamiyat-waitlist"
  | "pakistan-studies-waitlist";

export const SUBJECT_OPTIONS: { value: SubjectOption; label: string }[] = [
  { value: "english-language", label: "English Language" },
  { value: "mathematics", label: "Mathematics" },
  { value: "english-language+mathematics", label: "English Language and Mathematics" },
  { value: "computer-science-waitlist", label: "Computer Science (waiting list)" },
  { value: "islamiyat-waitlist", label: "Islamiyat (waiting list)" },
  { value: "pakistan-studies-waitlist", label: "Pakistan Studies (waiting list)" },
];

export type TargetExamSession = "may-june-2027" | "oct-nov-2027" | "not-sure";

export const TARGET_EXAM_SESSIONS: { value: TargetExamSession; label: string }[] = [
  { value: "may-june-2027", label: "May/June 2027" },
  { value: "oct-nov-2027", label: "October/November 2027" },
  { value: "not-sure", label: "Not sure" },
];

export type PaymentMethod = "jazzcash" | "easypaisa" | "bank_transfer";

const AMOUNT_DUE: Record<SubjectOption, number | null> = {
  "english-language": 10000,
  "mathematics": 10000,
  "english-language+mathematics": 18000,
  "computer-science-waitlist": null,
  "islamiyat-waitlist": null,
  "pakistan-studies-waitlist": null,
};

export function amountDueForSubject(subject: SubjectOption): number | null {
  return AMOUNT_DUE[subject] ?? null;
}
