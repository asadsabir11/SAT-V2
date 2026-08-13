import type {
  Cohort,
  Instructor,
  OfficeHoursInfo,
  PricingSchedule,
  Subject,
  Track,
} from "./types";

/**
 * The Digital Tutor Academy — configuration data.
 *
 * Edit THIS file to add subjects, change prices, open cohorts, or adjust
 * schedules. Components read from here; nothing below is hard-coded in the UI.
 */

export const INSTRUCTORS: Instructor[] = [
  {
    id: "ibrahim",
    name: "Ibrahim Sajid Malick",
    title: "Founder, The Digital Tutor — Educator & Technology Leader",
    bio: "An experienced technology professional and educator with a background in technology, cloud, AI, networking, and cybersecurity. Ibrahim teaches the founding O Level cohort personally, connecting exam content with real-world understanding while keeping every course aligned to the Cambridge examination.",
    teaches: [
      "Mathematics",
      "Computer Science",
      "English Language",
      "Islamiyat",
      "Pakistan Studies",
    ],
    highlights: [
      "Founder of The Digital Tutor",
      "Experienced instructor across sciences and humanities",
      "Connects Computer Science with real-world technology concepts",
      "Keeps courses aligned to Cambridge examination requirements",
    ],
  },
];

/**
 * Initial five O Level subjects. `indicativeTopics` are broad, editable topic
 * areas — NOT a reproduction of the official Cambridge syllabus. Update
 * `syllabusRef` / `syllabusCode` as configuration when confirmed.
 */
export const SUBJECTS: Subject[] = [
  {
    slug: "mathematics",
    name: "Mathematics",
    program: "o-level",
    syllabusRef: "Cambridge O Level Mathematics",
    short: "Concept-first maths with weekly problem-solving workshops.",
    description:
      "Build genuine understanding of O Level Mathematics through concept classes and past-paper problem-solving, with help available between lessons.",
    forWho: [
      "Students preparing for Cambridge O Level / IGCSE Mathematics",
      "Students who want structure and weekly accountability",
      "Students who get stuck on homework and need support between classes",
    ],
    indicativeTopics: [
      "Number",
      "Algebra",
      "Geometry",
      "Trigonometry",
      "Mensuration",
      "Probability & Statistics",
    ],
    learningOutcomes: [
      "Confidence with core methods and exam techniques",
      "Structured approach to problem-solving",
      "Familiarity with past-paper question styles",
    ],
    classModel: [
      { title: "Concept class", durationMins: 90, type: "concept", cadence: "Weekly" },
      { title: "Problem-solving / past-paper workshop", durationMins: 60, type: "workshop", cadence: "Weekly" },
    ],
    assessmentApproach:
      "Regular topical quizzes and monthly assessments to estimate current working level and highlight areas for improvement.",
    instructorId: "ibrahim",
  },
  {
    slug: "computer-science",
    name: "Computer Science",
    program: "o-level",
    syllabusRef: "Cambridge O Level Computer Science",
    short: "Exam content connected to real-world technology.",
    description:
      "O Level Computer Science taught by a technology professional — exam-aligned, with concepts connected to how real systems actually work.",
    forWho: [
      "Students preparing for Cambridge O Level / IGCSE Computer Science",
      "Students who want theory explained with real-world context",
      "Students aiming for computing, engineering, or tech pathways",
    ],
    indicativeTopics: [
      "Data representation",
      "Computer systems & architecture",
      "Networking basics",
      "Algorithms & programming concepts",
      "Databases",
      "Security fundamentals",
    ],
    learningOutcomes: [
      "Solid grasp of core theory and terminology",
      "Confidence with algorithmic and programming questions",
      "Real-world context that makes concepts stick",
    ],
    classModel: [
      { title: "Concept class", durationMins: 90, type: "concept", cadence: "Weekly" },
      { title: "Practical / exam workshop", durationMins: 60, type: "practical", cadence: "Weekly" },
    ],
    assessmentApproach:
      "Topical quizzes plus monthly assessments focused on exam-style questions.",
    instructorId: "ibrahim",
  },
  {
    slug: "english-language",
    name: "English Language",
    program: "o-level",
    syllabusRef: "Cambridge O Level English Language",
    short: "Reading, writing, and exam technique with weekly writing workshops.",
    description:
      "Develop clear writing and confident comprehension for O Level English Language, with weekly writing practice and feedback.",
    forWho: [
      "Students preparing for Cambridge O Level / IGCSE English Language",
      "Students who want structured writing practice and feedback",
      "Students building skills for university applications later",
    ],
    indicativeTopics: [
      "Directed writing",
      "Composition",
      "Comprehension",
      "Summary skills",
      "Reading for meaning",
    ],
    learningOutcomes: [
      "Stronger, clearer writing under exam conditions",
      "Reliable comprehension and summary technique",
      "Exam-timing and structure strategies",
    ],
    classModel: [
      { title: "Concept class", durationMins: 90, type: "concept", cadence: "Weekly" },
      { title: "Writing / exam workshop", durationMins: 60, type: "workshop", cadence: "Weekly" },
    ],
    assessmentApproach:
      "Regular writing tasks with feedback and monthly assessments.",
    instructorId: "ibrahim",
  },
  {
    slug: "islamiyat",
    name: "Islamiyat",
    program: "o-level",
    syllabusRef: "Cambridge O Level Islamiyat",
    short: "Structured lessons with revision and past-paper practice.",
    description:
      "O Level Islamiyat taught with clear structure, regular revision, and past-paper practice to build exam confidence.",
    forWho: [
      "Students preparing for Cambridge O Level Islamiyat",
      "Students who want structured revision and clear explanations",
    ],
    indicativeTopics: [
      "Core themes and sources",
      "Key events and their significance",
      "Exam answer structure and technique",
    ],
    learningOutcomes: [
      "Clear understanding of core themes",
      "Confident, well-structured exam answers",
    ],
    classModel: [
      { title: "Live lesson", durationMins: 90, type: "concept", cadence: "Weekly" },
      { title: "Revision / past-paper session", durationMins: 60, type: "revision", cadence: "As needed" },
    ],
    assessmentApproach:
      "Regular review questions and monthly assessments to track progress.",
    instructorId: "ibrahim",
  },
  {
    slug: "pakistan-studies",
    name: "Pakistan Studies",
    program: "o-level",
    syllabusRef: "Cambridge O Level Pakistan Studies",
    short: "History and geography with structured revision and practice.",
    description:
      "O Level Pakistan Studies taught with structured lessons, regular revision, and past-paper practice.",
    forWho: [
      "Students preparing for Cambridge O Level Pakistan Studies",
      "Students who want clear structure and exam technique",
    ],
    indicativeTopics: [
      "History of Pakistan themes",
      "Geography of Pakistan themes",
      "Source-based and structured question technique",
    ],
    learningOutcomes: [
      "Confident recall of key themes",
      "Strong exam answer technique",
    ],
    classModel: [
      { title: "Live lesson", durationMins: 90, type: "concept", cadence: "Weekly" },
      { title: "Revision / past-paper session", durationMins: 60, type: "revision", cadence: "As needed" },
    ],
    assessmentApproach:
      "Regular review questions and monthly assessments to track progress.",
    instructorId: "ibrahim",
  },
];

/**
 * Pricing schedules. Exactly one per program should be `active: true`.
 * Founding pricing is active now; standard pricing is defined but inactive.
 * The admin/developer controls the switch — pricing is NOT auto-changed.
 */
export const PRICING_SCHEDULES: PricingSchedule[] = [
  {
    id: "o-level-founding",
    label: "Founding cohort",
    currency: "PKR",
    active: true,
    note: "Lock in founder pricing while continuously enrolled.",
    tiers: [
      { subjects: 1, price: 10000 },
      { subjects: 2, price: 18000 },
      { subjects: 3, price: 24000 },
      { subjects: 4, price: 29000 },
      { subjects: 5, price: 34000 },
    ],
  },
  {
    id: "o-level-standard",
    label: "Standard",
    currency: "PKR",
    active: false,
    note: "Future standard pricing — not currently active.",
    tiers: [
      { subjects: 1, price: 12500 },
      { subjects: 2, price: 22000 },
      { subjects: 3, price: 30000 },
      { subjects: 4, price: 36000 },
      { subjects: 5, price: 42000 },
    ],
  },
];

export const TRACKS: Track[] = [
  {
    id: "core-academic",
    name: "Core Academic Track",
    description: "The essentials for a strong academic foundation.",
    subjectSlugs: ["mathematics", "english-language"],
  },
  {
    id: "tech-track",
    name: "Tech Track",
    description: "For students aiming at computing and engineering pathways.",
    subjectSlugs: ["mathematics", "computer-science"],
  },
  {
    id: "o-level-core-pakistan",
    name: "O Level Core Pakistan Track",
    description: "Compulsory-core subjects for students in Pakistan.",
    subjectSlugs: ["english-language", "islamiyat", "pakistan-studies"],
  },
  {
    id: "engineering-cs",
    name: "Engineering / CS Track",
    description: "Future track as science subjects launch.",
    subjectSlugs: ["mathematics", "computer-science"],
    future: true,
  },
];

export const COHORTS: Cohort[] = [
  {
    id: "olevel-math-mj2027",
    program: "o-level",
    subjectSlug: "mathematics",
    instructorId: "ibrahim",
    targetExam: "May/June 2027",
    scheduleLabel: "Weekly concept class + weekly workshop",
    status: "enrolling",
    capacity: 20,
    enrolled: 0,
  },
  {
    id: "olevel-cs-mj2027",
    program: "o-level",
    subjectSlug: "computer-science",
    instructorId: "ibrahim",
    targetExam: "May/June 2027",
    scheduleLabel: "Weekly concept class + weekly practical workshop",
    status: "enrolling",
    capacity: 20,
    enrolled: 0,
  },
  {
    id: "olevel-english-mj2027",
    program: "o-level",
    subjectSlug: "english-language",
    instructorId: "ibrahim",
    targetExam: "May/June 2027",
    scheduleLabel: "Weekly concept class + weekly writing workshop",
    status: "enrolling",
    capacity: 20,
    enrolled: 0,
  },
  {
    id: "olevel-islamiyat-mj2027",
    program: "o-level",
    subjectSlug: "islamiyat",
    instructorId: "ibrahim",
    targetExam: "May/June 2027",
    scheduleLabel: "Weekly live lesson + revision sessions",
    status: "enrolling",
    capacity: 20,
    enrolled: 0,
  },
  {
    id: "olevel-pakstudies-mj2027",
    program: "o-level",
    subjectSlug: "pakistan-studies",
    instructorId: "ibrahim",
    targetExam: "May/June 2027",
    scheduleLabel: "Weekly live lesson + revision sessions",
    status: "enrolling",
    capacity: 20,
    enrolled: 0,
  },
];

export const OFFICE_HOURS: OfficeHoursInfo = {
  headline: "Open Office Hours",
  blurb:
    "Students should not have to wait until the next scheduled class when they are confused. Join live office hours to get unstuck.",
  canDo: [
    "Ask questions",
    "Review homework",
    "Get help with difficult concepts",
    "Work through past-paper questions",
    "Clarify mistakes",
    "Prepare for assessments",
  ],
  staffing:
    "Initially led by Ibrahim; the model supports teacher-led and TA-led rooms, multiple subject rooms, and breakout sessions as we grow.",
};

// ---- Helpers -------------------------------------------------------------

export function getActivePricing(): PricingSchedule {
  return (
    PRICING_SCHEDULES.find((s) => s.active) ?? PRICING_SCHEDULES[0]
  );
}

export function getInstructor(id: string): Instructor | undefined {
  return INSTRUCTORS.find((i) => i.id === id);
}

export function getSubject(slug: string): Subject | undefined {
  return SUBJECTS.find((s) => s.slug === slug);
}

export function getOLevelSubjects(): Subject[] {
  return SUBJECTS.filter((s) => s.program === "o-level");
}

export function getCohortForSubject(slug: string): Cohort | undefined {
  return COHORTS.find((c) => c.subjectSlug === slug);
}

export function formatPrice(currency: string, price: number): string {
  return `${currency} ${price.toLocaleString("en-US")}`;
}
