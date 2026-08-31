/**
 * HTML landing pages for the free workbooks (SEO Phase 2 §22 / audit §7).
 *
 * The workbooks themselves live in the database and are uploaded by the
 * founder, so their titles and IDs can change. These pages are therefore keyed
 * by a STABLE slug and matched to whichever live workbook contains
 * `matchTitle`, rather than hard-coded to a UUID — re-uploading a workbook
 * changes its id, and §34 forbids letting working URLs break.
 *
 * If no matching workbook is live the page still renders its content and shows
 * a "coming soon" state instead of a dead download link.
 *
 * NOT included, because we cannot verify them without the actual PDFs: sample
 * questions and a preview image. §22 asks for both — see the notes in the page
 * component. Add them once the founder confirms what is inside each workbook.
 */

export interface WorkbookPage {
  slug: string;
  /** Case-insensitive substring matched against the live workbook title. */
  matchTitle: string;
  h1: string;
  seoTitle: string;
  description: string;
  subjectName: string;
  /** Links back to the commercial subject page — lesson ↔ course (§24). */
  subjectHref: string;
  intro: string;
  /** Topic areas, mirrored from indicativeTopics in academy/data.ts. */
  topics: string[];
  forWho: string[];
  howToUse: string[];
}

export const WORKBOOK_PAGES: WorkbookPage[] = [
  {
    slug: "o-level-maths-workbook",
    matchTitle: "mathematics",
    h1: "Free O Level Mathematics Workbook",
    seoTitle: "Free O Level Maths Workbook (PDF) | Cambridge 4024",
    description:
      "Download a free Cambridge O Level Mathematics practice workbook from The Digital Tutor. Printable, no account required, covering core 4024 topic areas.",
    subjectName: "Mathematics",
    subjectHref: "/o-level/mathematics",
    intro:
      "A free printable workbook for students preparing for Cambridge O Level Mathematics (syllabus 4024). It is designed to be worked through with a pen and paper rather than read, because that is how the exam is sat. There is no account required and nothing to pay.",
    topics: ["Number", "Algebra", "Geometry", "Trigonometry", "Mensuration", "Probability & Statistics"],
    forWho: [
      "Students preparing for Cambridge O Level or IGCSE Mathematics",
      "Students who want structured written practice rather than more notes to read",
      "Parents looking for something concrete their child can start on today",
    ],
    howToUse: [
      "Print it, or work on paper alongside it. Do not type the answers — the exam is handwritten.",
      "Work in short sessions rather than one long one. Two focused half-hours beat a single distracted three hours.",
      "Attempt every question before checking anything. A wrong attempt teaches more than a read-through.",
      "Mark the questions you got wrong and come back to those specific ones a few days later.",
    ],
  },
  {
    slug: "o-level-english-workbook",
    matchTitle: "english",
    h1: "Free O Level English Language Workbook",
    seoTitle: "Free O Level English Workbook (PDF) | Cambridge 1123",
    description:
      "Download a free Cambridge O Level English Language practice workbook from The Digital Tutor. Printable writing and comprehension practice, no account required.",
    subjectName: "English Language",
    subjectHref: "/o-level/english-language",
    intro:
      "A free printable workbook for students preparing for Cambridge O Level English Language (syllabus 1123). English is improved by writing, not by reading about writing, so this is built around producing work rather than reviewing rules. No account required and nothing to pay.",
    topics: ["Directed writing", "Composition", "Comprehension", "Summary skills", "Reading for meaning"],
    forWho: [
      "Students preparing for Cambridge O Level or IGCSE English Language",
      "Students who need structured writing practice with something to aim at",
      "Students whose comprehension marks are stronger than their writing marks, or the reverse",
    ],
    howToUse: [
      "Write your answers out in full, by hand, in the time you would have in the exam.",
      "Leave a piece of writing for a day before rereading it. You will catch far more.",
      "Read your own writing aloud — it is the quickest way to hear a sentence that does not work.",
      "Keep everything you write. Progress in English is very hard to see week to week and obvious across two months.",
    ],
  },
];

export function getWorkbookPage(slug: string): WorkbookPage | undefined {
  return WORKBOOK_PAGES.find((w) => w.slug === slug);
}

/** Maps a live workbook (whose title the founder controls) to its landing page. */
export function getWorkbookPageForTitle(title: string): WorkbookPage | undefined {
  const t = title.toLowerCase();
  return WORKBOOK_PAGES.find((w) => t.includes(w.matchTitle));
}
